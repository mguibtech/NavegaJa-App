import React, {useState, useEffect} from 'react';
import {ScrollView, ActivityIndicator, Image} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {getReviewsByCaptainUseCase, Review} from '@domain';
import {API_BASE_URL} from '../../api/config';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainProfile'>;

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
      <Text preset="paragraphSmall" color="textSecondary" style={{width: 100}}>
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

export function CaptainProfileScreen({navigation, route}: Props) {
  const {
    captainId,
    captainName,
    captainRating,
    captainTotalTrips,
    captainLevel,
    captainCreatedAt,
    captainAvatarUrl,
    captainIsVerified,
    captainHasLicensePhoto,
  } = route.params;
  const {top} = useSafeAreaInsets();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    getReviewsByCaptainUseCase(captainId)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [captainId]);

  const overallAvg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.captainRating ?? r.passengerRating ?? 0), 0) /
        reviews.length
      : captainRating
      ? Number(captainRating)
      : 0;

  const avgPunctuality = (() => {
    const vals = reviews
      .map(r => r.punctualityRating)
      .filter((v): v is number => v != null && v > 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  const avgCommunication = (() => {
    const vals = reviews
      .map(r => r.communicationRating)
      .filter((v): v is number => v != null && v > 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  const memberSince = captainCreatedAt
    ? new Date(captainCreatedAt).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  const avatarUri = captainAvatarUrl
    ? captainAvatarUrl.startsWith('http')
      ? captainAvatarUrl
          .replace(/http:\/\/localhost(:\d+)?/, API_BASE_URL)
          .replace(/http:\/\/127\.0\.0\.1(:\d+)?/, API_BASE_URL)
      : `${API_BASE_URL}${captainAvatarUrl}`
    : null;
  const showAvatar = avatarUri != null && !avatarError;

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
          Perfil do Capitão
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
            {/* Avatar */}
            <Box
              width={88}
              height={88}
              backgroundColor="primaryBg"
              alignItems="center"
              justifyContent="center"
              mb="s16"
              overflow="hidden"
              style={{
                borderRadius: 44,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 4,
              }}>
              {showAvatar ? (
                <Image
                  source={{uri: avatarUri!}}
                  style={{width: 88, height: 88}}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <Icon name="person" size={44} color="primary" />
              )}
            </Box>

            {/* Name */}
            <Text preset="headingMedium" color="text" bold mb="s4">
              {captainName || 'Capitão'}
            </Text>

            {memberSince && (
              <Text preset="paragraphSmall" color="textSecondary" mb="s12">
                Membro desde {memberSince}
              </Text>
            )}

            {/* Rating */}
            <Box flexDirection="row" alignItems="center" gap="s6" mb="s16">
              <Icon name="star" size={20} color="warning" />
              <Text preset="headingSmall" color="text" bold>
                {overallAvg > 0 ? overallAvg.toFixed(1) : '—'}
              </Text>
              <Text preset="paragraphSmall" color="textSecondary">
                ({reviews.length}{' '}
                {reviews.length === 1 ? 'avaliação' : 'avaliações'})
              </Text>
            </Box>

            {/* Chips */}
            <Box flexDirection="row" flexWrap="wrap" justifyContent="center" gap="s8">
              {/* Badge de verificação */}
              {captainIsVerified && (
                <Box
                  backgroundColor="successBg"
                  paddingHorizontal="s12"
                  paddingVertical="s6"
                  borderRadius="s12"
                  flexDirection="row"
                  alignItems="center">
                  <Icon name="verified" size={14} color="success" />
                  <Text preset="paragraphSmall" color="success" bold ml="s4">
                    Verificado
                  </Text>
                </Box>
              )}
              {!captainIsVerified && captainHasLicensePhoto && (
                <Box
                  backgroundColor="warningBg"
                  paddingHorizontal="s12"
                  paddingVertical="s6"
                  borderRadius="s12"
                  flexDirection="row"
                  alignItems="center">
                  <Icon name="hourglass-empty" size={14} color="warning" />
                  <Text preset="paragraphSmall" color="warning" bold ml="s4">
                    Em análise
                  </Text>
                </Box>
              )}
              {captainLevel && (
                <Box
                  backgroundColor="secondaryBg"
                  paddingHorizontal="s12"
                  paddingVertical="s6"
                  borderRadius="s12">
                  <Text preset="paragraphSmall" color="secondary" bold>
                    ⚓ {captainLevel}
                  </Text>
                </Box>
              )}
              {captainTotalTrips != null && (
                <Box
                  backgroundColor="primaryBg"
                  paddingHorizontal="s12"
                  paddingVertical="s6"
                  borderRadius="s12">
                  <Text preset="paragraphSmall" color="primary" bold>
                    {captainTotalTrips}{' '}
                    {captainTotalTrips === 1 ? 'viagem' : 'viagens'}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Stats Row */}
          <Box flexDirection="row" gap="s12" mb="s16">
            {captainTotalTrips != null && (
              <Box
                flex={1}
                backgroundColor="surface"
                borderRadius="s16"
                padding="s16"
                alignItems="center"
                style={shadowCard}>
                <Icon name="directions-boat" size={28} color="primary" />
                <Text preset="headingSmall" color="text" bold mt="s8">
                  {captainTotalTrips}
                </Text>
                <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                  Viagens
                </Text>
              </Box>
            )}
            <Box
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s16"
              alignItems="center"
              style={shadowCard}>
              <Icon name="star" size={28} color="warning" />
              <Text preset="headingSmall" color="text" bold mt="s8">
                {overallAvg > 0 ? overallAvg.toFixed(1) : '—'}
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                Avaliação
              </Text>
            </Box>
            <Box
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s16"
              alignItems="center"
              style={shadowCard}>
              <Icon name="rate-review" size={28} color="info" />
              <Text preset="headingSmall" color="text" bold mt="s8">
                {reviews.length}
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                Reviews
              </Text>
            </Box>
          </Box>

          {/* Rating Breakdown */}
          {(avgPunctuality !== null || avgCommunication !== null) && (
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              mb="s16"
              style={shadowCard}>
              <Box flexDirection="row" alignItems="center" mb="s16">
                <Icon name="insights" size={20} color="primary" />
                <Text preset="paragraphMedium" color="text" bold ml="s8">
                  Detalhes da Avaliação
                </Text>
              </Box>
              {avgPunctuality !== null && (
                <RatingBar label="Pontualidade" value={avgPunctuality} />
              )}
              {avgCommunication !== null && (
                <RatingBar label="Comunicação" value={avgCommunication} />
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
                const rating = review.captainRating ?? 0;
                const comment = review.captainComment ?? review.passengerComment;
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
                    {comment ? (
                      <Text
                        preset="paragraphSmall"
                        color="textSecondary"
                        mb="s6">
                        "{comment}"
                      </Text>
                    ) : null}
                    {(review.punctualityRating || review.communicationRating) ? (
                      <Box flexDirection="row" flexWrap="wrap" gap="s12" mb="s4">
                        {review.punctualityRating ? (
                          <Text preset="paragraphCaptionSmall" color="textSecondary">
                            Pontualidade{' '}
                            <Text
                              preset="paragraphCaptionSmall"
                              color="text"
                              bold>
                              {review.punctualityRating}/5
                            </Text>
                          </Text>
                        ) : null}
                        {review.communicationRating ? (
                          <Text preset="paragraphCaptionSmall" color="textSecondary">
                            Comunicação{' '}
                            <Text
                              preset="paragraphCaptionSmall"
                              color="text"
                              bold>
                              {review.communicationRating}/5
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
