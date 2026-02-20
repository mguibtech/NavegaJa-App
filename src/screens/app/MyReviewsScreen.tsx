import React, {useState, useCallback} from 'react';
import {FlatList, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox, UserAvatar} from '@components';
import {getMyReviewsUseCase, Review, ReviewType} from '@domain';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'MyReviews'>;

type ActiveTab = 'given' | 'received';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function StarRow({rating, size = 14}: {rating: number; size?: number}) {
  return (
    <Box flexDirection="row" g="s4">
      {[1, 2, 3, 4, 5].map(i => (
        <Icon
          key={i}
          name={i <= rating ? 'star' : 'star-border'}
          size={size}
          color={i <= rating ? 'warning' : 'border'}
        />
      ))}
    </Box>
  );
}

function ReviewCard({review, tab}: {review: Review; tab: ActiveTab}) {
  const rating =
    tab === 'given'
      ? (review.captainRating ?? review.passengerRating ?? 0)
      : (review.captainRating ?? review.passengerRating ?? 0);

  const comment =
    tab === 'given'
      ? (review.captainComment ?? review.passengerComment)
      : (review.captainComment ?? review.passengerComment);

  const otherPerson = tab === 'given' ? review.reviewed : review.reviewer;

  const typeLabel =
    review.reviewType === ReviewType.PASSENGER_TO_CAPTAIN
      ? 'Avaliação de viagem'
      : 'Avaliação de passageiro';

  return (
    <Box
      backgroundColor="surface"
      borderRadius="s16"
      padding="s16"
      mx="s20"
      mb="s12"
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}>
      {/* Header: avatar + nome + tipo */}
      <Box flexDirection="row" alignItems="center" mb="s12">
        <UserAvatar
          userId={otherPerson?.id}
          avatarUrl={otherPerson?.avatarUrl}
          name={otherPerson?.name}
          size="sm"
        />
        <Box flex={1} ml="s12">
          <Text preset="paragraphMedium" color="text" bold numberOfLines={1}>
            {otherPerson?.name ?? 'Usuário'}
          </Text>
          <Text preset="paragraphSmall" color="textSecondary">
            {typeLabel}
          </Text>
        </Box>
        <Text preset="paragraphSmall" color="textSecondary">
          {formatDate(review.createdAt)}
        </Text>
      </Box>

      {/* Stars */}
      <Box mb={comment ? 's10' : undefined}>
        <StarRow rating={rating} />
      </Box>

      {/* Comment */}
      {!!comment && (
        <Text preset="paragraphSmall" color="text" style={{lineHeight: 20}}>
          {comment}
        </Text>
      )}

      {/* Boat rating (dado by passenger) */}
      {review.boatRating != null && review.boatRating > 0 && (
        <Box
          mt="s10"
          paddingTop="s10"
          borderTopWidth={1}
          borderTopColor="border"
          flexDirection="row"
          alignItems="center"
          g="s8">
          <Icon name="directions-boat" size={14} color="secondary" />
          <Text preset="paragraphSmall" color="textSecondary">Barco:</Text>
          <StarRow rating={review.boatRating} size={12} />
        </Box>
      )}
    </Box>
  );
}

export function MyReviewsScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ActiveTab>('received');
  const [given, setGiven] = useState<Review[]>([]);
  const [received, setReceived] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, []),
  );

  async function loadReviews() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMyReviewsUseCase();
      setGiven(result.given ?? []);
      setReceived(result.received ?? []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  const data = activeTab === 'given' ? given : received;

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingBottom="s16"
        style={{
          paddingTop: top + 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Box flexDirection="row" alignItems="center" mb="s16">
          <TouchableOpacityBox
            width={40}
            height={40}
            borderRadius="s20"
            alignItems="center"
            justifyContent="center"
            onPress={() => navigation.goBack()}
            mr="s12">
            <Icon name="arrow-back" size={24} color="text" />
          </TouchableOpacityBox>
          <Text preset="headingSmall" color="text" bold>
            Minhas Avaliações
          </Text>
        </Box>

        {/* Tabs */}
        <Box flexDirection="row" g="s12">
          <TouchableOpacityBox
            flex={1}
            paddingVertical="s12"
            borderRadius="s12"
            backgroundColor={activeTab === 'received' ? 'primary' : 'background'}
            alignItems="center"
            onPress={() => setActiveTab('received')}>
            <Text
              preset="paragraphMedium"
              color={activeTab === 'received' ? 'surface' : 'text'}
              bold>
              Recebidas ({received.length})
            </Text>
          </TouchableOpacityBox>

          <TouchableOpacityBox
            flex={1}
            paddingVertical="s12"
            borderRadius="s12"
            backgroundColor={activeTab === 'given' ? 'primary' : 'background'}
            alignItems="center"
            onPress={() => setActiveTab('given')}>
            <Text
              preset="paragraphMedium"
              color={activeTab === 'given' ? 'surface' : 'text'}
              bold>
              Enviadas ({given.length})
            </Text>
          </TouchableOpacityBox>
        </Box>
      </Box>

      {/* Content */}
      {isLoading ? (
        <Box flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator color="#0E7AFE" />
        </Box>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({item}) => <ReviewCard review={item} tab={activeTab} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingTop: 20, paddingBottom: 32, flexGrow: 1}}
          ListEmptyComponent={
            error ? (
              <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="s40" style={{paddingTop: 80}}>
                <Icon name="wifi-off" size={48} color="border" />
                <Text preset="headingSmall" color="textSecondary" mt="s16" style={{textAlign: 'center'}}>
                  Sem conexão
                </Text>
                <TouchableOpacityBox
                  mt="s16" paddingHorizontal="s24" paddingVertical="s12"
                  backgroundColor="primaryBg" borderRadius="s12"
                  onPress={loadReviews}>
                  <Text preset="paragraphMedium" color="primary" bold>Tentar novamente</Text>
                </TouchableOpacityBox>
              </Box>
            ) : (
              <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="s40" style={{paddingTop: 80}}>
                <Icon name="star-border" size={64} color="border" />
                <Text preset="headingSmall" color="textSecondary" mt="s16" style={{textAlign: 'center'}}>
                  {activeTab === 'received'
                    ? 'Nenhuma avaliação recebida'
                    : 'Você ainda não avaliou ninguém'}
                </Text>
                <Text preset="paragraphSmall" color="textSecondary" mt="s8" style={{textAlign: 'center'}}>
                  {activeTab === 'received'
                    ? 'Suas avaliações de outros usuários aparecerão aqui.'
                    : 'Após concluir uma viagem, você poderá avaliar o capitão.'}
                </Text>
              </Box>
            )
          }
        />
      )}
    </Box>
  );
}
