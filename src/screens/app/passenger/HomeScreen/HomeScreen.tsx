import React, {useEffect, useState} from 'react';
import {FlatList, Image, RefreshControl, ScrollView, ImageBackground, Linking, Dimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox, EmergencyButton, WeatherWidget, WeatherAlertCard, UserAvatar} from '@components';
import {apiImageSource} from '@api/config';
import {useAuthStore} from '@store';
import {useToast} from '@hooks';
import {useMyBookings} from '@domain';
import {usePopularRoutes} from '@domain';
import {useMyFavorites, FavoriteType} from '@domain';
import {usePromotions} from '@domain';
import {useSosAlert} from '@domain';
import {Region, useWeatherAlerts, AlertSeverity} from '@domain';

import {AppStackParamList, TabsParamList} from '@routes';
import {formatBRL} from '@utils';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Home'>,
  NativeStackScreenProps<AppStackParamList>
>;

// Mock data - Popular Routes
// IMPORTANT: These names must match exactly with backend trips (origin/destination)
const POPULAR_ROUTES = [
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
    destination: 'Beruri',  // Changed from Itacoatiara to match backend
    price: 45.0,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    duration: '2.5h',
  },
];


export function HomeScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const {user} = useAuthStore();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  const {bookings, fetch: fetchBookings} = useMyBookings();
  const {data: popularData, fetch: fetchPopular} = usePopularRoutes();
  const {favorites, fetch: fetchFavorites} = useMyFavorites();
  const {promotions, fetch: fetchPromotions} = usePromotions();
  const {activeAlert, checkActiveAlert} = useSosAlert();
  const {alerts: weatherAlerts, fetchRegionAlerts} = useWeatherAlerts();

  const weatherRegion = user?.city
    ? user.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    : 'manaus';
  // Buscar dados ao carregar a tela
  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    const results = await Promise.allSettled([
      fetchBookings(),
      fetchPopular(),
      fetchFavorites(),
      fetchPromotions(),
      checkActiveAlert(),
      fetchRegionAlerts(weatherRegion as Region),
    ]);

    if (results[0].status === 'rejected') {
      toast.showError('Não foi possível carregar suas reservas. Puxe para atualizar.');
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

  const renderPopularRoute = ({item}: {item: any}) => {
    // Normaliza campos de rota (backend pode usar nomes diferentes)
    const origin =
      item.origin || item.from || item.originCity || item.departure || '';
    const destination =
      item.destination || item.to || item.destinationCity || item.arrival || '';
    // Use minPrice from API (PopularRoute) or price from mock data
    const price = item.minPrice ?? item.avgPrice ?? item.price ?? 0;
    const image = item.image ?? 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400';
    const tripsCount = item.tripsCount ?? item.count ?? item.total;

    return (
      <TouchableOpacityBox
        mr="s16"
        backgroundColor="surface"
        borderRadius="s20"
        overflow="hidden"
        width={190}
        onPress={() => {
          // @ts-ignore - navigation will be typed properly with CompositeNavigationProp
          navigation.navigate('SearchResults', {
            routeId: item.routeId ?? null,
            origin,
            destination,
          });
        }}
        accessibilityLabel={`${origin || 'Origem'} para ${destination || 'Destino'}. A partir de ${formatBRL(price)}`}
        accessibilityRole="button"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 5,
        }}>
        <Image
          source={apiImageSource(image)}
          style={{width: '100%', height: 110}}
          resizeMode="cover"
        />

        <Box padding="s16">
          {/* Route Title */}
          <Box mb="s12">
            <Box flexDirection="row" alignItems="center" mb="s6">
              <Text preset="paragraphMedium" color="text" bold numberOfLines={1} flexShrink={1}>
                {origin || 'Origem'}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center">
              <Box flexShrink={0}>
                <Icon name="arrow-forward" size={14} color="primary" />
              </Box>
              <Text preset="paragraphMedium" color="text" bold ml="s6" numberOfLines={1} flexShrink={1}>
                {destination || 'Destino'}
              </Text>
            </Box>
          </Box>

          {/* Price and Badge */}
          <Box flexDirection="row" alignItems="flex-end" justifyContent="space-between" gap="s8">
            <Box flex={1} minWidth={0}>
              <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
                A partir de
              </Text>
              <Text preset="headingSmall" color="primary" bold numberOfLines={1}>
                {formatBRL(price)}
              </Text>
            </Box>

            {!!tripsCount && (
              <Box
                backgroundColor="successBg"
                paddingHorizontal="s8"
                paddingVertical="s4"
                borderRadius="s8"
                flexShrink={0}>
                <Text preset="paragraphCaptionSmall" color="success" bold>
                  {String(tripsCount)}
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </TouchableOpacityBox>
    );
  };

  const renderFavorite = ({item}: {item: any}) => {
    const getIconName = () => {
      if (item.type === FavoriteType.DESTINATION) return 'place';
      if (item.type === FavoriteType.BOAT) return 'directions-boat';
      if (item.type === FavoriteType.CAPTAIN) return 'person';
      return 'favorite';
    };

    const getIconColor = () => {
      if (item.type === FavoriteType.DESTINATION) return 'primary';
      if (item.type === FavoriteType.BOAT) return 'secondary';
      if (item.type === FavoriteType.CAPTAIN) return 'warning';
      return 'primary';
    };

    const getBgColor = () => {
      if (item.type === FavoriteType.DESTINATION) return 'primaryBg';
      if (item.type === FavoriteType.BOAT) return 'secondaryBg';
      if (item.type === FavoriteType.CAPTAIN) return 'warningBg';
      return 'primaryBg';
    };

    const getTitle = () => {
      if (item.type === FavoriteType.DESTINATION) {
        return `${item.origin || 'Qualquer'} → ${item.destination}`;
      }
      if (item.type === FavoriteType.BOAT) {
        return item.boat?.name || `Barco ${item.boatId?.slice(0, 8)}`;
      }
      if (item.type === FavoriteType.CAPTAIN) {
        return item.captain?.name || `Capitão ${item.captainId?.slice(0, 8)}`;
      }
      return 'Favorito';
    };

    const getSubtitle = () => {
      if (item.type === FavoriteType.BOAT && item.boat?.capacity) {
        return `${item.boat.capacity} lugares`;
      }
      if (item.type === FavoriteType.CAPTAIN && item.captain) {
        return `⭐ ${parseFloat(item.captain.rating).toFixed(1)} • ${item.captain.totalTrips} viagens`;
      }
      return item.type === FavoriteType.DESTINATION ? 'Destino' : item.type === FavoriteType.BOAT ? 'Barco' : 'Capitão';
    };

    return (
      <TouchableOpacityBox
        mr="s16"
        backgroundColor="surface"
        borderRadius="s16"
        padding="s16"
        width={180}
        accessibilityLabel={getTitle()}
        accessibilityRole="button"
        onPress={() => {
          if (item.type === FavoriteType.DESTINATION) {
            navigation.navigate('SearchResults', {
              origin: item.origin || '',
              destination: item.destination || '',
            });
          } else {
            navigation.navigate('Favorites');
          }
        }}
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Box
          width={48}
          height={48}
          borderRadius="s12"
          backgroundColor={getBgColor()}
          alignItems="center"
          justifyContent="center"
          mb="s12">
          <Icon name={getIconName()} size={24} color={getIconColor()} />
        </Box>

        <Text preset="paragraphMedium" color="text" bold numberOfLines={1} mb="s6">
          {getTitle()}
        </Text>

        <Text preset="paragraphSmall" color="textSecondary" numberOfLines={1}>
          {getSubtitle()}
        </Text>
      </TouchableOpacityBox>
    );
  };

  const renderMyTrip = ({item}: {item: any}) => {
    const origin = item.trip?.origin || 'Origem desconhecida';
    const destination = item.trip?.destination || 'Destino desconhecido';
    const dateStr = item.trip?.departureAt;
    const timeStr = dateStr ? new Date(dateStr).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) : null;

    const displayStatus: 'completed' | 'upcoming' =
      item.status === 'completed' ? 'completed' : 'upcoming';

    const statusColor = displayStatus === 'completed' ? 'success' : 'warning';
    const statusBg = displayStatus === 'completed' ? 'successBg' : 'warningBg';
    const statusText = displayStatus === 'completed' ? 'CONCLUÍDA' : 'PRÓXIMA';

    // Format date safely
    let formattedDate = 'Data não disponível';
    if (dateStr) {
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString('pt-BR');
        }
      } catch (e) {
        console.error('Error formatting date:', e);
      }
    }

    return (
      <TouchableOpacityBox
        mb="s16"
        backgroundColor="surface"
        borderRadius="s20"
        padding="s20"
        flexDirection="row"
        alignItems="center"
        onPress={() => {
          // Se for um booking, navega para Ticket, senão para TripDetails
          if (item.id && item.status) {
            navigation.navigate('Ticket', {bookingId: item.id});
          }
        }}
        accessibilityLabel={`${origin} para ${destination}. ${formattedDate}. Status: ${statusText}`}
        accessibilityRole="button"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 3},
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 4,
        }}>
        <Box
          width={50}
          height={50}
          borderRadius="s12"
          backgroundColor="primaryBg"
          alignItems="center"
          justifyContent="center"
          mr="s16">
          <Icon name="directions-boat" size={26} color="primary" />
        </Box>

        <Box flex={1} minWidth={0}>
          <Box flexDirection="row" alignItems="center" mb="s8" flexWrap="nowrap">
            <Text preset="paragraphMedium" color="text" bold numberOfLines={1} flexShrink={1}>
              {origin}
            </Text>
            <Box mx="s8" flexShrink={0}>
              <Icon name="arrow-forward" size={16} color="textSecondary" />
            </Box>
            <Text preset="paragraphMedium" color="text" bold numberOfLines={1} flexShrink={1}>
              {destination}
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center">
            <Icon name="schedule" size={14} color="textSecondary" />
            <Text preset="paragraphSmall" color="textSecondary" ml="s4" numberOfLines={1}>
              {formattedDate} • {timeStr || '--:--'}
            </Text>
          </Box>
        </Box>

        <Box
          backgroundColor={statusBg}
          paddingHorizontal="s12"
          paddingVertical="s6"
          borderRadius="s12">
          <Text preset="paragraphCaptionSmall" color={statusColor} bold>
            {statusText}
          </Text>
        </Box>
      </TouchableOpacityBox>
    );
  };

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s24"
        paddingBottom="s16"
        backgroundColor="surface"
        style={{
          paddingTop: top + 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          {/* User Info with Avatar */}
          <Box flexDirection="row" alignItems="center" flex={1}>
            <TouchableOpacityBox
              marginRight="s12"
              onPress={() => navigation.navigate('Profile')}
              accessibilityLabel={`Perfil de ${user?.name?.split(' ')[0] ?? 'usuário'}`}
              accessibilityRole="button">
              <UserAvatar
                userId={user?.id}
                avatarUrl={user?.avatarUrl ?? undefined}
                name={user?.name}
                gender={user?.gender}
                size="md"
              />
            </TouchableOpacityBox>

            <Box flex={1}>
              <Text preset="paragraphMedium" color="text" bold>
                Olá, {user?.name?.split(' ')[0]} 👋
              </Text>
              <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                {getGreeting()}
              </Text>
            </Box>
          </Box>

          {/* Action Icons */}
          <Box flexDirection="row" gap="s8">
            {/* Notifications Icon */}
            <TouchableOpacityBox
              width={44}
              height={44}
              borderRadius="s24"
              backgroundColor="background"
              alignItems="center"
              justifyContent="center"
              onPress={() => navigation.navigate('Notifications')}
              accessibilityLabel="Notificações"
              accessibilityRole="button"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.08,
                shadowRadius: 3,
                elevation: 2,
              }}>
              <Icon name="notifications-none" size={22} color="text" />
              {/* Badge for unread notifications */}
              <Box
                width={8}
                height={8}
                borderRadius="s8"
                backgroundColor="danger"
                style={{position: 'absolute', top: 8, right: 8}}
              />
            </TouchableOpacityBox>

            {/* Favorites Icon */}
            <TouchableOpacityBox
              width={44}
              height={44}
              borderRadius="s24"
              backgroundColor="background"
              alignItems="center"
              justifyContent="center"
              onPress={() => navigation.navigate('Favorites')}
              accessibilityLabel={favorites && favorites.length > 0 ? `Favoritos, ${favorites.length} ${favorites.length === 1 ? 'item' : 'itens'}` : 'Favoritos'}
              accessibilityRole="button"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.08,
                shadowRadius: 3,
                elevation: 2,
              }}>
              <Icon name="favorite-border" size={22} color="text" />
              {favorites && favorites.length > 0 && (
                <Box
                  backgroundColor="danger"
                  borderRadius="s12"
                  minWidth={18}
                  height={18}
                  alignItems="center"
                  justifyContent="center"
                  paddingHorizontal="s4"
                  style={{position: 'absolute', top: -4, right: -4}}>
                  <Text preset="paragraphCaptionSmall" color="surface" bold>
                    {favorites.length > 9 ? '9+' : favorites.length}
                  </Text>
                </Box>
              )}
            </TouchableOpacityBox>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Simple Search Bar */}
        <Box paddingHorizontal="s24" mt="s24">
          <TouchableOpacityBox
            backgroundColor="surface"
            borderRadius="s16"
            paddingHorizontal="s20"
            paddingVertical="s16"
            flexDirection="row"
            alignItems="center"
            onPress={() => navigation.navigate('Search', {})}
            accessibilityLabel="Buscar viagens"
            accessibilityRole="button"
            accessibilityHint="Toque para buscar sua próxima viagem fluvial"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Icon name="search" size={24} color="textSecondary" />
            <Text preset="paragraphLarge" color="textSecondary" ml="s12" flex={1}>
              Para onde você quer ir?
            </Text>
          </TouchableOpacityBox>
        </Box>

        {/* Community Onboarding Banner — shown once when homeCommunity is not set */}
        {!user?.homeCommunity && (
          <Box
            marginHorizontal="s24"
            mt="s16"
            backgroundColor="infoBg"
            borderRadius="s12"
            padding="s16"
            flexDirection="row"
            alignItems="flex-start">
            <Icon name="location-on" size={20} color="info" />
            <Box flex={1} ml="s12">
              <Text preset="paragraphSmall" color="text" bold mb="s4">
                Informe sua comunidade
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s12">
                Diga onde você mora para que capitães da sua região te encontrem com mais facilidade.
              </Text>
              <TouchableOpacityBox
                onPress={() => navigation.navigate('EditProfile')}
                backgroundColor="info"
                borderRadius="s8"
                paddingVertical="s8"
                paddingHorizontal="s12"
                alignSelf="flex-start">
                <Text preset="paragraphCaptionSmall" color="surface" bold>
                  Adicionar localidade
                </Text>
              </TouchableOpacityBox>
            </Box>
          </Box>
        )}

        {/* Quick Stats */}
        <Box paddingHorizontal="s24" mt="s24" mb="s24">
          <Box flexDirection="row" gap="s12">
            {/* Total Trips */}
            <Box
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s16"
              alignItems="center"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Icon name="confirmation-number" size={28} color="primary" />
              <Text preset="headingSmall" color="text" bold mt="s8">
                {user?.totalTrips || 0}
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4" textAlign="center">
                Viagens
              </Text>
            </Box>

            {/* Total Points */}
            <Box
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s16"
              alignItems="center"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Icon name="stars" size={28} color="warning" />
              <Text preset="headingSmall" color="text" bold mt="s8">
                {user?.totalPoints || 0}
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4" textAlign="center">
                Pontos
              </Text>
            </Box>

            {/* Level */}
            <Box
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s16"
              alignItems="center"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Icon name="military-tech" size={28} color="secondary" />
              <Text preset="headingSmall" color="text" bold mt="s8" numberOfLines={1}>
                {user?.level || 'N/A'}
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4" textAlign="center">
                Nível
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Weather Alert Banner — apenas severe/extreme */}
        {(() => {
          const topAlert = weatherAlerts
            .filter(
              a =>
                a.severity === AlertSeverity.SEVERE ||
                a.severity === AlertSeverity.EXTREME,
            )
            .sort((a, b) =>
              a.severity === AlertSeverity.EXTREME ? -1 : b.severity === AlertSeverity.EXTREME ? 1 : 0,
            )[0];
          return topAlert ? (
            <Box paddingHorizontal="s24" mt="s16">
              <WeatherAlertCard alert={topAlert} compact />
            </Box>
          ) : null;
        })()}

        {/* Weather Widget */}
        <Box paddingHorizontal="s24" mt="s16">
          <WeatherWidget
            region={weatherRegion as Region}
            onPress={() => navigation.navigate('WeatherScreen', {region: weatherRegion})}
          />
        </Box>

        {/* Popular Routes */}
        <Box mt="s24" mb="s28">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" px="s24" mb="s16">
            <Text preset="headingSmall" color="text" bold>
              Rotas Populares
            </Text>
            <TouchableOpacityBox
              onPress={() => navigation.navigate('PopularRoutes')}
              accessibilityLabel="Ver todas as rotas populares"
              accessibilityRole="button">
              <Text preset="paragraphMedium" color="primary" bold>
                Ver todas
              </Text>
            </TouchableOpacityBox>
          </Box>

          {(popularData?.routes || POPULAR_ROUTES).length === 0 ? (
            <Box
              mx="s24"
              backgroundColor="surface"
              borderRadius="s16"
              padding="s32"
              alignItems="center"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
              <Icon name="route" size={48} color="border" />
              <Text preset="paragraphMedium" color="textSecondary" mt="s16" textAlign="center">
                Nenhuma rota popular disponível no momento
              </Text>
            </Box>
          ) : (
            <FlatList
              horizontal
              data={popularData?.routes || POPULAR_ROUTES}
              keyExtractor={(item, index) => (item as any).id || `${item.origin}-${item.destination}-${index}`}
              renderItem={renderPopularRoute}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingHorizontal: 24}}
            />
          )}
        </Box>

        {/* Favorites Section */}
        {favorites && favorites.length > 0 && (
          <Box mt="s24" mb="s28">
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" px="s24" mb="s16">
              <Text preset="headingSmall" color="text" bold>
                Meus Favoritos
              </Text>
              <TouchableOpacityBox
                onPress={() => navigation.navigate('Favorites')}
                accessibilityLabel="Ver todos os favoritos"
                accessibilityRole="button">
                <Text preset="paragraphMedium" color="primary" bold>
                  Ver todos
                </Text>
              </TouchableOpacityBox>
            </Box>

            <FlatList
              horizontal
              data={favorites.slice(0, 5)}
              keyExtractor={item => item.id}
              renderItem={renderFavorite}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingHorizontal: 24}}
            />
          </Box>
        )}

        {/* My Next Trips */}
        <Box px="s24" mb="s24">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="s16">
            <Text preset="headingSmall" color="text" bold>
              Minhas Próximas Viagens
            </Text>
            <TouchableOpacityBox
              onPress={() => navigation.navigate('Bookings')}
              accessibilityLabel="Ver todas as viagens"
              accessibilityRole="button">
              <Text preset="paragraphMedium" color="primary" bold>
                Ver todas
              </Text>
            </TouchableOpacityBox>
          </Box>

          {(() => {
            // Filtrar apenas viagens ativas/futuras (não concluídas ou canceladas)
            const activeBookings = bookings.filter(booking =>
              booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'checked_in'
            );

            // Se não houver nenhuma viagem futura
            if (activeBookings.length === 0) {
              return (
                <Box
                  backgroundColor="surface"
                  borderRadius="s16"
                  padding="s32"
                  alignItems="center"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}>
                  <Icon name="luggage" size={48} color="border" />
                  <Text preset="paragraphMedium" color="textSecondary" mt="s16" textAlign="center">
                    Você ainda não tem viagens agendadas
                  </Text>
                  <TouchableOpacityBox
                    mt="s16"
                    backgroundColor="primary"
                    paddingHorizontal="s20"
                    paddingVertical="s12"
                    borderRadius="s12"
                    onPress={() => navigation.navigate('Search', {})}>
                    <Text preset="paragraphMedium" color="surface" bold>
                      Buscar Viagens
                    </Text>
                  </TouchableOpacityBox>
                </Box>
              );
            }

            // Pegar apenas as 3 próximas
            return activeBookings.slice(0, 3).map((trip: any) => (
              <Box key={trip.id}>
                {renderMyTrip({item: trip})}
              </Box>
            ));
          })()}
        </Box>

        {/* Dynamic Promo Cards - Carousel */}
        {promotions.length > 0 && (
          <Box mb="s32">
            <FlatList
              horizontal
              data={promotions}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              snapToInterval={SCREEN_WIDTH - 32}
              decelerationRate="fast"
              contentContainerStyle={{paddingHorizontal: 24, gap: 16}}
              onScroll={event => {
                const slideSize = SCREEN_WIDTH - 32;
                const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
                setCurrentPromoIndex(index);
              }}
              scrollEventThrottle={16}
              renderItem={({item: promo}) => {
                // Normalizar textColor: aceita "light", "dark", ou cores hex
                const isLightText =
                  promo.textColor === 'light' ||
                  promo.textColor?.toLowerCase().includes('fff') ||
                  promo.textColor?.toLowerCase().includes('white');

                const textColor = isLightText ? 'surface' : 'text';
                const buttonBg = isLightText ? 'surface' : 'primary';
                const buttonTextColor = isLightText ? 'primary' : 'surface';

                // Normalizar backgroundColor: se não tiver alpha, adiciona
                const bgColor = promo.backgroundColor?.startsWith('#')
                  ? `${promo.backgroundColor}CC` // Adiciona alpha 80%
                  : promo.backgroundColor || 'rgba(0, 0, 0, 0.3)';

                // Formatar datas de validade
                const formatPromoDate = (dateStr: string) => {
                  try {
                    const date = new Date(dateStr);
                    return date.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    });
                  } catch {
                    return '';
                  }
                };

                const startDate = formatPromoDate(promo.startDate);
                const endDate = formatPromoDate(promo.endDate);
                const validityText = startDate && endDate ? `Válido de ${startDate} até ${endDate}` : '';

                const handlePromoAction = () => {
                  if (promo.ctaAction === 'search' && promo.ctaValue) {
                    // Parse "Manaus-Parintins" → {origin: "Manaus", destination: "Parintins"}
                    const [origin, destination] = promo.ctaValue.split('-').map(s => s.trim());

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
                      navigation.navigate('Search', {});
                    }
                  } else if (promo.ctaAction === 'url' && promo.ctaValue) {
                    // Abre URL externa no navegador
                    Linking.openURL(promo.ctaValue);
                  } else if (promo.ctaAction === 'deeplink' && promo.ctaValue) {
                    // Parse "TripDetails-abc123" ou "Booking-xyz789"
                    const [screen, id] = promo.ctaValue.split('-').map(s => s.trim());

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
                    navigation.navigate('Search', {});
                  }
                };

                return (
                  <Box
                    width={SCREEN_WIDTH - 48}
                    marginRight="s16"
                    borderRadius="s20"
                    overflow="hidden"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 4},
                      shadowOpacity: 0.15,
                      shadowRadius: 12,
                      elevation: 6,
                    }}>
                    <ImageBackground
                      source={apiImageSource(promo.imageUrl)}
                      style={{width: '100%', minHeight: 200}}
                      imageStyle={{borderRadius: 20}}
                      resizeMode="cover">
                      {/* Gradient overlay for better text readability */}
                      <Box
                        flex={1}
                        padding="s24"
                        style={{
                          backgroundColor: bgColor,
                        }}>
                        <Text preset="headingSmall" color={textColor} bold mb="s8">
                          {promo.title}
                        </Text>
                        <Text
                          preset="paragraphMedium"
                          color={textColor}
                          mb="s12"
                          opacity={0.95}>
                          {promo.description}
                        </Text>

                        {/* Validity Dates */}
                        {validityText && (
                          <Box flexDirection="row" alignItems="center" mb="s16">
                            <Icon name="schedule" size={16} color={textColor} />
                            <Text
                              preset="paragraphSmall"
                              color={textColor}
                              ml="s6"
                              opacity={0.9}>
                              {validityText}
                            </Text>
                          </Box>
                        )}

                        <Box alignSelf="flex-start">
                          <TouchableOpacityBox
                            backgroundColor={buttonBg}
                            paddingHorizontal="s20"
                            paddingVertical="s12"
                            borderRadius="s12"
                            onPress={handlePromoAction}
                            accessibilityLabel={promo.ctaText}
                            accessibilityRole="button">
                            <Text
                              preset="paragraphMedium"
                              color={buttonTextColor}
                              bold>
                              {promo.ctaText}
                            </Text>
                          </TouchableOpacityBox>
                        </Box>
                      </Box>
                    </ImageBackground>
                  </Box>
                );
              }}
            />

            {/* Indicadores de Página */}
            {promotions.length > 1 && (
              <Box
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                gap="s8"
                mt="s16">
                {promotions.map((_, index) => (
                  <Box
                    key={index}
                    width={currentPromoIndex === index ? 24 : 8}
                    height={8}
                    borderRadius="s8"
                    backgroundColor={
                      currentPromoIndex === index ? 'primary' : 'border'
                    }
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </ScrollView>

      {/* Emergency SOS Button */}
      <EmergencyButton
        onPress={() => navigation.navigate('SosAlert', {})}
        hasActiveAlert={!!activeAlert}
      />
    </Box>
  );
}
