import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, PhotoPicker} from '@components';

import {useCaptainEditBoat, BOAT_TYPES} from './useCaptainEditBoat';

export function CaptainEditBoatScreen() {
  const {top} = useSafeAreaInsets();
  const {
    isLoadingBoat,
    isSaving,
    isBusy,
    uploadLabel,
    name,
    setName,
    type,
    setType,
    capacity,
    setCapacity,
    registrationNum,
    setRegistrationNum,
    showTypePicker,
    setShowTypePicker,
    photos,
    setPhotos,
    docPhotos,
    setDocPhotos,
    savedPhotos,
    savedDocPhotos,
    rejectionReason,
    handleSubmit,
    goBack,
  } = useCaptainEditBoat();

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
              onPress={goBack}
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
              allowPdf
              label="Documentos da Embarcação"
              description={`Licença, registro, DPEM etc. Aceita imagens e PDF. ${savedDocPhotos.length} documento(s) já enviado(s). Ao adicionar novos documentos, a embarcação volta para análise.`}
            />
          </Box>

          <Button
            title={uploadLabel || (isSaving ? 'Salvando...' : 'Salvar Alterações')}
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
