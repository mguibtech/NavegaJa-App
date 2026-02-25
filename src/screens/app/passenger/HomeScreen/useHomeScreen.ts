import {useEffect, useState} from 'react';
import {Dimensions, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuthStore} from '@store';
import {useMyBookings} from '@domain';
import {usePopularRoutes} from '@domain';
import {useMyFavorites, FavoriteType} from '@domain';
import {usePromotions} from '@domain';
import {useSosAlert} from '@domain';

import {AppStackParamList} from '@routes';

export const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Mock data - Popular Routes
// IMPORTANT: These names must match exactly with backend trips (origin/destination)
export const POPULAR_ROUTES = [
  {
    id: '1',
    origin: 'Manaus',
    destination: 'Parintins',
    price: 100.0,
    image: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=400',
    duration: '6h',
  },
  {
    id: '2',
    origin: 'Manaus',
    destination: 'Beruri', // Changed from Itacoatiara to match backend
    price: 45.0,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    duration: '2.5h',
  },
];

export function useHomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {user} = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  const {bookings, fetch: fetchBookings} = useMyBookings();
  const {data: popularData, fetch: fetchPopular} = usePopularRoutes();
  const {favorites, fetch: fetchFavorites} = useMyFavorites();
  const {promotions, fetch: fetchPromotions} = usePromotions();
  const {activeAlert, checkActiveAlert} = useSosAlert();

  // Buscar dados ao carregar a tela
  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      await Promise.all([
        fetchBookings(),
        fetchPopular().catch(() => {
          // Silently fail and use fallback mock data
          console.log('Using fallback popular routes');
        }),
        fetchFavorites().catch(() => {
          console.log('Error loading favorites');
        }),
        fetchPromotions().catch(() => {
          console.log('Error loading promotions');
        }),
        checkActiveAlert().catch(() => {
          console.log('Error checking SOS alert');
        }),
      ]);
    } catch (_error) {
      console.error('Error loading home data:', _error);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleNavigateToProfile = () => navigation.navigate('Profile' as any);
  const handleNavigateToNotifications = () => navigation.navigate('Notifications');
  const handleNavigateToFavorites = () => navigation.navigate('Favorites');
  const handleNavigateToSearch = () => (navigation as any).navigate('Search', {});
  const handleNavigateToPopularRoutes = () => navigation.navigate('PopularRoutes');
  const handleNavigateToBookings = () => navigation.navigate('Bookings' as any);

  const handlePopularRoutePress = (item: any) => {
    const origin =
      item.origin || item.from || item.originCity || item.departure || '';
    const destination =
      item.destination || item.to || item.destinationCity || item.arrival || '';
    // @ts-ignore - navigation will be typed properly with CompositeNavigationProp
    navigation.navigate('SearchResults', {
      routeId: item.routeId ?? null,
      origin,
      destination,
    });
  };

  const handleFavoritePress = (item: any) => {
    if (item.type === FavoriteType.DESTINATION) {
      navigation.navigate('SearchResults', {
        origin: item.origin || '',
        destination: item.destination || '',
      });
    } else {
      navigation.navigate('Favorites');
    }
  };

  const handleMyTripPress = (item: any) => {
    if (item.id && item.status) {
      navigation.navigate('Ticket', {bookingId: item.id});
    }
  };

  const handlePromoAction = (promo: any) => {
    if (promo.ctaAction === 'search' && promo.ctaValue) {
      // Parse "Manaus-Parintins" → {origin: "Manaus", destination: "Parintins"}
      const [origin, destination] = promo.ctaValue.split('-').map((s: string) => s.trim());

      if (origin && destination) {
        // Navega direto para resultados com origem/destino preenchidos
        // E passa a promoção para ser exibida na tela de resultados
        navigation.navigate('SearchResults', {
          origin,
          destination,
          promotion: promo,
        });
      } else {
        // Se não tiver origem/destino, vai para busca vazia
        (navigation as any).navigate('Search', {});
      }
    } else if (promo.ctaAction === 'url' && promo.ctaValue) {
      // Abre URL externa no navegador
      Linking.openURL(promo.ctaValue);
    } else if (promo.ctaAction === 'deeplink' && promo.ctaValue) {
      // Parse "TripDetails-abc123" ou "Booking-xyz789"
      const [screen, id] = promo.ctaValue.split('-').map((s: string) => s.trim());

      if (screen === 'TripDetails' && id) {
        navigation.navigate('TripDetails', {tripId: id});
      } else if (screen === 'Booking' && id) {
        navigation.navigate('Booking', {tripId: id});
      } else if (screen === 'Ticket' && id) {
        navigation.navigate('Ticket', {bookingId: id});
      } else {
        // Fallback: navega para a tela especificada sem parâmetros
        navigation.navigate(screen as any);
      }
    } else {
      // Fallback: navega para busca
      (navigation as any).navigate('Search', {});
    }
  };

  const handleSosPress = () => navigation.navigate('SosAlert', {});

  const handlePromoScroll = (event: any) => {
    const slideSize = SCREEN_WIDTH - 32;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentPromoIndex(index);
  };

  return {
    user,
    refreshing,
    currentPromoIndex,
    bookings,
    popularData,
    favorites,
    promotions,
    activeAlert,
    onRefresh,
    getGreeting,
    handleNavigateToProfile,
    handleNavigateToNotifications,
    handleNavigateToFavorites,
    handleNavigateToSearch,
    handleNavigateToPopularRoutes,
    handleNavigateToBookings,
    handlePopularRoutePress,
    handleFavoritePress,
    handleMyTripPress,
    handlePromoAction,
    handleSosPress,
    handlePromoScroll,
  };
}
