import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl, Modal, ScrollView, ImageBackground} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TextInput, TouchableOpacityBox, PromoBadge, TripListSkeleton} from '@components';
import {Trip, useSearchTrips} from '@domain';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'SearchResults'>;

type SortOption = 'price' | 'time' | 'rating';

// Helper function to calculate duration
function calculateDuration(departure: string, arrival: string): string {
  try {
    const dep = new Date(departure);
    const arr = new Date(arrival);

    // Check if dates are valid
    if (isNaN(dep.getTime()) || isNaN(arr.getTime())) {
      return '--';
    }

    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}min`;
  } catch {
    return '--';
  }
}

// Helper function to format time
function formatTime(dateString: string): string {
  try {
    if (!dateString) return '--:--';

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '--:--';
    }

    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

export function SearchResultsScreen({navigation, route}: Props) {
  const {origin, destination, date, promotion} = route.params;
  const {trips, search, isLoading, error} = useSearchTrips();
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [sortedTrips, setSortedTrips] = useState<Trip[]>([]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [departureTime, setDepartureTime] = useState<'morning' | 'afternoon' | 'night' | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

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
      const params: any = {origin, destination, date};

      // Adiciona filtros se definidos
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);
      if (departureTime) params.departureTime = departureTime;
      if (minRating) params.minRating = minRating;

      await search(params);
    } catch (err) {
      // Error is handled by the hook
      console.error('Failed to load trips:', err);
    }
  }

  const handleApplyFilters = () => {
    setShowFilters(false);
    loadTrips();
  };

  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setDepartureTime(undefined);
    setMinRating(undefined);
    setShowFilters(false);
    loadTrips();
  };

  const onRefresh = async () => {
    await loadTrips();
  };

  const handleSort = (option: SortOption) => {
    setSortBy(option);
    const sorted = [...sortedTrips].sort((a, b) => {
      if (option === 'price') {
        const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price)) || 0;
        const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price)) || 0;
        return priceA - priceB;
      }
      if (option === 'time')
        return a.departureAt.localeCompare(b.departureAt);
      // Sort by captain rating (descending - best first)
      if (option === 'rating') {
        const ratingA = a.captain?.rating
          ? typeof a.captain.rating === 'number'
            ? a.captain.rating
            : parseFloat(String(a.captain.rating))
          : 0;
        const ratingB = b.captain?.rating
          ? typeof b.captain.rating === 'number'
            ? b.captain.rating
            : parseFloat(String(b.captain.rating))
          : 0;
        return ratingB - ratingA; // Descending order
      }
      return 0;
    });
    setSortedTrips(sorted);
  };

  const handleTripPress = (tripId: string) => {
    navigation.navigate('TripDetails', {
      tripId,
      promotion, // Passa a promoção se existir
    });
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
        paddingTop="s40"
        paddingBottom="s12"
        backgroundColor="surface"
        borderBottomWidth={1}
        borderBottomColor="border">
        <Box flexDirection="row" alignItems="center" mb="s16">
          <TouchableOpacityBox
            width={40}
            height={40}
            alignItems="center"
            justifyContent="center"
            marginRight="s16"
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color="text" />
          </TouchableOpacityBox>

          <Box flex={1}>
            <Text preset="headingSmall" color="text" bold>
              {origin} → {destination}
            </Text>
            <Text preset="paragraphSmall" color="textSecondary" mt="s4">
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
            alignItems="center"
            justifyContent="center"
            onPress={() => setShowFilters(true)}>
            <Icon name="filter-list" size={22} color="text" />
            {/* Badge for active filters */}
            {(minPrice || maxPrice || departureTime || minRating) && (
              <Box
                width={8}
                height={8}
                borderRadius="s8"
                backgroundColor="danger"
                style={{position: 'absolute', top: 8, right: 8}}
              />
            )}
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
              borderWidth={1}
              borderColor={sortBy === option.value ? 'primary' : 'border'}
              backgroundColor={
                sortBy === option.value ? 'primaryBg' : 'background'
              }
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              onPress={() => handleSort(option.value)}>
              <Icon
                name={option.icon as any}
                size={16}
                color={sortBy === option.value ? 'primary' : 'text'}
              />
              <Text
                preset="paragraphSmall"
                color={sortBy === option.value ? 'primary' : 'text'}
                bold
                ml="s4">
                {option.label}
              </Text>
            </TouchableOpacityBox>
          ))}
        </Box>
      </Box>

      {/* Promotion Banner */}
      {promotion && (
        <Box paddingHorizontal="s24" paddingTop="s20" paddingBottom="s8">
          <Box
            borderRadius="s20"
            overflow="hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 6},
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}>
            <ImageBackground
              source={{uri: promotion.imageUrl}}
              style={{width: '100%', minHeight: 160}}
              imageStyle={{borderRadius: 20}}
              resizeMode="cover">
              {/* Gradient Overlay */}
              <Box
                flex={1}
                padding="s24"
                style={{
                  backgroundColor: promotion.backgroundColor?.startsWith('#')
                    ? `${promotion.backgroundColor}DD`
                    : promotion.backgroundColor || 'rgba(0, 0, 0, 0.4)',
                }}>
                {/* Badge Container */}
                <Box flexDirection="row" alignItems="center" mb="s12">
                  <Box
                    backgroundColor="surface"
                    paddingHorizontal="s12"
                    paddingVertical="s6"
                    borderRadius="s20"
                    flexDirection="row"
                    alignItems="center"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 2},
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}>
                    <Icon name="local-offer" size={14} color="danger" />
                    <Text preset="paragraphCaptionSmall" color="danger" bold ml="s4">
                      {'PROMOÇÃO ATIVA'}
                    </Text>
                  </Box>
                </Box>

                {/* Title */}
                <Text
                  preset="headingMedium"
                  color={promotion.textColor === 'light' || promotion.textColor?.includes('fff') ? 'surface' : 'text'}
                  bold
                  mb="s8"
                  style={{
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: {width: 0, height: 1},
                    textShadowRadius: 3,
                  }}>
                  {promotion.title}
                </Text>

                {/* Description */}
                <Text
                  preset="paragraphMedium"
                  color={promotion.textColor === 'light' || promotion.textColor?.includes('fff') ? 'surface' : 'text'}
                  mb="s16"
                  style={{
                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                    textShadowOffset: {width: 0, height: 1},
                    textShadowRadius: 2,
                  }}>
                  {promotion.description}
                </Text>

                {/* Bottom Row - Validity Dates */}
                <Box flexDirection="row" alignItems="center">
                  <Icon
                    name="schedule"
                    size={16}
                    color={promotion.textColor === 'light' || promotion.textColor?.includes('fff') ? 'surface' : 'text'}
                  />
                  <Text
                    preset="paragraphSmall"
                    color={promotion.textColor === 'light' || promotion.textColor?.includes('fff') ? 'surface' : 'text'}
                    bold
                    ml="s6"
                    style={{
                      textShadowColor: 'rgba(0, 0, 0, 0.2)',
                      textShadowOffset: {width: 0, height: 1},
                      textShadowRadius: 2,
                    }}>
                    {(() => {
                      try {
                        const start = new Date(promotion.startDate).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'});
                        const end = new Date(promotion.endDate).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'});
                        return `Válido de ${start} até ${end}`;
                      } catch {
                        return 'Promoção por tempo limitado';
                      }
                    })()}
                  </Text>
                </Box>
              </Box>
            </ImageBackground>
          </Box>
        </Box>
      )}

      {/* Results List */}
      {isLoading && sortedTrips.length === 0 ? (
        <Box padding="s24">
          <Box mb="s20">
            <Text preset="paragraphMedium" color="text" bold>
              Buscando viagens...
            </Text>
          </Box>
          <TripListSkeleton count={5} />
        </Box>
      ) : (
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
                {sortedTrips.length}{' viagens encontradas'}
              </Text>
            </Box>
          }
          renderItem={({item}) => {
          const departureTime = formatTime(item.departureAt);
          const arrivalTime = formatTime(item.estimatedArrivalAt);
          const duration = calculateDuration(item.departureAt, item.estimatedArrivalAt);

          // Formata a data de partida
          const departureDate = new Date(item.departureAt).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
          });

          // Defensive check for price - convert string to number if needed
          const price = typeof item.price === 'number'
            ? item.price
            : typeof item.price === 'string'
            ? parseFloat(item.price)
            : 0;

          // Calculate discounted price if applicable
          let hasDiscount = item.discount && item.discount > 0;
          let basePrice = item.basePrice ? Number(item.basePrice) : price;
          let discountedPrice = item.discountedPrice ? Number(item.discountedPrice) : price;
          let displayPrice = hasDiscount ? discountedPrice : price;
          let discountPercent = item.discount || 0;

          // Apply promotion discount if no existing discount
          if (promotion && !hasDiscount) {
            const promoText = `${promotion.title} ${promotion.description}`.toLowerCase();
            const percentMatch = promoText.match(/(\d+)%/);
            if (percentMatch) {
              const promoDiscount = parseInt(percentMatch[1], 10);
              basePrice = price;
              discountedPrice = price * (1 - promoDiscount / 100);
              displayPrice = discountedPrice;
              hasDiscount = true;
              discountPercent = promoDiscount;
            }
          }

          // Get boat and captain names from populated data
          const boatName = item.boat?.name || `Barco ${item.boatId.slice(0, 8)}`;
          const captainName = item.captain?.name || `Cap. ${item.captainId.slice(0, 8)}`;
          const captainRating = item.captain?.rating
            ? typeof item.captain.rating === 'number'
              ? item.captain.rating.toFixed(1)
              : item.captain.rating
            : '5.0';
          const captainTrips = item.captain?.totalTrips || 0;

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
              {/* Date Badge */}
              <Box
                backgroundColor="primaryBg"
                paddingHorizontal="s12"
                paddingVertical="s6"
                borderRadius="s8"
                alignSelf="flex-start"
                mb="s12">
                <Text preset="paragraphSmall" color="primary" bold>
                  {departureDate}
                </Text>
              </Box>

              {/* Time & Duration */}
              <Box flexDirection="row" alignItems="center" mb="s16">
                <Box flex={1}>
                  <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                    {'Saída'}
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
                    {'Chegada'}
                  </Text>
                  <Text preset="headingSmall" color="text" bold>
                    {arrivalTime}
                  </Text>
                </Box>
              </Box>

              {/* Boat & Captain */}
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
                    {boatName}
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary">
                    {captainName}
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
                    {captainRating}
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary">
                    {'('}{captainTrips}{' viagens)'}
                  </Text>
                </Box>
              </Box>

              {/* Price & Seats */}
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between">
                <Box flex={1}>
                  {hasDiscount && (
                    <Box flexDirection="row" alignItems="center" mb="s4">
                      <PromoBadge discount={item.discount!} size="small" />
                      <Text
                        preset="paragraphSmall"
                        color="textSecondary"
                        ml="s8"
                        style={{textDecorationLine: 'line-through'}}>
                        R$ {basePrice.toFixed(2)}
                      </Text>
                    </Box>
                  )}
                  <Box flexDirection="row" alignItems="baseline">
                    <Text preset="headingMedium" color="primary" bold>
                      R$ {displayPrice.toFixed(2)}
                    </Text>
                    <Text preset="paragraphSmall" color="textSecondary" ml="s4">
                      {'/pessoa'}
                    </Text>
                  </Box>
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
                    {`${item.availableSeats} disponíveis`}
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
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}>
        <Box
          flex={1}
          justifyContent="flex-end"
          style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <Box
            backgroundColor="surface"
            borderTopLeftRadius="s20"
            borderTopRightRadius="s20"
            paddingBottom="s24"
            maxHeight="80%">
            {/* Header */}
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal="s24"
              paddingTop="s20"
              paddingBottom="s16"
              borderBottomWidth={1}
              borderBottomColor="border">
              <TouchableOpacityBox onPress={() => setShowFilters(false)}>
                <Text preset="paragraphMedium" color="textSecondary">
                  {'Fechar'}
                </Text>
              </TouchableOpacityBox>
              <Text preset="headingSmall" color="text" bold>
                {'Filtros'}
              </Text>
              <TouchableOpacityBox onPress={handleClearFilters}>
                <Text preset="paragraphMedium" color="danger" bold>
                  {'Limpar'}
                </Text>
              </TouchableOpacityBox>
            </Box>

            <ScrollView
              contentContainerStyle={{padding: 24}}
              showsVerticalScrollIndicator={false}>
              {/* Price Range */}
              <Box mb="s24">
                <Text preset="paragraphMedium" color="text" bold mb="s12">
                  {'Faixa de Preço'}
                </Text>
                <Box flexDirection="row" gap="s12">
                  <Box flex={1}>
                    <TextInput
                      label="Mínimo"
                      placeholder="R$ 0"
                      value={minPrice}
                      onChangeText={setMinPrice}
                      keyboardType="numeric"
                    />
                  </Box>
                  <Box flex={1}>
                    <TextInput
                      label="Máximo"
                      placeholder="R$ 1000"
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      keyboardType="numeric"
                    />
                  </Box>
                </Box>
              </Box>

              {/* Departure Time */}
              <Box mb="s24">
                <Text preset="paragraphMedium" color="text" bold mb="s12">
                  {'Horário de Partida'}
                </Text>
                <Box flexDirection="row" gap="s8">
                  <TouchableOpacityBox
                    flex={1}
                    paddingVertical="s12"
                    paddingHorizontal="s16"
                    borderRadius="s12"
                    borderWidth={1}
                    borderColor={
                      departureTime === 'morning' ? 'primary' : 'border'
                    }
                    backgroundColor={
                      departureTime === 'morning' ? 'primaryBg' : 'background'
                    }
                    alignItems="center"
                    onPress={() =>
                      setDepartureTime(
                        departureTime === 'morning' ? undefined : 'morning',
                      )
                    }>
                    <Icon
                      name="wb-sunny"
                      size={20}
                      color={departureTime === 'morning' ? 'primary' : 'text'}
                    />
                    <Text
                      preset="paragraphSmall"
                      color={departureTime === 'morning' ? 'primary' : 'text'}
                      bold={departureTime === 'morning'}
                      mt="s4">
                      {'Manhã'}
                    </Text>
                    <Text
                      preset="paragraphCaptionSmall"
                      color="textSecondary"
                      mt="s4">
                      {'6h-12h'}
                    </Text>
                  </TouchableOpacityBox>

                  <TouchableOpacityBox
                    flex={1}
                    paddingVertical="s12"
                    paddingHorizontal="s16"
                    borderRadius="s12"
                    borderWidth={1}
                    borderColor={
                      departureTime === 'afternoon' ? 'primary' : 'border'
                    }
                    backgroundColor={
                      departureTime === 'afternoon' ? 'primaryBg' : 'background'
                    }
                    alignItems="center"
                    onPress={() =>
                      setDepartureTime(
                        departureTime === 'afternoon' ? undefined : 'afternoon',
                      )
                    }>
                    <Icon
                      name="wb-twilight"
                      size={20}
                      color={
                        departureTime === 'afternoon' ? 'primary' : 'text'
                      }
                    />
                    <Text
                      preset="paragraphSmall"
                      color={
                        departureTime === 'afternoon' ? 'primary' : 'text'
                      }
                      bold={departureTime === 'afternoon'}
                      mt="s4">
                      {'Tarde'}
                    </Text>
                    <Text
                      preset="paragraphCaptionSmall"
                      color="textSecondary"
                      mt="s4">
                      {'12h-18h'}
                    </Text>
                  </TouchableOpacityBox>

                  <TouchableOpacityBox
                    flex={1}
                    paddingVertical="s12"
                    paddingHorizontal="s16"
                    borderRadius="s12"
                    borderWidth={1}
                    borderColor={
                      departureTime === 'night' ? 'primary' : 'border'
                    }
                    backgroundColor={
                      departureTime === 'night' ? 'primaryBg' : 'background'
                    }
                    alignItems="center"
                    onPress={() =>
                      setDepartureTime(
                        departureTime === 'night' ? undefined : 'night',
                      )
                    }>
                    <Icon
                      name="nightlight"
                      size={20}
                      color={departureTime === 'night' ? 'primary' : 'text'}
                    />
                    <Text
                      preset="paragraphSmall"
                      color={departureTime === 'night' ? 'primary' : 'text'}
                      bold={departureTime === 'night'}
                      mt="s4">
                      {'Noite'}
                    </Text>
                    <Text
                      preset="paragraphCaptionSmall"
                      color="textSecondary"
                      mt="s4">
                      {'18h-6h'}
                    </Text>
                  </TouchableOpacityBox>
                </Box>
              </Box>

              {/* Minimum Rating */}
              <Box mb="s24">
                <Text preset="paragraphMedium" color="text" bold mb="s12">
                  {'Avaliação Mínima'}
                </Text>
                <Box flexDirection="row" gap="s8">
                  {[3, 3.5, 4, 4.5, 5].map(rating => (
                    <TouchableOpacityBox
                      key={rating}
                      flex={1}
                      paddingVertical="s12"
                      borderRadius="s12"
                      borderWidth={1}
                      borderColor={minRating === rating ? 'primary' : 'border'}
                      backgroundColor={
                        minRating === rating ? 'primaryBg' : 'background'
                      }
                      alignItems="center"
                      onPress={() =>
                        setMinRating(minRating === rating ? undefined : rating)
                      }>
                      <Icon
                        name="star"
                        size={18}
                        color={minRating === rating ? 'warning' : 'border'}
                      />
                      <Text
                        preset="paragraphSmall"
                        color={minRating === rating ? 'primary' : 'text'}
                        bold={minRating === rating}
                        mt="s4">
                        {`${rating}+`}
                      </Text>
                    </TouchableOpacityBox>
                  ))}
                </Box>
              </Box>

              {/* Active Filters Count */}
              {(minPrice || maxPrice || departureTime || minRating) && (
                <Box
                  backgroundColor="primaryBg"
                  padding="s16"
                  borderRadius="s12"
                  mb="s16">
                  <Text preset="paragraphMedium" color="primary" bold>
                    {[minPrice, maxPrice, departureTime, minRating].filter(
                      Boolean,
                    ).length}{' filtro(s) ativo(s)'}
                  </Text>
                </Box>
              )}
            </ScrollView>

            {/* Apply Button */}
            <Box paddingHorizontal="s24">
              <TouchableOpacityBox
                backgroundColor="primary"
                paddingVertical="s16"
                borderRadius="s12"
                alignItems="center"
                onPress={handleApplyFilters}>
                <Text preset="paragraphMedium" color="surface" bold>
                  {'Aplicar Filtros'}
                </Text>
              </TouchableOpacityBox>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
