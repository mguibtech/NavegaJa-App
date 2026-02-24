import React, {useState} from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, PhotoPicker} from '@components';
import {useCreateBoat, updateBoatUseCase} from '@domain';
import {useToast} from '@hooks';
import {useAuthStore} from '@store';
import {api} from '@api';
import {normalizeFileUrl} from '../../api/config';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainCreateBoat'>;
type PhotoItem = {uri: string; type: string; name: string};

const BOAT_TYPES = [
  'Lancha',
  'Barco regional',
  'Barco de linha',
  'Canoa motorizada',
  'Ferry',
  'Outro',
];

export function CaptainCreateBoatScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const toast = useToast();
  const user = useAuthStore(s => s.user);
  const {createBoat, isLoading} = useCreateBoat();

  // Todos os hooks ANTES de qualquer return condicional (Rules of Hooks)
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [registrationNum, setRegistrationNum] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [docPhotos, setDocPhotos] = useState<PhotoItem[]>([]);
  const [uploadLabel, setUploadLabel] = useState('');

  const canOperate = !user?.capabilities || user.capabilities.canOperate;

  // Guard: bloqueia se capabilities existem e canOperate=false
  if (!canOperate) {
    const isPending = user?.capabilities?.pendingVerification ?? false;
    return (
      <Box flex={1} backgroundColor="background">
        <Box
          backgroundColor="surface"
          paddingHorizontal="s24"
          paddingBottom="s12"
          borderBottomWidth={1}
          borderBottomColor="border"
          style={{paddingTop: top + 12}}>
          <Box flexDirection="row" alignItems="center" justifyContent="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              onPress={() => navigation.goBack()}
              style={{position: 'absolute', left: 0}}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>
            <Text preset="headingSmall" color="text" bold>Nova Embarcação</Text>
          </Box>
        </Box>
        <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="s32">
          <Box
            width={80}
            height={80}
            borderRadius="s48"
            backgroundColor={isPending ? 'infoBg' : 'warningBg'}
            alignItems="center"
            justifyContent="center"
            mb="s24">
            <Icon name={isPending ? 'hourglass-top' : 'lock'} size={40} color={isPending ? 'info' : 'warning'} />
          </Box>
          <Text preset="headingSmall" color="text" bold mb="s12" style={{textAlign: 'center'}}>
            {isPending ? 'Conta em análise' : 'Conta pendente de verificação'}
          </Text>
          <Text preset="paragraphMedium" color="textSecondary" style={{textAlign: 'center'}}>
            {isPending
              ? 'Seus documentos estão sendo analisados. Em breve você poderá cadastrar embarcações.'
              : 'Envie sua habilitação náutica para começar a cadastrar embarcações.'}
          </Text>
          {!isPending && (
            <Button
              title="Enviar documentos"
              onPress={() => navigation.navigate('EditProfile')}
              style={{marginTop: 32}}
            />
          )}
        </Box>
      </Box>
    );
  }

  function validate(): string | null {
    if (!name.trim()) {return 'Informe o nome da embarcação';}
    if (!type.trim()) {return 'Selecione o tipo de embarcação';}
    if (!capacity.trim() || isNaN(Number(capacity)) || Number(capacity) < 1) {
      return 'Informe a capacidade de passageiros';
    }
    if (!registrationNum.trim()) {return 'Informe o número de registro';}
    return null;
  }

  // Upload sequencial para não sobrecarregar o servidor
  async function uploadImages(items: PhotoItem[]): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 0; i < items.length; i++) {
      setUploadLabel(`Enviando foto ${i + 1} de ${items.length}...`);
      const photo = items[i];
      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.name || 'photo.jpg',
      } as any);
      const res = await api.upload<{url: string}>('/upload/image?folder=boats', formData);
      urls.push(normalizeFileUrl(res.url));
    }
    return urls;
  }

  async function uploadDocuments(items: PhotoItem[]): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 0; i < items.length; i++) {
      setUploadLabel(`Enviando documento ${i + 1} de ${items.length}...`);
      const doc = items[i];
      const formData = new FormData();
      formData.append('file', {
        uri: doc.uri,
        type: doc.type || 'image/jpeg',
        name: doc.name || 'doc.jpg',
      } as any);
      const res = await api.upload<{url: string}>('/upload/document?folder=documents', formData);
      urls.push(normalizeFileUrl(res.url));
    }
    return urls;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      toast.showError(validationError);
      return;
    }

    try {
      const photoUrls = await uploadImages(photos);
      const docUrls = await uploadDocuments(docPhotos);

      // POST /boats não aceita documentPhotos — criar sem eles
      setUploadLabel('Cadastrando embarcação...');
      const boat = await createBoat({
        name: name.trim(),
        type: type.trim(),
        capacity: Number(capacity),
        registrationNum: registrationNum.trim().toUpperCase(),
        photos: photoUrls.length > 0 ? photoUrls : undefined,
      });

      // Se há documentos, adicionar via PATCH separado
      if (docUrls.length > 0) {
        setUploadLabel('Salvando documentos...');
        await updateBoatUseCase(boat.id, {documentPhotos: docUrls});
      }

      toast.showSuccess('Embarcação cadastrada com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      setUploadLabel('');
      if (err?.statusCode === 403) {
        toast.showError('Documentação em análise. Aguarde a aprovação para cadastrar embarcações.');
      } else {
        toast.showError(err?.message || 'Erro ao cadastrar embarcação');
      }
    }
  }

  const isBusy = isLoading || !!uploadLabel;

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Box flex={1} backgroundColor="background">
        {/* Header */}
        <Box
          backgroundColor="surface"
          paddingHorizontal="s24"
          paddingBottom="s12"
          borderBottomWidth={1}
          borderBottomColor="border"
          style={{paddingTop: top + 12}}>
          <Box flexDirection="row" alignItems="center" justifyContent="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              onPress={() => navigation.goBack()}
              style={{position: 'absolute', left: 0}}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>
            <Text preset="headingSmall" color="text" bold>
              Nova Embarcação
            </Text>
          </Box>
        </Box>

        <ScrollView
          contentContainerStyle={{padding: 20, paddingBottom: 120}}
          keyboardShouldPersistTaps="handled">
          {/* Informações básicas */}
          <Text preset="paragraphMedium" color="text" bold mb="s12">
            Informações básicas
          </Text>
          <Box mb="s12">
            <TextInput
              placeholder="Nome da embarcação"
              value={name}
              onChangeText={setName}
              leftIcon="sailing"
            />
          </Box>

          {/* Tipo */}
          <TouchableOpacityBox
            backgroundColor="surface"
            borderRadius="s12"
            borderWidth={1}
            borderColor={type ? 'secondary' : 'border'}
            padding="s16"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            mb="s4"
            onPress={() => setShowTypePicker(!showTypePicker)}>
            <Box flexDirection="row" alignItems="center" flex={1}>
              <Icon name="category" size={20} color="textSecondary" />
              <Text
                preset="paragraphMedium"
                color={type ? 'text' : 'textSecondary'}
                ml="s12">
                {type || 'Tipo de embarcação'}
              </Text>
            </Box>
            <Icon
              name={showTypePicker ? 'expand-less' : 'expand-more'}
              size={24}
              color="textSecondary"
            />
          </TouchableOpacityBox>

          {showTypePicker && (
            <Box
              backgroundColor="surface"
              borderRadius="s12"
              borderWidth={1}
              borderColor="border"
              mb="s12"
              overflow="hidden">
              {BOAT_TYPES.map((t, idx) => (
                <TouchableOpacityBox
                  key={t}
                  padding="s14"
                  flexDirection="row"
                  alignItems="center"
                  backgroundColor={type === t ? 'secondaryBg' : 'surface'}
                  borderTopWidth={idx > 0 ? 1 : 0}
                  borderTopColor="border"
                  onPress={() => {
                    setType(t);
                    setShowTypePicker(false);
                  }}>
                  <Icon
                    name={type === t ? 'check-circle' : 'radio-button-unchecked'}
                    size={20}
                    color={type === t ? 'secondary' : 'textSecondary'}
                  />
                  <Text preset="paragraphMedium" color="text" ml="s12">
                    {t}
                  </Text>
                </TouchableOpacityBox>
              ))}
            </Box>
          )}

          {/* Capacidade */}
          <Box mb="s12">
            <TextInput
              placeholder="Capacidade de passageiros"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
              leftIcon="event-seat"
            />
          </Box>

          {/* Registro */}
          <Box mb="s20">
            <TextInput
              placeholder="Número de registro"
              value={registrationNum}
              onChangeText={setRegistrationNum}
              autoCapitalize="characters"
              leftIcon="tag"
            />
          </Box>

          {/* Fotos da embarcação */}
          <Box mb="s20">
            <PhotoPicker
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={10}
              label="Fotos da Embarcação"
              description="Adicione fotos da embarcação para os passageiros. Máximo 10 fotos."
            />
          </Box>

          {/* Documentos */}
          <Box mb="s20">
            <PhotoPicker
              photos={docPhotos}
              onPhotosChange={setDocPhotos}
              maxPhotos={5}
              allowPdf
              label="Documentos da Embarcação"
              description="Licença, registro, DPEM etc. Aceita imagens e PDF. Máximo 5 arquivos."
            />
          </Box>

          {/* Submit */}
          <Button
            title={uploadLabel || (isLoading ? 'Cadastrando...' : 'Cadastrar Embarcação')}
            onPress={handleSubmit}
            disabled={isBusy}
          />
          {isBusy && (
            <Box alignItems="center" mt="s16">
              <ActivityIndicator size="small" color="#0a6fbd" />
            </Box>
          )}
        </ScrollView>
      </Box>
    </KeyboardAvoidingView>
  );
}
