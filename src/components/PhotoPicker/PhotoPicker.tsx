import React from 'react';
import {Image, Alert} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';

interface PhotoPickerProps {
  photos: Array<{uri: string; type: string; name: string}>;
  onPhotosChange: (photos: Array<{uri: string; type: string; name: string}>) => void;
  maxPhotos?: number;
}

export function PhotoPicker({
  photos,
  onPhotosChange,
  maxPhotos = 5,
}: PhotoPickerProps) {
  const handlePickPhoto = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limite Atingido', `Você pode adicionar no máximo ${maxPhotos} fotos`);
      return;
    }

    Alert.alert(
      'Adicionar Foto',
      'Escolha uma opção',
      [
        {
          text: 'Câmera',
          onPress: () => openCamera(),
        },
        {
          text: 'Galeria',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
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

      if (result.didCancel) {
        return;
      }

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
    } catch (error) {
      console.error('Error opening camera:', error);
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

      if (result.didCancel) {
        return;
      }

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
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria');
    }
  };

  const addPhoto = (photo: {uri: string; type: string; name: string}) => {
    onPhotosChange([...photos, photo]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <Box>
      <Text preset="paragraphMedium" color="text" bold mb="s8">
        Fotos da Encomenda (Opcional)
      </Text>
      <Text preset="paragraphSmall" color="textSecondary" mb="s12">
        Tire fotos da encomenda para referência. Máximo {maxPhotos} fotos.
      </Text>

      {/* Grid de fotos */}
      <Box flexDirection="row" flexWrap="wrap" gap="s12" mb="s12">
        {photos.map((photo, index) => (
          <Box
            key={index}
            width={100}
            height={100}
            borderRadius="s12"
            backgroundColor="background"
            style={{position: 'relative'}}>
            <Image
              source={{uri: photo.uri}}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
            {/* Botão remover */}
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
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}>
              <Icon name="close" size={16} color="white" />
            </TouchableOpacityBox>
          </Box>
        ))}

        {/* Botão adicionar foto */}
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
            <Icon name="add-a-photo" size={32} color="textSecondary" />
            <Text preset="paragraphSmall" color="textSecondary" mt="s4">
              Adicionar
            </Text>
          </TouchableOpacityBox>
        )}
      </Box>

      {/* Contador */}
      <Text preset="paragraphSmall" color="textSecondary">
        {photos.length} de {maxPhotos} fotos
      </Text>
    </Box>
  );
}
