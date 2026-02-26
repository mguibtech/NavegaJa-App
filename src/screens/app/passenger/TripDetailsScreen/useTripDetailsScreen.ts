import {useEffect, useState} from 'react';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {FavoriteType, useMyFavorites, useToggleFavorite, useTripDetails} from '@domain';
import {AppStackParamList} from '@routes';

export function useTripDetailsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'TripDetails'>>();
  const {tripId, promotion, context} = route.params;

  const {trip, getTripById, isLoading, error} = useTripDetails(tripId);

  // Favorites hooks
  const {isFavorited, fetch: fetchFavorites} = useMyFavorites();
  const {toggle, isLoading: isTogglingFavorite} = useToggleFavorite();

  const [showLoadErrorModal, setShowLoadErrorModal] = useState(false);

  // State local para controlar se está favoritado (atualiza em tempo real)
  const [isFav, setIsFav] = useState(false);
  const [isBoatFav, setIsBoatFav] = useState(false);
  const [isCaptainFav, setIsCaptainFav] = useState(false);

  useEffect(() => {
    loadTripDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  // Atualiza state local quando trip muda ou favoritos carregam
  useEffect(() => {
    if (trip) {
      // Destino
      const favoritedDestination = isFavorited({
        type: FavoriteType.DESTINATION,
        destination: trip.destination,
        origin: trip.origin,
      });
      setIsFav(favoritedDestination);

      // Barco
      if (trip.boatId) {
        const favoritedBoat = isFavorited({
          type: FavoriteType.BOAT,
          boatId: trip.boatId,
        });
        setIsBoatFav(favoritedBoat);
      }

      // Capitão
      if (trip.captainId) {
        const favoritedCaptain = isFavorited({
          type: FavoriteType.CAPTAIN,
          captainId: trip.captainId,
        });
        setIsCaptainFav(favoritedCaptain);
      }
    }
  }, [trip, isFavorited]);

  async function loadTripDetails() {
    try {
      await getTripById(tripId);
    } catch {
      setShowLoadErrorModal(true);
    }
  }

  const handleBooking = () => {
    if (trip) {
      navigation.navigate('Booking', {tripId: trip.id});
    }
  };

  const handleCreateShipment = () => {
    if (trip) {
      navigation.navigate('CreateShipment', {tripId: trip.id});
    }
  };

  const handleToggleFavorite = async () => {
    if (!trip || isTogglingFavorite) return;

    try {
      const result = await toggle({
        type: FavoriteType.DESTINATION,
        destination: trip.destination,
        origin: trip.origin,
      });

      setIsFav(result.action === 'added');

      await fetchFavorites();
    } catch {
      console.log('Favorito salvo localmente');
    }
  };

  const handleToggleFavoriteBoat = async () => {
    if (!trip || !trip.boatId || isTogglingFavorite) return;

    try {
      const result = await toggle({
        type: FavoriteType.BOAT,
        boatId: trip.boatId,
      });

      setIsBoatFav(result.action === 'added');

      await fetchFavorites();
    } catch {
      console.log('Favorito de barco salvo localmente');
    }
  };

  const handleToggleFavoriteCaptain = async () => {
    if (!trip || !trip.captainId || isTogglingFavorite) return;

    try {
      const result = await toggle({
        type: FavoriteType.CAPTAIN,
        captainId: trip.captainId,
      });

      setIsCaptainFav(result.action === 'added');

      await fetchFavorites();
    } catch {
      console.log('Favorito de capitão salvo localmente');
    }
  };

  const handleNavigateToBoatDetail = () => {
    if (!trip) return;
    navigation.navigate('BoatDetail', {
      boatId: trip.boatId,
      boat: trip.boat,
    });
  };

  const handleNavigateToCaptainProfile = () => {
    if (!trip) return;
    navigation.navigate('CaptainProfile', {
      captainId: trip.captainId,
      captainName: trip.captain?.name,
      captainRating: trip.captain?.rating,
      captainTotalTrips: trip.captain?.totalTrips,
      captainLevel: trip.captain?.level,
      captainCreatedAt: trip.captain?.createdAt,
      captainAvatarUrl: trip.captain?.avatarUrl,
    });
  };

  const handleGoBack = () => navigation.goBack();

  const handleConfirmLoadError = () => {
    loadTripDetails();
    setShowLoadErrorModal(false);
  };

  const handleCancelLoadError = () => {
    setShowLoadErrorModal(false);
    navigation.goBack();
  };

  // Calculate data only when trip is available (to avoid breaking Rules of Hooks)
  const price =
    trip && typeof trip.price === 'number'
      ? trip.price
      : trip && typeof trip.price === 'string'
      ? parseFloat(trip.price)
      : 0;

  // Calculate discounted price if applicable
  // Use Boolean() to avoid {0} rendering bug in React Native (0 renders as text node in Box)
  const hasDiscount = Boolean(trip?.discount && trip.discount > 0);
  let basePrice = trip?.basePrice ? Number(trip.basePrice) : price;
  let discountedPrice = trip?.discountedPrice ? Number(trip.discountedPrice) : price;
  let displayPrice = hasDiscount ? discountedPrice : price;
  let finalHasDiscount = hasDiscount;
  let discountPercent = trip?.discount || 0;

  // Se vier de uma promoção, aplicar desconto da promoção
  if (promotion && !hasDiscount) {
    const promoText = `${promotion.title} ${promotion.description}`.toLowerCase();
    const percentMatch = promoText.match(/(\d+)%/);

    if (percentMatch) {
      const promoDiscount = parseInt(percentMatch[1], 10);
      basePrice = price;
      discountedPrice = price * (1 - promoDiscount / 100);
      displayPrice = discountedPrice;
      finalHasDiscount = true;
      discountPercent = promoDiscount;
    }
  }

  // Get boat and captain names
  const boatName =
    trip?.boat?.name || (trip ? `Barco ${trip.boatId.slice(0, 8)}` : 'Barco');
  const captainName =
    trip?.captain?.name ||
    (trip ? `Capitão ${trip.captainId.slice(0, 8)}` : 'Capitão');

  // Cargo price per kg (0 means "A combinar")
  const cargoPrice = trip
    ? typeof trip.cargoPriceKg === 'number'
      ? trip.cargoPriceKg
      : parseFloat(String(trip.cargoPriceKg)) || 0
    : 0;
  const hasCargoPrice = cargoPrice > 0;

  return {
    trip,
    isLoading,
    error,
    promotion,
    context,
    isFav,
    isBoatFav,
    isCaptainFav,
    isTogglingFavorite,
    showLoadErrorModal,
    price,
    basePrice,
    displayPrice,
    finalHasDiscount,
    discountPercent,
    boatName,
    captainName,
    cargoPrice,
    hasCargoPrice,
    handleBooking,
    handleCreateShipment,
    handleToggleFavorite,
    handleToggleFavoriteBoat,
    handleToggleFavoriteCaptain,
    handleNavigateToBoatDetail,
    handleNavigateToCaptainProfile,
    handleGoBack,
    handleConfirmLoadError,
    handleCancelLoadError,
    loadTripDetails,
  };
}
