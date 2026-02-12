import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {Trip, useSearchTrips} from '@domain';

import {AppStackParamList} from '../../routes/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'SearchResults'>;

type SortOption = 'price' | 'time' | 'rating';

// Helper function to calculate duration
function calculateDuration(departure: string, arrival: string): string {
  const dep = new Date(departure);
  const arr = new Date(arrival);
  const diffMs = arr.getTime() - dep.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}min`;
}

// Helper function to format time
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SearchResultsScreen({navigation, route}: Props) {
  const {origin, destination, date} = route.params;
  const {trips, search, isLoading, error} = useSearchTrips();
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [sortedTrips, setSortedTrips] = useState<Trip[]>([]);

  // Initial search
  useEffect(() => {
    loadTrips();
  }, [origin, destination, date]);

  // Update sorted trips when trips change
  useEffect(() => {
    setSortedTrips(trips);
  }, [trips]);

  async function loadTrips() {
    try {
      await search({origin, destination, date});
    } catch (err) {
      // Error is handled by the hook
      console.error('Failed to load trips:', err);
    }
  }

  const onRefresh = async () => {
    await loadTrips();
  };

  const handleSort = (option: SortOption) => {
    setSortBy(option);
    const sorted = [...sortedTrips].sort((a, b) => {
      if (option === 'price') return a.price - b.price;
      if (option === 'time')
        return a.departureTime.localeCompare(b.departureTime);
      // Rating requires captain data - will sort by price as fallback for now
      if (option === 'rating') return a.price - b.price;
      return 0;
    });
    setSortedTrips(sorted);
  };

  const handleTripPress = (tripId: string) => {
    navigation.navigate('TripDetails', {tripId});
  };

  const sortOptions = [
    {value: 'price' as const, label: 'Menor Preço', icon: 'attach-money'},
    {value: 'time' as const, label: 'Mais Cedo', icon: 'schedule'},
    {value: 'rating' as const, label: 'Melhor Avaliado', icon: 'star'},
  ];

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s24"
        paddingTop="s56"
        paddingBottom="s20"
        backgroundColor="primary">
        <Box flexDirection="row" alignItems="center" mb="s16">
          <TouchableOpacityBox
            width={40}
            height={40}
            borderRadius="s20"
            backgroundColor="primaryBg"
            alignItems="center"
            justifyContent="center"
            marginRight="s16"
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="primary" />
          </TouchableOpacityBox>

          <Box flex={1}>
            <Text preset="headingMedium" color="surface" bold>
              {origin} → {destination}
            </Text>
            <Text preset="paragraphSmall" color="surface" mt="s4">
              {date
                ? new Date(date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                  })
                : 'Qualquer data'}
            </Text>
          </Box>

          <TouchableOpacityBox
            width={40}
            height={40}
            borderRadius="s20"
            backgroundColor="primaryBg"
            alignItems="center"
            justifyContent="center">
            <Icon name="filter-list" size={24} color="primary" />
          </TouchableOpacityBox>
        </Box>

        {/* Sort Options */}
        <Box flexDirection="row" gap="s8">
          {sortOptions.map(option => (
            <TouchableOpacityBox
              key={option.value}
              flex={1}
              paddingVertical="s10"
              paddingHorizontal="s12"
              borderRadius="s12"
              backgroundColor={
                sortBy === option.value ? 'surface' : 'primaryMid'
              }
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              onPress={() => handleSort(option.value)}>
              <Icon
                name={option.icon as any}
                size={16}
                color={sortBy === option.value ? 'primary' : 'surface'}
              />
              <Text
                preset="paragraphSmall"
                color={sortBy === option.value ? 'primary' : 'surface'}
                bold
                ml="s4">
                {option.label}
              </Text>
            </TouchableOpacityBox>
          ))}
        </Box>
      </Box>

      {/* Results List */}
      <FlatList
        data={sortedTrips}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 24}}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Box mb="s20">
            <Text preset="paragraphMedium" color="text" bold>
              {sortedTrips.length} viagens encontradas
            </Text>
          </Box>
        }
        renderItem={({item}) => {
          const departureTime = formatTime(item.departureTime);
          const arrivalTime = formatTime(item.arrivalTime);
          const duration = calculateDuration(item.departureTime, item.arrivalTime);

          return (
            <TouchableOpacityBox
              mb="s16"
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              onPress={() => handleTripPress(item.id)}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
              {/* Time & Duration */}
              <Box flexDirection="row" alignItems="center" mb="s16">
                <Box flex={1}>
                  <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                    Saída
                  </Text>
                  <Text preset="headingSmall" color="text" bold>
                    {departureTime}
                  </Text>
                </Box>

                <Box alignItems="center" mx="s12">
                  <Icon name="arrow-forward" size={20} color="primary" />
                  <Text
                    preset="paragraphCaptionSmall"
                    color="textSecondary"
                    mt="s4">
                    {duration}
                  </Text>
                </Box>

                <Box flex={1} alignItems="flex-end">
                  <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                    Chegada
                  </Text>
                  <Text preset="headingSmall" color="text" bold>
                    {arrivalTime}
                  </Text>
                </Box>
              </Box>

              {/* Boat & Captain - Will show real data when backend populates */}
              <Box
                flexDirection="row"
                alignItems="center"
                mb="s12"
                paddingVertical="s12"
                paddingHorizontal="s16"
                backgroundColor="background"
                borderRadius="s12">
                <Icon name="directions-boat" size={20} color="secondary" />
                <Box flex={1} ml="s12">
                  <Text preset="paragraphMedium" color="text" bold>
                    Barco {item.boatId.slice(0, 8)}
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary">
                    Cap. {item.captainId.slice(0, 8)}
                  </Text>
                </Box>

                <Box flexDirection="row" alignItems="center">
                  <Icon name="star" size={16} color="warning" />
                  <Text
                    preset="paragraphSmall"
                    color="text"
                    bold
                    ml="s4"
                    mr="s8">
                    5.0
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary">
                    (0 viagens)
                  </Text>
                </Box>
              </Box>

              {/* Price & Seats */}
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between">
                <Box flexDirection="row" alignItems="baseline">
                  <Text preset="headingMedium" color="primary" bold>
                    R$ {item.price.toFixed(2)}
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary" ml="s4">
                    /pessoa
                  </Text>
                </Box>

                <Box
                  flexDirection="row"
                  alignItems="center"
                  backgroundColor={
                    item.availableSeats > 5 ? 'successBg' : 'warningBg'
                  }
                  paddingHorizontal="s12"
                  paddingVertical="s8"
                  borderRadius="s8">
                  <Icon
                    name="event-seat"
                    size={16}
                    color={item.availableSeats > 5 ? 'success' : 'warning'}
                  />
                  <Text
                    preset="paragraphSmall"
                    color={item.availableSeats > 5 ? 'success' : 'warning'}
                    bold
                    ml="s4">
                    {item.availableSeats} disponíveis
                  </Text>
                </Box>
              </Box>
            </TouchableOpacityBox>
          );
        }}
        ListEmptyComponent={
          <Box alignItems="center" paddingVertical="s48">
            <Icon name="search-off" size={64} color="border" />
            <Text preset="headingSmall" color="textSecondary" mt="s16">
              {error
                ? 'Erro ao buscar viagens'
                : isLoading
                ? 'Buscando...'
                : 'Nenhuma viagem encontrada'}
            </Text>
            <Text
              preset="paragraphMedium"
              color="textSecondary"
              mt="s8"
              textAlign="center">
              {error
                ? error.message
                : 'Tente ajustar sua busca ou selecionar outra data'}
            </Text>
          </Box>
        }
      />
    </Box>
  );
}
