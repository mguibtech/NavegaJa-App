import React from 'react';
import {ScrollView, ActivityIndicator, Image, FlatList} from 'react-native';

import {Box, Icon, Text, ScreenHeader} from '@components';
import {Review} from '@domain';
import {apiImageSource} from '@api/config';

import {useBoatDetailScreen} from './useBoatDetailScreen';

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

export function BoatDetailScreen() {
  const {
    navigation,
    boat,
    boatLoading,
    reviews,
    loading,
    overallAvg,
    avgCleanliness,
    avgComfort,
    addedSince,
    galleryPhotos,
    amenities,
  } = useBoatDetailScreen();

  if (boatLoading) {
    return (
      <Box flex={1} backgroundColor="background">
        <ScreenHeader title="Embarcação" onBack={() => navigation.goBack()} />
        <Box flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#0a6fbd" />
        </Box>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">
      <ScreenHeader title="Embarcação" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Box padding="s20">

          {/* Hero Card */}
          <Box
            backgroundColor="surface"
            borderRadius="s20"
            mb="s16"
            overflow="hidden"
            style={shadowCard}>
            {/* Galeria de fotos ou ícone */}
            {galleryPhotos.length > 0 ? (
              <FlatList
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                data={galleryPhotos}
                keyExtractor={(item, i) => `gallery-${i}`}
                renderItem={({item: photoUrl}) => (
                  <Image
                    source={apiImageSource(photoUrl)}
                    style={{width: 327, height: 220}}
                    resizeMode="cover"
                  />
                )}
              />
            ) : (
              <Box
                height={160}
                backgroundColor="secondaryBg"
                alignItems="center"
                justifyContent="center">
                <Icon name="directions-boat" size={64} color="secondary" />
              </Box>
            )}

            <Box padding="s24" alignItems="center">
              {/* Name + verified */}
              <Box flexDirection="row" alignItems="center" gap="s8" mb="s4">
                <Text preset="headingMedium" color="text" bold>
                  {boat?.name || 'Embarcação'}
                </Text>
                {boat?.isVerified && (
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
                {boat?.type && (
                  <Box
                    backgroundColor="secondaryBg"
                    paddingHorizontal="s12"
                    paddingVertical="s6"
                    borderRadius="s12">
                    <Text preset="paragraphSmall" color="secondary" bold>
                      {boat.type}
                    </Text>
                  </Box>
                )}
                {boat?.capacity != null && (
                  <Box
                    backgroundColor="primaryBg"
                    paddingHorizontal="s12"
                    paddingVertical="s6"
                    borderRadius="s12">
                    <Text preset="paragraphSmall" color="primary" bold>
                      {boat.capacity}{' '}
                      {boat.capacity === 1 ? 'lugar' : 'lugares'}
                    </Text>
                  </Box>
                )}
                {boat?.isVerified && (
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
          </Box>

          {/* Specs Card */}
          {(boat?.model || boat?.year || boat?.registrationNum || boat?.capacity != null) && (
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
              {boat?.model && (
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="s12">
                  <Text preset="paragraphSmall" color="textSecondary">Modelo</Text>
                  <Text preset="paragraphSmall" color="text" bold>{boat.model}</Text>
                </Box>
              )}
              {boat?.year != null && (
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="s12">
                  <Text preset="paragraphSmall" color="textSecondary">Ano</Text>
                  <Text preset="paragraphSmall" color="text" bold>{boat.year}</Text>
                </Box>
              )}
              {boat?.capacity != null && (
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="s12">
                  <Text preset="paragraphSmall" color="textSecondary">Capacidade</Text>
                  <Text preset="paragraphSmall" color="text" bold>{boat.capacity} lugares</Text>
                </Box>
              )}
              {boat?.registrationNum && (
                <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Text preset="paragraphSmall" color="textSecondary">Registro</Text>
                  <Text preset="paragraphSmall" color="text" bold>{boat.registrationNum}</Text>
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
                <Text preset="paragraphSmall" color="textSecondary" mt="s12" textAlign="center">
                  Nenhuma avaliação ainda
                </Text>
              </Box>
            ) : (
              reviews.map((review: Review, index: number) => {
                const rating = review.boatRating ?? 0;
                const reviewerName = review.reviewer?.name?.split(' ')[0] ?? 'Passageiro';
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
                    <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s6">
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
                      <Text preset="paragraphSmall" color="textSecondary" mb="s6">
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
                            source={apiImageSource(photoUrl)}
                            style={{width: 80, height: 80, borderRadius: 8, marginRight: 8}}
                            resizeMode="cover"
                          />
                        )}
                        style={{marginBottom: 8}}
                      />
                    ) : null}
                    {(review.cleanlinessRating || review.comfortRating) ? (
                      <Box flexDirection="row" flexWrap="wrap" gap="s12" mb="s4">
                        {review.cleanlinessRating ? (
                          <Text preset="paragraphCaptionSmall" color="textSecondary">
                            Limpeza{' '}
                            <Text preset="paragraphCaptionSmall" color="text" bold>
                              {review.cleanlinessRating}/5
                            </Text>
                          </Text>
                        ) : null}
                        {review.comfortRating ? (
                          <Text preset="paragraphCaptionSmall" color="textSecondary">
                            Conforto{' '}
                            <Text preset="paragraphCaptionSmall" color="text" bold>
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
