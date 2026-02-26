import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, PhotoPicker, ScreenHeader} from '@components';

import {useCaptainCreateBoat, BOAT_TYPES} from './useCaptainCreateBoat';

export function CaptainCreateBoatScreen() {
  const {
    canOperate,
    isPending,
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
    uploadLabel,
    isLoading,
    isBusy,
    handleSubmit,
    goBack,
    navigateToEditProfile,
  } = useCaptainCreateBoat();

  // Guard: bloqueia se capabilities existem e canOperate=false
  if (!canOperate) {
    return (
      <Box flex={1} backgroundColor="background">
        <ScreenHeader title="Nova Embarcação" onBack={goBack} />
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
              onPress={navigateToEditProfile}
              style={{marginTop: 32}}
            />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Box flex={1} backgroundColor="background">
        <ScreenHeader title="Nova Embarcação" onBack={goBack} />

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
