import {useEffect, useState} from 'react';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Trip, useSearchTrips} from '@domain';
import {AppStackParamList} from '@routes';

type SortOption = 'price' | 'time' | 'rating';

export function useSearchResultsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'SearchResults'>>();
  const {routeId, origin, destination, date, promotion, context} = route.params;

  const {trips, search, isLoading, error} = useSearchTrips();
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [sortedTrips, setSortedTrips] = useState<Trip[]>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [departureTime, setDepartureTime] = useState<
    'morning' | 'afternoon' | 'night' | undefined
  >(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadTrips();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, origin, destination, date]);

  useEffect(() => {
    setSortedTrips(trips);
  }, [trips]);

  async function loadTrips() {
    try {
      const params: any = routeId
        ? {routeId, origin, destination, date}
        : {origin, destination, date};
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);
      if (departureTime) params.departureTime = departureTime;
      if (minRating) params.minRating = minRating;
      await search(params);
    } catch (err) {
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

  const handleSort = (option: SortOption) => {
    setSortBy(option);
    const sorted = [...sortedTrips].sort((a, b) => {
      if (option === 'price') {
        const priceA =
          typeof a.price === 'number' ? a.price : parseFloat(String(a.price)) || 0;
        const priceB =
          typeof b.price === 'number' ? b.price : parseFloat(String(b.price)) || 0;
        return priceA - priceB;
      }
      if (option === 'time') return a.departureAt.localeCompare(b.departureAt);
      if (option === 'rating') {
        const ratingA = a.captain?.rating ? Number(a.captain.rating) : 0;
        const ratingB = b.captain?.rating ? Number(b.captain.rating) : 0;
        return ratingB - ratingA;
      }
      return 0;
    });
    setSortedTrips(sorted);
  };

  const handleTripPress = (tripId: string) => {
    navigation.navigate('TripDetails', {tripId, promotion, context});
  };

  const handleGoBack = () => navigation.goBack();

  const hasActiveFilters = !!(minPrice || maxPrice || departureTime || minRating);
  const activeFiltersCount = [minPrice, maxPrice, departureTime, minRating].filter(
    Boolean,
  ).length;

  const sortOptions = [
    {value: 'price' as const, label: 'Menor Preço', icon: 'attach-money'},
    {value: 'time' as const, label: 'Mais Cedo', icon: 'schedule'},
    {value: 'rating' as const, label: 'Melhor Avaliado', icon: 'star'},
  ];

  const dateLabel = date
    ? new Date(date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'long'})
    : 'Qualquer data';

  const tripCountLabel =
    sortedTrips.length === 1
      ? '1 viagem encontrada'
      : `${sortedTrips.length} viagens encontradas`;

  return {
    origin,
    destination,
    date,
    promotion,
    context,
    trips: sortedTrips,
    isLoading,
    error,
    sortBy,
    showFilters,
    setShowFilters,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    departureTime,
    setDepartureTime,
    minRating,
    setMinRating,
    hasActiveFilters,
    activeFiltersCount,
    sortOptions,
    dateLabel,
    tripCountLabel,
    loadTrips,
    handleApplyFilters,
    handleClearFilters,
    handleSort,
    handleTripPress,
    handleGoBack,
  };
}
