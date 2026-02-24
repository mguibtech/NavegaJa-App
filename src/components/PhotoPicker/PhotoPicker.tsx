import React, {useState} from 'react';
import {Image, Alert, Modal} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {pickDocument, isDocumentPickerCancelled} from '../../native/documentPicker';

interface PhotoPickerProps {
  photos: Array<{uri: string; type: string; name: string}>;
  onPhotosChange: (photos: Array<{uri: string; type: string; name: string}>) => void;
  maxPhotos?: number;
  label?: string;
  description?: string;
  allowPdf?: boolean;
}

export function PhotoPicker({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  label = 'Fotos da Encomenda (Opcional)',
  description,
  allowPdf = false,
}: PhotoPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handlePickPhoto = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limite Atingido', `Você pode adicionar no máximo ${maxPhotos} arquivos`);
      return;
    }
    setShowPicker(true);
  };

  const handleOption = (option: 'camera' | 'gallery' | 'pdf') => {
    setShowPicker(false);
    if (option === 'camera') {openCamera();}
    else if (option === 'gallery') {openGallery();}
    else {openPdf();}
  };

  const openCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        includeBase64: false,
        cameraType: 'back',
      });

      if (result.didCancel) {return;}

      if (result.errorCode) {
        Alert.alert('Erro', result.errorMessage || 'Não foi possível acessar a câmera');
        return;
      }

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        addPhoto({
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `photo_${Date.now()}.jpg`,
        });
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir a câmera');
    }
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        includeBase64: false,
        selectionLimit: maxPhotos - photos.length,
      });

      if (result.didCancel) {return;}

      if (result.errorCode) {
        Alert.alert('Erro', result.errorMessage || 'Não foi possível acessar a galeria');
        return;
      }

      if (result.assets) {
        const newPhotos = result.assets.map(asset => ({
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `photo_${Date.now()}.jpg`,
        }));
        onPhotosChange([...photos, ...newPhotos]);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir a galeria');
    }
  };

  const openPdf = async () => {
    try {
      const result = await pickDocument(['application/pdf']);
      addPhoto({
        uri: result.uri,
        type: result.type || 'application/pdf',
        name: result.name || `document_${Date.now()}.pdf`,
      });
    } catch (error) {
      if (!isDocumentPickerCancelled(error)) {
        Alert.alert('Erro', 'Não foi possível selecionar o PDF');
      }
    }
  };

  const addPhoto = (photo: {uri: string; type: string; name: string}) => {
    onPhotosChange([...photos, photo]);
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const isPdf = (item: {type: string}) =>
    item.type === 'application/pdf' || item.type?.includes('pdf');

  return (
    <Box>
      <Text preset="paragraphMedium" color="text" bold mb="s8">
        {label}
      </Text>
      <Text preset="paragraphSmall" color="textSecondary" mb="s12">
        {description ?? `Tire fotos para referência. Máximo ${maxPhotos} ${allowPdf ? 'arquivos' : 'fotos'}.`}
      </Text>

      {/* Grid de fotos/documentos */}
      <Box flexDirection="row" flexWrap="wrap" gap="s12" mb="s12">
        {photos.map((photo, index) => (
          <Box
            key={index}
            width={100}
            height={100}
            borderRadius="s12"
            backgroundColor="background"
            style={{position: 'relative'}}>
            {isPdf(photo) ? (
              <Box
                width={100}
                height={100}
                borderRadius="s12"
                backgroundColor="primaryBg"
                alignItems="center"
                justifyContent="center"
                style={{borderWidth: 1, borderColor: '#BFDBFE'}}>
                <Icon name="picture-as-pdf" size={32} color={'#DC2626' as any} />
                <Text
                  preset="paragraphCaptionSmall"
                  color="primary"
                  mt="s4"
                  numberOfLines={1}
                  style={{maxWidth: 80, textAlign: 'center'}}>
                  PDF
                </Text>
              </Box>
            ) : (
              <Image
                source={{uri: photo.uri}}
                style={{width: '100%', height: '100%', borderRadius: 12}}
                resizeMode="cover"
              />
            )}
            <TouchableOpacityBox
              onPress={() => removePhoto(index)}
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#DC3545',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 4,
              }}>
              <Icon name="close" size={16} color="white" />
            </TouchableOpacityBox>
          </Box>
        ))}

        {/* Botão adicionar */}
        {photos.length < maxPhotos && (
          <TouchableOpacityBox
            onPress={handlePickPhoto}
            width={100}
            height={100}
            borderRadius="s12"
            borderWidth={2}
            borderColor="border"
            borderStyle="dashed"
            alignItems="center"
            justifyContent="center"
            backgroundColor="background">
            <Icon name={allowPdf ? 'upload-file' : 'add-a-photo'} size={32} color="textSecondary" />
            <Text preset="paragraphSmall" color="textSecondary" mt="s4">
              Adicionar
            </Text>
          </TouchableOpacityBox>
        )}
      </Box>

      {/* Contador */}
      <Text preset="paragraphSmall" color="textSecondary">
        {photos.length} de {maxPhotos} {allowPdf ? 'arquivos' : 'fotos'}
      </Text>

      {/* Bottom sheet — seleção */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}>
        <TouchableOpacityBox
          flex={1}
          style={{backgroundColor: 'rgba(0,0,0,0.45)'}}
          onPress={() => setShowPicker(false)}
          activeOpacity={1}
        />
        <Box
          backgroundColor="surface"
          borderTopLeftRadius="s24"
          borderTopRightRadius="s24"
          paddingHorizontal="s20"
          paddingTop="s20"
          paddingBottom="s24"
          style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
          {/* Handle */}
          <Box
            alignSelf="center"
            width={40}
            height={4}
            borderRadius="s8"
            backgroundColor="border"
            mb="s20"
          />
          <Text preset="paragraphMedium" color="text" bold mb="s4">
            {allowPdf ? 'Adicionar arquivo' : 'Adicionar foto'}
          </Text>
          <Text preset="paragraphSmall" color="textSecondary" mb="s20">
            Escolha como enviar
          </Text>

          {/* Câmera */}
          <TouchableOpacityBox
            onPress={() => handleOption('camera')}
            flexDirection="row"
            alignItems="center"
            paddingVertical="s16"
            borderBottomWidth={1}
            borderBottomColor="border">
            <Box
              width={44}
              height={44}
              borderRadius="s12"
              backgroundColor="primaryBg"
              alignItems="center"
              justifyContent="center"
              mr="s16">
              <Icon name="photo-camera" size={22} color="primary" />
            </Box>
            <Box flex={1}>
              <Text preset="paragraphMedium" color="text" bold>
                Câmera
              </Text>
              <Text preset="paragraphSmall" color="textSecondary">
                Fotografar agora
              </Text>
            </Box>
            <Icon name="chevron-right" size={20} color="textSecondary" />
          </TouchableOpacityBox>

          {/* Galeria */}
          <TouchableOpacityBox
            onPress={() => handleOption('gallery')}
            flexDirection="row"
            alignItems="center"
            paddingVertical="s16"
            borderBottomWidth={allowPdf ? 1 : 0}
            borderBottomColor="border">
            <Box
              width={44}
              height={44}
              borderRadius="s12"
              backgroundColor="primaryBg"
              alignItems="center"
              justifyContent="center"
              mr="s16">
              <Icon name="photo-library" size={22} color="primary" />
            </Box>
            <Box flex={1}>
              <Text preset="paragraphMedium" color="text" bold>
                Galeria
              </Text>
              <Text preset="paragraphSmall" color="textSecondary">
                Selecionar da galeria
              </Text>
            </Box>
            <Icon name="chevron-right" size={20} color="textSecondary" />
          </TouchableOpacityBox>

          {/* PDF — apenas quando allowPdf */}
          {allowPdf && (
            <TouchableOpacityBox
              onPress={() => handleOption('pdf')}
              flexDirection="row"
              alignItems="center"
              paddingVertical="s16"
              mb="s8">
              <Box
                width={44}
                height={44}
                borderRadius="s12"
                alignItems="center"
                justifyContent="center"
                mr="s16"
                style={{backgroundColor: '#FEE2E2'}}>
                <Icon name="picture-as-pdf" size={22} color={'#DC2626' as any} />
              </Box>
              <Box flex={1}>
                <Text preset="paragraphMedium" color="text" bold>
                  Arquivo PDF
                </Text>
                <Text preset="paragraphSmall" color="textSecondary">
                  Selecionar PDF do armazenamento
                </Text>
              </Box>
              <Icon name="chevron-right" size={20} color="textSecondary" />
            </TouchableOpacityBox>
          )}

          {/* Cancelar */}
          <TouchableOpacityBox
            onPress={() => setShowPicker(false)}
            backgroundColor="background"
            borderRadius="s12"
            paddingVertical="s16"
            alignItems="center">
            <Text preset="paragraphMedium" color="textSecondary" bold>
              Cancelar
            </Text>
          </TouchableOpacityBox>
        </Box>
      </Modal>
    </Box>
  );
}
