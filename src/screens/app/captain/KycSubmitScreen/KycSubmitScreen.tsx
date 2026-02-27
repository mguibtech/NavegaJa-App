import React, {useState} from 'react';
import {ScrollView, Alert} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Box, Button, Icon, PhotoPicker, Text, TextInput, TouchableOpacityBox} from '@components';
import {useKycSubmit} from '@domain';
import {useToast} from '@hooks';
import {api} from '@api';

import {CaptainStackParamList} from '@routes';

type Photo = {uri: string; type: string; name: string};

async function uploadPhoto(photo: Photo): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri: photo.uri,
    type: photo.type,
    name: photo.name,
  } as any);
  const result = await api.upload<{url: string}>('/upload/image', formData);
  return result.url;
}

export function KycSubmitScreen() {
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<CaptainStackParamList>>();
  const route = useRoute<RouteProp<CaptainStackParamList, 'KycSubmit'>>();
  const isRejected = route.params?.rejected ?? false;
  const rejectionReason = route.params?.reason;
  const toast = useToast();
  const {submit, isLoading} = useKycSubmit();

  const [selfiePhotos, setSelfiePhotos] = useState<Photo[]>([]);
  const [licensePhotos, setLicensePhotos] = useState<Photo[]>([]);
  const [certificatePhotos, setCertificatePhotos] = useState<Photo[]>([]);
  const [rnaqNumber, setRnaqNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const isBusy = isLoading || isUploading;

  async function handleSubmit() {
    if (selfiePhotos.length === 0) {
      Alert.alert('Selfie obrigatória', 'Tire uma foto sua segurando o documento de identidade.');
      return;
    }
    if (licensePhotos.length === 0) {
      Alert.alert('Habilitação obrigatória', 'Envie uma foto da sua licença náutica (Arrais-Amador ou superior).');
      return;
    }

    try {
      setIsUploading(true);

      // 1. Upload selfie
      const selfieUrl = await uploadPhoto(selfiePhotos[0]);

      // 2. Upload licença náutica
      const licensePhotoUrl = await uploadPhoto(licensePhotos[0]);

      // 3. Upload certificado (opcional)
      let certificatePhotoUrl: string | undefined;
      if (certificatePhotos.length > 0) {
        certificatePhotoUrl = await uploadPhoto(certificatePhotos[0]);
      }

      setIsUploading(false);

      // 4. Envia KYC com as URLs do servidor
      await submit({
        selfieUrl,
        licensePhotoUrl,
        certificatePhotoUrl,
        rnaqNumber: rnaqNumber.trim() || undefined,
      });

      toast.showSuccess('Documentos enviados! Aguarde a análise.');
      navigation.navigate('KycStatus');
    } catch (err: any) {
      setIsUploading(false);
      toast.showError(err?.message || 'Erro ao enviar documentos');
    }
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s20"
        paddingBottom="s16"
        backgroundColor="secondary"
        style={{paddingTop: top + 16}}>
        <TouchableOpacityBox onPress={() => navigation.goBack()} mb="s12">
          <Icon name="arrow-back" size={24} color={'#FFFFFF' as any} />
        </TouchableOpacityBox>
        <Text preset="headingMedium" bold style={{color: '#FFFFFF'}}>
          {isRejected ? 'Reenviar Documentos' : 'Verificação de Capitão'}
        </Text>
        <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.8)'}} mt="s4">
          Verificação obrigatória para criar viagens
        </Text>
      </Box>

      <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 40}}>
        {/* Rejection reason */}
        {isRejected && rejectionReason && (
          <Box
            backgroundColor="dangerBg"
            borderRadius="s12"
            padding="s16"
            mb="s20"
            borderLeftWidth={4}
            borderLeftColor="danger"
            flexDirection="row"
            alignItems="flex-start">
            <Icon name="cancel" size={20} color="danger" />
            <Box flex={1} ml="s12">
              <Text preset="paragraphMedium" color="danger" bold>
                Motivo da rejeição
              </Text>
              <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                {rejectionReason}
              </Text>
            </Box>
          </Box>
        )}

        {/* Instructions */}
        <Box
          backgroundColor="infoBg"
          borderRadius="s12"
          padding="s16"
          mb="s24"
          flexDirection="row"
          alignItems="flex-start">
          <Icon name="info" size={20} color="info" />
          <Box flex={1} ml="s12">
            <Text preset="paragraphMedium" color="text" bold>
              Documentos necessários
            </Text>
            <Text preset="paragraphSmall" color="textSecondary" mt="s6">
              1. Selfie segurando o RG/CNH (frente){'\n'}
              2. Licença náutica (Arrais-Amador ou superior){'\n'}
              3. Certificado de segurança (opcional)
            </Text>
          </Box>
        </Box>

        {/* Selfie */}
        <Box mb="s24">
          <Box flexDirection="row" alignItems="center" mb="s12">
            <Box
              width={32}
              height={32}
              borderRadius="s16"
              backgroundColor="secondaryBg"
              alignItems="center"
              justifyContent="center"
              mr="s8">
              <Text preset="paragraphMedium" color="secondary" bold>1</Text>
            </Box>
            <Text preset="paragraphMedium" color="text" bold>
              Selfie com documento <Text preset="paragraphMedium" color="danger" bold>*</Text>
            </Text>
          </Box>
          <PhotoPicker photos={selfiePhotos} onPhotosChange={setSelfiePhotos} maxPhotos={1} />
        </Box>

        {/* License */}
        <Box mb="s24">
          <Box flexDirection="row" alignItems="center" mb="s12">
            <Box
              width={32}
              height={32}
              borderRadius="s16"
              backgroundColor="secondaryBg"
              alignItems="center"
              justifyContent="center"
              mr="s8">
              <Text preset="paragraphMedium" color="secondary" bold>2</Text>
            </Box>
            <Text preset="paragraphMedium" color="text" bold>
              Licença náutica <Text preset="paragraphMedium" color="danger" bold>*</Text>
            </Text>
          </Box>
          <PhotoPicker photos={licensePhotos} onPhotosChange={setLicensePhotos} maxPhotos={1} />
        </Box>

        {/* RNAQ Number */}
        <Box mb="s24">
          <Text preset="paragraphMedium" color="text" bold mb="s8">
            Número da habilitação (RNAQ)
          </Text>
          <TextInput
            placeholder="Ex: AM-12345-A"
            value={rnaqNumber}
            onChangeText={setRnaqNumber}
            autoCapitalize="characters"
          />
        </Box>

        {/* Certificate (optional) */}
        <Box mb="s32">
          <Box flexDirection="row" alignItems="center" mb="s12">
            <Box
              width={32}
              height={32}
              borderRadius="s16"
              backgroundColor="border"
              alignItems="center"
              justifyContent="center"
              mr="s8">
              <Text preset="paragraphMedium" color="textSecondary" bold>3</Text>
            </Box>
            <Box>
              <Text preset="paragraphMedium" color="text" bold>
                Certificado de segurança
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary">
                Opcional
              </Text>
            </Box>
          </Box>
          <PhotoPicker photos={certificatePhotos} onPhotosChange={setCertificatePhotos} maxPhotos={1} />
        </Box>

        <Button
          title={isUploading ? 'Enviando fotos...' : isLoading ? 'Enviando...' : 'Enviar documentos'}
          onPress={handleSubmit}
          disabled={isBusy}
          loading={isBusy}
        />
      </ScrollView>
    </Box>
  );
}
