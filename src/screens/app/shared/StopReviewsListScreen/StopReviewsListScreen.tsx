import React from 'react';
import {FlatList, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {useStopReviews, StopReview} from '@domain';

import {AppStackParamList} from '@routes';

function StarRow({rating}: {rating: number}) {
  return (
    <Box flexDirection="row" gap="s4">
      {[1, 2, 3, 4, 5].map(s => (
        <Icon
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-border'}
          size={14}
          color={'#F59E0B' as any}
        />
      ))}
    </Box>
  );
}

function ReviewCard({item}: {item: StopReview}) {
  return (
    <Box
      backgroundColor="surface"
      borderRadius="s12"
      padding="s16"
      mb="s12"
      style={{elevation: 2}}>
      <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" mb="s8">
        <Box flex={1}>
          <Text preset="paragraphSmall" color="text" bold>
            {item.authorName}
          </Text>
          <Text preset="paragraphCaptionSmall" color="textSecondary" style={{marginTop: 2}}>
            {format(new Date(item.createdAt), "dd 'de' MMM 'de' yyyy", {locale: ptBR})}
          </Text>
        </Box>
        <StarRow rating={item.rating} />
      </Box>
      {item.comment ? (
        <Text preset="paragraphSmall" color="textSecondary">
          {item.comment}
        </Text>
      ) : null}
    </Box>
  );
}

export function StopReviewsListScreen() {
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AppStackParamList, 'StopReviewsList'>>();
  const {location} = route.params;

  const {reviews, isLoading} = useStopReviews(location);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s20"
        paddingBottom="s16"
        backgroundColor="secondary"
        style={{paddingTop: top + 16}}>
        <TouchableOpacityBox onPress={() => navigation.goBack()} mb="s12">
          <Icon name="arrow-back" size={24} color={'#FFFFFF' as any} />
        </TouchableOpacityBox>
        <Text preset="headingMedium" bold style={{color: '#FFFFFF'}}>
          {location}
        </Text>
        {reviews.length > 0 && (
          <Box flexDirection="row" alignItems="center" mt="s8" gap="s8">
            <StarRow rating={avgRating} />
            <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.9)'}}>
              {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
            </Text>
          </Box>
        )}
      </Box>

      {isLoading ? (
        <Box flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#0B5D8A" />
        </Box>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={item => item.id}
          renderItem={({item}) => <ReviewCard item={item} />}
          contentContainerStyle={{padding: 16, paddingBottom: 40}}
          ListEmptyComponent={
            <Box alignItems="center" mt="s40">
              <Icon name="star-border" size={64} color="textSecondary" />
              <Text preset="paragraphMedium" color="textSecondary" mt="s16" textAlign="center">
                Nenhuma avaliação para este local ainda.{'\n'}Seja o primeiro!
              </Text>
            </Box>
          }
        />
      )}
    </Box>
  );
}
