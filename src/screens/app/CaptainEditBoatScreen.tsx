import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, PhotoPicker} from '@components';
import {useUpdateBoat, getBoatByIdUseCase} from '@domain';
import {useToast} from '@hooks';
import {api} from '@api';
import {API_BASE_URL} from '../../api/config';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainEditBoat'>;
type PhotoItem = {uri: string; type: string; name: string};

const BOAT_TYPES = [
  'Lancha',
  'Barco regional',
  'Barco de linha',
  'Canoa motorizada',
  'Ferry',
  'Outro',
];

export function CaptainEditBoatScreen({navigation, route}: Props) {
  const {boatId} = route.params;
  const {top} = useSafeAreaInsets();
  const toast = useToast();
  const {updateBoat, isLoading: isSaving} = useUpdateBoat();

  const [isLoadingBoat, setIsLoadingBoat] = useState(true);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [registrationNum, setRegistrationNum] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Fotos da galeria (photos[]) — novos picks pelo usuário
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  // Documentos (documentPhotos[]) — novos picks pelo usuário
  const [docPhotos, setDocPhotos] = useState<PhotoItem[]>([]);
  // URLs já salvas no backend (exibição)
  const [savedPhotos, setSavedPhotos] = useState<string[]>([]);
  const [savedDocPhotos, setSavedDocPhotos] = useState<string[]>([]);

  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  useEffect(() => {
    loadBoat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boatId]);

  async function loadBoat() {
    setIsLoadingBoat(true);
    try {
      const boat = await getBoatByIdUseCase(boatId);
      setName(boat.name);
      setType(boat.type);
      setCapacity(String(boat.capacity));
      setRegistrationNum(boat.registrationNum ?? '');
      setSavedPhotos(boat.photos ?? []);
      setSavedDocPhotos(boat.documentPhotos ?? []);
      setRejectionReason(boat.rejectionReason ?? null);
    } catch {
      toast.showError('Não foi possível carregar os dados da embarcação');
      navigation.goBack();
    } finally {
      setIsLoadingBoat(false);
    }
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

  async function uploadPhotos(items: PhotoItem[], folder: string): Promise<string[]> {
    return Promise.all(
      items.map(async photo => {
        const formData = new FormData();
        formData.append('file', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.name || 'photo.jpg',
        } as any);
        const res = await api.upload<{url: string}>(
          `/upload/image?folder=${folder}`,
          formData,
        );
        return res.url.startsWith('http')
          ? res.url
          : `${API_BASE_URL}${res.url}`;
      }),
    );
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      toast.showError(validationError);
      return;
    }

    try {
      // Upload das novas fotos em paralelo
      const [newPhotoUrls, newDocUrls] = await Promise.all([
        photos.length > 0 ? uploadPhotos(photos, 'boats') : Promise.resolve([]),
        docPhotos.length > 0 ? uploadPhotos(docPhotos, 'boats') : Promise.resolve([]),
      ]);

      await updateBoat(boatId, {
        name: name.trim(),
        type: type.trim(),
        capacity: Number(capacity),
        registrationNum: registrationNum.trim().toUpperCase(),
        photos: [...savedPhotos, ...newPhotoUrls],
        documentPhotos: [...savedDocPhotos, ...newDocUrls],
      });

      toast.showSuccess('Embarcação atualizada com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao atualizar embarcação');
    }
  }

  if (isLoadingBoat) {
    return (
      <Box
        flex={1}
        backgroundColor="background"
        alignItems="center"
        justifyContent="center">
        <ActivityIndicator size="large" color="#0a6fbd" />
      </Box>
    );
  }

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
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="center">
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
              Editar Embarcação
            </Text>
          </Box>
        </Box>

        <ScrollView
          contentContainerStyle={{padding: 20, paddingBottom: 120}}
          keyboardShouldPersistTaps="handled">

          {/* Banner de rejeição */}
          {rejectionReason && (
            <Box
              backgroundColor="dangerBg"
              borderRadius="s12"
              padding="s16"
              mb="s16"
              flexDirection="row"
              alignItems="flex-start">
              <Icon name="error-outline" size={20} color="danger" />
              <Box flex={1} ml="s12">
                <Text preset="paragraphSmall" color="danger" bold mb="s4">
                  Embarcação rejeitada
                </Text>
                <Text preset="paragraphSmall" color="danger">
                  {rejectionReason}
                </Text>
                <Text
                  preset="paragraphCaptionSmall"
                  color="danger"
                  mt="s8">
                  Corrija os documentos abaixo e salve para reenviar para análise.
                </Text>
              </Box>
            </Box>
          )}

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
                    name={
                      type === t
                        ? 'check-circle'
                        : 'radio-button-unchecked'
                    }
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

          <Box mb="s12">
            <TextInput
              placeholder="Capacidade de passageiros"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
              leftIcon="event-seat"
            />
          </Box>

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
              maxPhotos={Math.max(0, 10 - savedPhotos.length)}
              label="Fotos da Embarcação"
              description={`${savedPhotos.length} foto(s) já salva(s). Adicione mais para complementar.`}
            />
          </Box>

          {/* Documentos da embarcação */}
          <Box mb="s20">
            <PhotoPicker
              photos={docPhotos}
              onPhotosChange={setDocPhotos}
              maxPhotos={Math.max(0, 5 - savedDocPhotos.length)}
              label="Documentos da Embarcação"
              description={`Licença, registro, DPEM etc. ${savedDocPhotos.length} documento(s) já enviado(s). Ao adicionar novos documentos, a embarcação volta para análise.`}
            />
          </Box>

          <Button
            title={isSaving ? 'Salvando...' : 'Salvar Alterações'}
            onPress={handleSubmit}
            disabled={isSaving}
          />
          {isSaving && (
            <Box alignItems="center" mt="s16">
              <ActivityIndicator size="small" color="#0a6fbd" />
            </Box>
          )}
        </ScrollView>
      </Box>
    </KeyboardAvoidingView>
  );
}
