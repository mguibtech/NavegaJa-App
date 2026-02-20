import React, {useState, useEffect} from 'react';
import {ScrollView, ActivityIndicator, Image, FlatList} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {getReviewsByBoatUseCase, Review} from '@domain';
import {API_BASE_URL} from '../../api/config';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'BoatDetail'>;

const shadowCard = {
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};

function RatingBar({label, value}: {label: string; value: number}) {
  return (
    <Box flexDirection="row" alignItems="center" mb="s8">
      <Text preset="paragraphSmall" color="textSecondary" style={{width: 80}}>
        {label}
      </Text>
      <Box flex={1} height={6} backgroundColor="border" style={{borderRadius: 4}} mx="s8">
        <Box
          height={6}
          backgroundColor="warning"
          style={{borderRadius: 4, width: `${Math.round((value / 5) * 100)}%`}}
        />
      </Box>
      <Text preset="paragraphSmall" color="text" bold>
        {value.toFixed(1)}
      </Text>
    </Box>
  );
}

export function BoatDetailScreen({navigation, route}: Props) {
  const {
    boatId,
    boatName,
    boatType,
    boatCapacity,
    boatModel,
    boatYear,
    boatAmenities,
    boatRegistrationNum,
    boatIsVerified,
    boatPhotoUrl,
    boatCreatedAt,
  } = route.params;
  const {top} = useSafeAreaInsets();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    getReviewsByBoatUseCase(boatId)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [boatId]);

  const overallAvg =
    reviews.length > 0
      ? reviews
          .filter(r => (r.boatRating ?? 0) > 0)
          .reduce((sum, r) => sum + (r.boatRating ?? 0), 0) /
        reviews.filter(r => (r.boatRating ?? 0) > 0).length
      : 0;

  const avgCleanliness = (() => {
    const vals = reviews
      .map(r => r.cleanlinessRating)
      .filter((v): v is number => v != null && v > 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  const avgComfort = (() => {
    const vals = reviews
      .map(r => r.comfortRating)
      .filter((v): v is number => v != null && v > 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  const addedSince = boatCreatedAt
    ? new Date(boatCreatedAt).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  const photoUri = boatPhotoUrl
    ? boatPhotoUrl.startsWith('http')
      ? boatPhotoUrl
          .replace(/http:\/\/localhost(:\d+)?/, API_BASE_URL)
          .replace(/http:\/\/127\.0\.0\.1(:\d+)?/, API_BASE_URL)
      : `${API_BASE_URL}${boatPhotoUrl}`
    : null;
  const showPhoto = photoUri != null && !photoError;

  const amenities = boatAmenities ?? [];

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s20"
        paddingBottom="s16"
        backgroundColor="surface"
        style={{paddingTop: top + 16, ...shadowCard}}>
        <TouchableOpacityBox onPress={() => navigation.goBack()} mb="s12">
          <Icon name="arrow-back" size={24} color="text" />
        </TouchableOpacityBox>
        <Text preset="headingMedium" color="text" bold>
          Embarcação
        </Text>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Box padding="s20">

          {/* Hero Card */}
          <Box
            backgroundColor="surface"
            borderRadius="s20"
            padding="s24"
            mb="s16"
            alignItems="center"
            style={shadowCard}>
            {/* Photo / Icon */}
            <Box
              width={96}
              height={96}
              borderRadius="s20"
              backgroundColor="secondaryBg"
              alignItems="center"
              justifyContent="center"
              mb="s16"
              overflow="hidden"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 4,
              }}>
              {showPhoto ? (
                <Image
                  source={{uri: photoUri!}}
                  style={{width: 96, height: 96}}
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <Icon name="directions-boat" size={48} color="secondary" />
              )}
            </Box>

            {/* Name + verified */}
            <Box flexDirection="row" alignItems="center" gap="s8" mb="s4">
              <Text preset="headingMedium" color="text" bold>
                {boatName || 'Embarcação'}
              </Text>
              {boatIsVerified && (
                <Icon name="verified" size={20} color="primary" />
              )}
            </Box>

            {addedSince && (
              <Text preset="paragraphSmall" color="textSecondary" mb="s12">
                Cadastrada em {addedSince}
              </Text>
            )}

            {/* Rating */}
            {overallAvg > 0 && (
              <Box flexDirection="row" alignItems="center" gap="s6" mb="s16">
                <Icon name="star" size={20} color="warning" />
                <Text preset="headingSmall" color="text" bold>
                  {overallAvg.toFixed(1)}
                </Text>
                <Text preset="paragraphSmall" color="textSecondary">
                  ({reviews.length}{' '}
                  {reviews.length === 1 ? 'avaliação' : 'avaliações'})
                </Text>
              </Box>
            )}

            {/* Type + Capacity chips */}
            <Box flexDirection="row" flexWrap="wrap" justifyContent="center" gap="s8">
              {boatType && (
                <Box
                  backgroundColor="secondaryBg"
                  paddingHorizontal="s12"
                  paddingVertical="s6"
                  borderRadius="s12">
                  <Text preset="paragraphSmall" color="secondary" bold>
                    {boatType}
                  </Text>
                </Box>
              )}
              {boatCapacity != null && (
                <Box
                  backgroundColor="primaryBg"
                  paddingHorizontal="s12"
                  paddingVertical="s6"
                  borderRadius="s12">
                  <Text preset="paragraphSmall" color="primary" bold>
                    {boatCapacity}{' '}
                    {boatCapacity === 1 ? 'lugar' : 'lugares'}
                  </Text>
                </Box>
              )}
              {boatIsVerified && (
                <Box
                  backgroundColor="successBg"
                  paddingHorizontal="s12"
                  paddingVertical="s6"
                  borderRadius="s12">
                  <Text preset="paragraphSmall" color="success" bold>
                    ✓ Verificada
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Specs Card */}
          {(boatModel || boatYear || boatRegistrationNum || boatCapacity != null) && (
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              mb="s16"
              style={shadowCard}>
              <Box flexDirection="row" alignItems="center" mb="s16">
                <Icon name="info" size={20} color="secondary" />
                <Text preset="paragraphMedium" color="text" bold ml="s8">
                  Especificações
                </Text>
              </Box>
              {boatModel && (
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb="s12">
                  <Text preset="paragraphSmall" color="textSecondary">
                    Modelo
                  </Text>
                  <Text preset="paragraphSmall" color="text" bold>
                    {boatModel}
                  </Text>
                </Box>
              )}
              {boatYear != null && (
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb="s12">
                  <Text preset="paragraphSmall" color="textSecondary">
                    Ano
                  </Text>
                  <Text preset="paragraphSmall" color="text" bold>
                    {boatYear}
                  </Text>
                </Box>
              )}
              {boatCapacity != null && (
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb="s12">
                  <Text preset="paragraphSmall" color="textSecondary">
                    Capacidade
                  </Text>
                  <Text preset="paragraphSmall" color="text" bold>
                    {boatCapacity} lugares
                  </Text>
                </Box>
              )}
              {boatRegistrationNum && (
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Text preset="paragraphSmall" color="textSecondary">
                    Registro
                  </Text>
                  <Text preset="paragraphSmall" color="text" bold>
                    {boatRegistrationNum}
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              mb="s16"
              style={shadowCard}>
              <Box flexDirection="row" alignItems="center" mb="s16">
                <Icon name="check-circle" size={20} color="success" />
                <Text preset="paragraphMedium" color="text" bold ml="s8">
                  Comodidades
                </Text>
              </Box>
              <Box flexDirection="row" flexWrap="wrap" gap="s8">
                {amenities.map((amenity, i) => (
                  <Box
                    key={i}
                    backgroundColor="successBg"
                    paddingHorizontal="s12"
                    paddingVertical="s6"
                    borderRadius="s12"
                    flexDirection="row"
                    alignItems="center">
                    <Icon name="check" size={14} color="success" />
                    <Text preset="paragraphSmall" color="success" ml="s4">
                      {amenity}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Rating Breakdown */}
          {(avgCleanliness !== null || avgComfort !== null) && (
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              mb="s16"
              style={shadowCard}>
              <Box flexDirection="row" alignItems="center" mb="s16">
                <Icon name="insights" size={20} color="secondary" />
                <Text preset="paragraphMedium" color="text" bold ml="s8">
                  Detalhes da Avaliação
                </Text>
              </Box>
              {avgCleanliness !== null && (
                <RatingBar label="Limpeza" value={avgCleanliness} />
              )}
              {avgComfort !== null && (
                <RatingBar label="Conforto" value={avgComfort} />
              )}
            </Box>
          )}

          {/* All Reviews */}
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            mb="s24"
            style={shadowCard}>
            <Box flexDirection="row" alignItems="center" mb="s16">
              <Icon name="star" size={20} color="warning" />
              <Text preset="paragraphMedium" color="text" bold ml="s8">
                Avaliações ({reviews.length})
              </Text>
            </Box>

            {loading ? (
              <Box alignItems="center" padding="s24">
                <ActivityIndicator size="small" color="#0a6fbd" />
              </Box>
            ) : reviews.length === 0 ? (
              <Box alignItems="center" padding="s24">
                <Icon name="star-outline" size={40} color="border" />
                <Text
                  preset="paragraphSmall"
                  color="textSecondary"
                  mt="s12"
                  textAlign="center">
                  Nenhuma avaliação ainda
                </Text>
              </Box>
            ) : (
              reviews.map((review, index) => {
                const rating = review.boatRating ?? 0;
                const reviewerName =
                  review.reviewer?.name?.split(' ')[0] ?? 'Passageiro';
                const dateStr = new Date(review.createdAt).toLocaleDateString(
                  'pt-BR',
                  {day: '2-digit', month: 'short', year: 'numeric'},
                );
                return (
                  <Box
                    key={review.id}
                    borderTopWidth={index > 0 ? 1 : 0}
                    borderTopColor="border"
                    pt={index > 0 ? 's16' : undefined}
                    mb="s16">
                    <Box
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      mb="s6">
                      <Text preset="paragraphSmall" color="text" bold>
                        {reviewerName}
                      </Text>
                      <Box flexDirection="row" alignItems="center" gap="s4">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Icon
                            key={s}
                            name={s <= rating ? 'star' : 'star-outline'}
                            size={13}
                            color={s <= rating ? 'warning' : 'textSecondary'}
                          />
                        ))}
                      </Box>
                    </Box>
                    {review.boatComment ? (
                      <Text
                        preset="paragraphSmall"
                        color="textSecondary"
                        mb="s6">
                        "{review.boatComment}"
                      </Text>
                    ) : null}
                    {review.boatPhotos && review.boatPhotos.length > 0 ? (
                      <FlatList
                        horizontal
                        scrollEnabled
                        showsHorizontalScrollIndicator={false}
                        data={review.boatPhotos}
                        keyExtractor={(item, i) => `${review.id}-photo-${i}`}
                        renderItem={({item: photoUrl}) => (
                          <Image
                            source={{uri: photoUrl}}
                            style={{
                              width: 80,
                              height: 80,
                              borderRadius: 8,
                              marginRight: 8,
                            }}
                            resizeMode="cover"
                          />
                        )}
                        style={{marginBottom: 8}}
                      />
                    ) : null}
                    {(review.cleanlinessRating || review.comfortRating) ? (
                      <Box
                        flexDirection="row"
                        flexWrap="wrap"
                        gap="s12"
                        mb="s4">
                        {review.cleanlinessRating ? (
                          <Text
                            preset="paragraphCaptionSmall"
                            color="textSecondary">
                            Limpeza{' '}
                            <Text
                              preset="paragraphCaptionSmall"
                              color="text"
                              bold>
                              {review.cleanlinessRating}/5
                            </Text>
                          </Text>
                        ) : null}
                        {review.comfortRating ? (
                          <Text
                            preset="paragraphCaptionSmall"
                            color="textSecondary">
                            Conforto{' '}
                            <Text
                              preset="paragraphCaptionSmall"
                              color="text"
                              bold>
                              {review.comfortRating}/5
                            </Text>
                          </Text>
                        ) : null}
                      </Box>
                    ) : null}
                    <Text preset="paragraphCaptionSmall" color="textSecondary">
                      {dateStr}
                    </Text>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}
