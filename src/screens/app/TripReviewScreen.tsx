import React, {useState, useEffect} from 'react';
import {ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, InfoModal, PhotoPicker} from '@components';
import {canReviewUseCase, createReviewUseCase} from '@domain';
import {useToast} from '@hooks';
import {api} from '@api';
import {API_BASE_URL} from '../../api/config';

import {AppStackParamList} from '@routes';

type PhotoItem = {uri: string; type: string; name: string};

type Props = NativeStackScreenProps<AppStackParamList, 'TripReview'>;

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

export function TripReviewScreen({navigation, route}: Props) {
  const {tripId, captainName, boatName} = route.params;
  const {top} = useSafeAreaInsets();
  const toast = useToast();

  const [checking, setChecking] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Captain
  const [captainRating, setCaptainRating] = useState(0);
  const [captainComment, setCaptainComment] = useState('');
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);

  // Boat
  const [boatRating, setBoatRating] = useState(0);
  const [boatComment, setBoatComment] = useState('');
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [comfortRating, setComfortRating] = useState(0);
  const [boatPhotos, setBoatPhotos] = useState<PhotoItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCaptainRatingModal, setShowCaptainRatingModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkEligibility();
  }, []);

  async function checkEligibility() {
    try {
      const result = await canReviewUseCase(tripId);
      setCanReview(result.canReview);
      setAlreadyReviewed(result.alreadyReviewed ?? false);
    } catch {
      setCanReview(false);
    } finally {
      setChecking(false);
    }
  }

  async function uploadPhotos(photos: PhotoItem[]): Promise<string[]> {
    return Promise.all(
      photos.map(async photo => {
        const formData = new FormData();
        formData.append('file', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.name || 'photo.jpg',
        } as any);
        const response = await api.upload<{url: string}>('/upload/image', formData);
        return response.url.startsWith('http')
          ? response.url
          : `${API_BASE_URL}${response.url}`;
      }),
    );
  }

  async function handleSubmit() {
    if (captainRating === 0) {
      setShowCaptainRatingModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedBoatPhotos =
        boatRating > 0 && boatPhotos.length > 0
          ? await uploadPhotos(boatPhotos)
          : undefined;

      await createReviewUseCase({
        tripId,
        captainRating,
        captainComment: captainComment.trim() || undefined,
        punctualityRating: punctualityRating > 0 ? punctualityRating : undefined,
        communicationRating: communicationRating > 0 ? communicationRating : undefined,
        boatRating: boatRating > 0 ? boatRating : undefined,
        boatComment: boatRating > 0 && boatComment.trim() ? boatComment.trim() : undefined,
        cleanlinessRating: boatRating > 0 && cleanlinessRating > 0 ? cleanlinessRating : undefined,
        comfortRating: boatRating > 0 && comfortRating > 0 ? comfortRating : undefined,
        boatPhotos: uploadedBoatPhotos,
      });

      toast.showSuccess('Avaliação enviada! +5 NavegaCoins creditados 🪙');
      navigation.goBack();
    } catch (error: any) {
      setErrorMessage(error?.message || 'Não foi possível enviar a avaliação');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <TouchableOpacityBox onPress={() => navigation.goBack()} mb="s16">
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
          <Button title="Voltar" onPress={() => navigation.goBack()} mt="s32" />
        </Box>
      </Box>
    );
  }

  if (!canReview) {
    return (
      <Box flex={1} backgroundColor="background">
        <Box paddingHorizontal="s20" paddingBottom="s16" backgroundColor="surface" style={{paddingTop: top + 16}}>
          <TouchableOpacityBox onPress={() => navigation.goBack()} mb="s16">
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
          <Button title="Voltar" onPress={() => navigation.goBack()} mt="s32" />
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
            <TouchableOpacityBox onPress={() => navigation.goBack()} mb="s16">
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
                onPress={() => navigation.goBack()}
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
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
        }}
      />
    </>
  );
}
