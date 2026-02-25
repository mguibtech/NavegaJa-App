import React from 'react';
import {ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, InfoModal, PhotoPicker} from '@components';

import {useTripReviewScreen} from './useTripReviewScreen';

// Estrelas grandes — avaliação geral
function StarRating({
  value,
  onChange,
  label,
  optional,
}: {
  value: number;
  onChange: (val: number) => void;
  label: string;
  optional?: boolean;
}) {
  return (
    <Box mb="s16">
      <Box flexDirection="row" alignItems="center" mb="s10">
        <Text preset="paragraphMedium" color="text" bold flex={1}>
          {label}
        </Text>
        {optional && (
          <Box backgroundColor="border" paddingHorizontal="s8" paddingVertical="s4" style={{borderRadius: 6}}>
            <Text preset="paragraphCaptionSmall" color="textSecondary">
              Opcional
            </Text>
          </Box>
        )}
      </Box>
      <Box flexDirection="row" gap="s8">
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacityBox
            key={star}
            onPress={() => onChange(star === value && optional ? 0 : star)}
            padding="s4">
            <Icon
              name={star <= value ? 'star' : 'star-outline'}
              size={36}
              color={star <= value ? 'warning' : 'textSecondary'}
            />
          </TouchableOpacityBox>
        ))}
      </Box>
    </Box>
  );
}

// Estrelas pequenas — sub-avaliações de detalhe
function DetailRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (val: number) => void;
  label: string;
}) {
  return (
    <Box flexDirection="row" alignItems="center" mb="s12">
      <Text preset="paragraphSmall" color="textSecondary" flex={1}>
        {label}
      </Text>
      <Box flexDirection="row" gap="s4">
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacityBox
            key={star}
            onPress={() => onChange(star === value ? 0 : star)}
            style={{padding: 4}}>
            <Icon
              name={star <= value ? 'star' : 'star-outline'}
              size={22}
              color={star <= value ? 'warning' : 'border'}
            />
          </TouchableOpacityBox>
        ))}
      </Box>
    </Box>
  );
}

export function TripReviewScreen() {
  const {top} = useSafeAreaInsets();
  const {
    // Route params
    captainName,
    boatName,
    // State
    checking,
    canReview,
    alreadyReviewed,
    isSubmitting,
    // Captain fields
    captainRating,
    setCaptainRating,
    captainComment,
    setCaptainComment,
    punctualityRating,
    setPunctualityRating,
    communicationRating,
    setCommunicationRating,
    // Boat fields
    boatRating,
    setBoatRating,
    boatComment,
    setBoatComment,
    cleanlinessRating,
    setCleanlinessRating,
    comfortRating,
    setComfortRating,
    boatPhotos,
    setBoatPhotos,
    // Handlers
    handleSubmit,
    handleGoBack,
    // Modal states
    showCaptainRatingModal,
    setShowCaptainRatingModal,
    showErrorModal,
    handleErrorModalClose,
    errorMessage,
  } = useTripReviewScreen();

  if (checking) {
    return (
      <Box flex={1} backgroundColor="background" justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#0a6fbd" />
      </Box>
    );
  }

  if (alreadyReviewed) {
    return (
      <Box flex={1} backgroundColor="background">
        <Box paddingHorizontal="s20" paddingBottom="s16" backgroundColor="surface" style={{paddingTop: top + 16}}>
          <TouchableOpacityBox onPress={handleGoBack} mb="s16">
            <Icon name="arrow-back" size={24} color="text" />
          </TouchableOpacityBox>
          <Text preset="headingMedium" color="text" bold>Avaliar Viagem</Text>
        </Box>
        <Box flex={1} justifyContent="center" alignItems="center" padding="s32">
          <Icon name="check-circle" size={72} color="success" />
          <Text preset="headingMedium" color="text" bold mt="s24" textAlign="center">Já avaliado!</Text>
          <Text preset="paragraphMedium" color="textSecondary" mt="s12" textAlign="center">
            Você já enviou sua avaliação para esta viagem.
          </Text>
          <Button title="Voltar" onPress={handleGoBack} mt="s32" />
        </Box>
      </Box>
    );
  }

  if (!canReview) {
    return (
      <Box flex={1} backgroundColor="background">
        <Box paddingHorizontal="s20" paddingBottom="s16" backgroundColor="surface" style={{paddingTop: top + 16}}>
          <TouchableOpacityBox onPress={handleGoBack} mb="s16">
            <Icon name="arrow-back" size={24} color="text" />
          </TouchableOpacityBox>
          <Text preset="headingMedium" color="text" bold>Avaliar Viagem</Text>
        </Box>
        <Box flex={1} justifyContent="center" alignItems="center" padding="s32">
          <Icon name="info" size={72} color="info" />
          <Text preset="headingMedium" color="text" bold mt="s24" textAlign="center">Não disponível</Text>
          <Text preset="paragraphMedium" color="textSecondary" mt="s12" textAlign="center">
            A avaliação só está disponível após a viagem ser concluída.
          </Text>
          <Button title="Voltar" onPress={handleGoBack} mt="s32" />
        </Box>
      </Box>
    );
  }

  return (
    <>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box flex={1} backgroundColor="background">
          {/* Header */}
          <Box
            paddingHorizontal="s20"
            paddingBottom="s16"
            backgroundColor="surface"
            style={{
              paddingTop: top + 16,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <TouchableOpacityBox onPress={handleGoBack} mb="s16">
              <Icon name="arrow-back" size={24} color="text" />
            </TouchableOpacityBox>
            <Text preset="headingMedium" color="text" bold>Avaliar Viagem</Text>
            <Text preset="paragraphMedium" color="textSecondary" mt="s4">
              Sua opinião melhora o serviço para todos
            </Text>
          </Box>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Box padding="s20">

              {/* ── Avaliar Capitão ── */}
              <Box
                backgroundColor="surface"
                borderRadius="s16"
                padding="s20"
                mb="s16"
                style={{
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 1},
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                {/* Caption */}
                <Box flexDirection="row" alignItems="center" mb="s16">
                  <Box
                    width={40} height={40} borderRadius="s20"
                    backgroundColor="primaryBg" alignItems="center"
                    justifyContent="center" mr="s12">
                    <Icon name="person" size={22} color="primary" />
                  </Box>
                  <Box flex={1}>
                    <Text preset="paragraphSmall" color="textSecondary">Capitão</Text>
                    <Text preset="paragraphMedium" color="text" bold numberOfLines={1}>
                      {captainName || 'Capitão'}
                    </Text>
                  </Box>
                </Box>

                {/* Nota geral do capitão */}
                <StarRating
                  value={captainRating}
                  onChange={setCaptainRating}
                  label="Avaliação geral"
                />

                {/* Comentário */}
                <Text preset="paragraphSmall" color="text" bold mb="s8">
                  Comentário <Text preset="paragraphSmall" color="textSecondary">(opcional)</Text>
                </Text>
                <TextInput
                  placeholder="Como foi a experiência com o capitão?"
                  value={captainComment}
                  onChangeText={setCaptainComment}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                {/* Sub-avaliações do capitão */}
                {captainRating > 0 && (
                  <Box
                    mt="s16"
                    pt="s16"
                    borderTopWidth={1}
                    borderTopColor="border">
                    <Text preset="paragraphSmall" color="textSecondary" mb="s12">
                      Detalhes <Text preset="paragraphCaptionSmall" color="textSecondary">(opcional)</Text>
                    </Text>
                    <DetailRating value={punctualityRating} onChange={setPunctualityRating} label="Pontualidade" />
                    <DetailRating value={communicationRating} onChange={setCommunicationRating} label="Comunicação" />
                  </Box>
                )}
              </Box>

              {/* ── Avaliar Embarcação ── */}
              {boatName && (
                <Box
                  backgroundColor="surface"
                  borderRadius="s16"
                  padding="s20"
                  mb="s16"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 1},
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 2,
                  }}>
                  <Box flexDirection="row" alignItems="center" mb="s16">
                    <Box
                      width={40} height={40} borderRadius="s20"
                      backgroundColor="secondaryBg" alignItems="center"
                      justifyContent="center" mr="s12">
                      <Icon name="directions-boat" size={22} color="secondary" />
                    </Box>
                    <Box flex={1}>
                      <Text preset="paragraphSmall" color="textSecondary">Embarcação</Text>
                      <Text preset="paragraphMedium" color="text" bold numberOfLines={1}>
                        {boatName}
                      </Text>
                    </Box>
                  </Box>

                  <StarRating
                    value={boatRating}
                    onChange={setBoatRating}
                    label="Avaliação geral"
                    optional
                  />

                  {boatRating > 0 && (
                    <>
                      <Text preset="paragraphSmall" color="text" bold mb="s8">
                        Comentário <Text preset="paragraphSmall" color="textSecondary">(opcional)</Text>
                      </Text>
                      <TextInput
                        placeholder="Como foi a embarcação?"
                        value={boatComment}
                        onChangeText={setBoatComment}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />

                      {/* Fotos da embarcação */}
                      <Box mt="s16">
                        <PhotoPicker
                          photos={boatPhotos}
                          onPhotosChange={setBoatPhotos}
                          maxPhotos={5}
                          label="Fotos da Embarcação (Opcional)"
                          description="Registre como estava a embarcação. Máximo 5 fotos."
                        />
                      </Box>

                      {/* Sub-avaliações do barco */}
                      <Box mt="s16" pt="s16" borderTopWidth={1} borderTopColor="border">
                        <Text preset="paragraphSmall" color="textSecondary" mb="s12">
                          Detalhes <Text preset="paragraphCaptionSmall" color="textSecondary">(opcional)</Text>
                        </Text>
                        <DetailRating value={cleanlinessRating} onChange={setCleanlinessRating} label="Limpeza" />
                        <DetailRating value={comfortRating} onChange={setComfortRating} label="Conforto" />
                      </Box>
                    </>
                  )}
                </Box>
              )}

              {/* NavegaCoins */}
              <Box
                backgroundColor="successBg"
                padding="s16"
                borderRadius="s12"
                flexDirection="row"
                alignItems="center"
                mb="s24">
                <Text style={{fontSize: 22}} mr="s12">🪙</Text>
                <Text preset="paragraphSmall" color="success" flex={1}>
                  Ganhe{' '}
                  <Text preset="paragraphSmall" color="success" bold>+5 NavegaCoins</Text>
                  {' '}ao enviar sua avaliação!
                </Text>
              </Box>

              <Button
                title={isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                onPress={handleSubmit}
                disabled={isSubmitting || captainRating === 0}
                loading={isSubmitting}
                mb="s12"
              />
              <Button
                title="Agora não"
                preset="outline"
                onPress={handleGoBack}
                disabled={isSubmitting}
              />
            </Box>
          </ScrollView>
        </Box>
      </KeyboardAvoidingView>

      <InfoModal
        visible={showCaptainRatingModal}
        title="Atenção"
        message="Avalie o capitão para enviar sua avaliação"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowCaptainRatingModal(false)}
      />

      <InfoModal
        visible={showErrorModal}
        title="Erro"
        message={errorMessage}
        icon="error-outline"
        iconColor="danger"
        buttonText="Entendi"
        onClose={handleErrorModalClose}
      />
    </>
  );
}
