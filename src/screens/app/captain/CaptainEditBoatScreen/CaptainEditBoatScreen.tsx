import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, PhotoPicker, ScreenHeader} from '@components';
import {apiImageSource} from '@api/config';

import {useCaptainEditBoat, BOAT_TYPES} from './useCaptainEditBoat';

function isPdfUrl(url: string) {
  return url.toLowerCase().includes('.pdf');
}

export function CaptainEditBoatScreen() {
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
    handleRemoveSavedPhoto,
    handleRemoveSavedDocPhoto,
    goBack,
  } = useCaptainEditBoat();

  if (isLoadingBoat) {
    return (
      <Box flex={1} backgroundColor="background" alignItems="center" justifyContent="center">
        <ActivityIndicator size="large" color="#0a6fbd" />
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Box flex={1} backgroundColor="background">
        <ScreenHeader title="Editar Embarcação" onBack={goBack} />

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
                <Text preset="paragraphCaptionSmall" color="danger" mt="s8">
                  Corrija os documentos abaixo e salve para reenviar para análise.
                </Text>
              </Box>
            </Box>
          )}

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
                  <Text preset="paragraphMedium" color="text" ml="s12">{t}</Text>
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

          {/* ── Fotos da embarcação ────────────────────────────────────── */}
          <Text preset="paragraphMedium" color="text" bold mb="s8">
            Fotos da Embarcação
          </Text>

          {/* Galeria de fotos já salvas */}
          {savedPhotos.length > 0 && (
            <Box mb="s12">
              <Text preset="paragraphSmall" color="textSecondary" mb="s8">
                {`${savedPhotos.length} foto${savedPhotos.length > 1 ? 's' : ''} enviada${savedPhotos.length > 1 ? 's' : ''}`}
              </Text>
              <Box flexDirection="row" flexWrap="wrap" gap="s8">
                {savedPhotos.map((url, index) => (
                  <Box
                    key={`${url}-${index}`}
                    width={88}
                    height={88}
                    borderRadius="s8"
                    overflow="hidden"
                    style={{position: 'relative'}}>
                    <Image
                      source={apiImageSource(url)}
                      style={{width: 88, height: 88}}
                      resizeMode="cover"
                    />
                    {/* Botão remover */}
                    <TouchableOpacityBox
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => handleRemoveSavedPhoto(index)}>
                      <Icon name="close" size={14} color={'#fff' as any} />
                    </TouchableOpacityBox>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* PhotoPicker para novas fotos */}
          <Box mb="s20">
            <PhotoPicker
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={Math.max(0, 10 - savedPhotos.length)}
              description={
                savedPhotos.length > 0
                  ? 'Adicione mais fotos para complementar'
                  : 'Adicione fotos da embarcação'
              }
            />
          </Box>

          {/* ── Documentos da embarcação ──────────────────────────────── */}
          <Text preset="paragraphMedium" color="text" bold mb="s8">
            Documentos da Embarcação
          </Text>
          <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s8">
            Licença, registro, DPEM etc. Aceita imagens e PDF.
          </Text>

          {/* Galeria de documentos já salvos */}
          {savedDocPhotos.length > 0 && (
            <Box mb="s12">
              <Text preset="paragraphSmall" color="textSecondary" mb="s8">
                {`${savedDocPhotos.length} documento${savedDocPhotos.length > 1 ? 's' : ''} enviado${savedDocPhotos.length > 1 ? 's' : ''}`}
              </Text>
              <Box flexDirection="row" flexWrap="wrap" gap="s8">
                {savedDocPhotos.map((url, index) => (
                  <Box
                    key={`${url}-${index}`}
                    width={88}
                    height={88}
                    borderRadius="s8"
                    borderWidth={1}
                    borderColor="border"
                    overflow="hidden"
                    backgroundColor="surface"
                    style={{position: 'relative'}}>
                    {isPdfUrl(url) ? (
                      <Box
                        flex={1}
                        alignItems="center"
                        justifyContent="center"
                        gap="s4">
                        <Icon name="picture-as-pdf" size={32} color={'#DC2626' as any} />
                        <Text preset="paragraphCaptionSmall" color="textSecondary">
                          PDF
                        </Text>
                      </Box>
                    ) : (
                      <Image
                        source={apiImageSource(url)}
                        style={{width: 88, height: 88}}
                        resizeMode="cover"
                      />
                    )}
                    {/* Botão remover */}
                    <TouchableOpacityBox
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => handleRemoveSavedDocPhoto(index)}>
                      <Icon name="close" size={14} color={'#fff' as any} />
                    </TouchableOpacityBox>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* PhotoPicker para novos documentos */}
          <Box mb="s20">
            <PhotoPicker
              photos={docPhotos}
              onPhotosChange={setDocPhotos}
              maxPhotos={Math.max(0, 5 - savedDocPhotos.length)}
              allowPdf
              description={
                savedDocPhotos.length > 0
                  ? 'Ao adicionar novos documentos, a embarcação volta para análise'
                  : 'Adicione os documentos da embarcação'
              }
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
