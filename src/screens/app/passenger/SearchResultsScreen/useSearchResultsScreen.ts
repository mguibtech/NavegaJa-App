import {useEffect, useState} from 'react';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Trip, tripAcceptsShipments, useSearchTrips} from '@domain';
import {useToast} from '@hooks';
import {AppStackParamList} from '@routes';
import {logSearch} from '@services';

type SortOption = 'price' | 'time' | 'rating';

export function useSearchResultsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'SearchResults'>>();
  const {routeId, origin, destination, date, promotion, context} = route.params;
  const toast = useToast();

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
  const [boatType, setBoatType] = useState<string | undefined>(undefined);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);

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
      logSearch(origin ?? '', destination ?? '');
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
    setBoatType(undefined);
    setOnlyAvailable(false);
    setOnlyVerified(false);
    setShowFilters(false);
    loadTrips();
  };

  // Filtros client-side aplicados sobre os resultados já ordenados
  const filteredTrips = sortedTrips.filter(trip => {
    if (boatType && trip.boat?.type !== boatType) {return false;}
    if (onlyAvailable && trip.availableSeats === 0) {return false;}
    if (onlyVerified && !trip.boat?.isVerified) {return false;}
    if (context === 'shipment' && !tripAcceptsShipments(trip)) {return false;}
    return true;
  });

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

  const handleTripPress = (trip: Trip) => {
    if (context === 'shipment' && !tripAcceptsShipments(trip)) {
      toast.showWarning('Esta viagem nao aceita encomendas.');
      return;
    }

    navigation.navigate('TripDetails', {tripId: trip.id, promotion, context});
  };

  const handleGoBack = () => navigation.goBack();

  const hasActiveFilters = !!(minPrice || maxPrice || departureTime || minRating || boatType || onlyAvailable || onlyVerified);
  const activeFiltersCount = [
    minPrice, maxPrice, departureTime, minRating, boatType,
    onlyAvailable || undefined,
    onlyVerified || undefined,
  ].filter(Boolean).length;

  const sortOptions = [
    {value: 'price' as const, label: 'Menor Preço', icon: 'attach-money'},
    {value: 'time' as const, label: 'Mais Cedo', icon: 'schedule'},
    {value: 'rating' as const, label: 'Melhor Avaliado', icon: 'star'},
  ];

  const dateLabel = date
    ? new Date(date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'long'})
    : 'Qualquer data';

  const tripCountLabel =
    filteredTrips.length === 1
      ? '1 viagem encontrada'
      : `${filteredTrips.length} viagens encontradas`;

  return {
    origin,
    destination,
    date,
    promotion,
    context,
    trips: filteredTrips,
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
    boatType,
    setBoatType,
    onlyAvailable,
    setOnlyAvailable,
    onlyVerified,
    setOnlyVerified,
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
