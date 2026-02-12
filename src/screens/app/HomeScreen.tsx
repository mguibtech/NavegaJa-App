import React, {useEffect, useState} from 'react';
import {FlatList, Image, RefreshControl, ScrollView} from 'react-native';

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox} from '@components';
import {useAuthStore} from '../../store/auth.store';
import {useMyBookings} from '../../domain/App/Booking/useCases/useMyBookings';

import {AppStackParamList, TabsParamList} from '../../routes/AppStack';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Home'>,
  NativeStackScreenProps<AppStackParamList>
>;

// Mock data - Popular Routes
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
    destination: 'Itacoatiara',
    price: 45.0,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    duration: '2.5h',
  },
  {
    id: '3',
    origin: 'Manaus',
    destination: 'Tefé',
    price: 180.0,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    duration: '12h',
  },
];

// Mock data - My Next Trips
const MY_TRIPS = [
  {
    id: '1',
    origin: 'Manaus',
    destination: 'Tefé',
    date: '2026-02-20',
    time: '08:00',
    status: 'completed' as const,
  },
  {
    id: '2',
    origin: 'Manaus',
    destination: 'Canete',
    date: '2026-02-25',
    time: '14:30',
    status: 'upcoming' as const,
  },
];

export function HomeScreen({navigation}: Props) {
  const {user} = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {bookings, fetch: fetchBookings, isLoading: loadingBookings} = useMyBookings();

  // Buscar dados ao carregar a tela
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      await fetchBookings();
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderPopularRoute = ({item}: {item: any}) => {
    // Fallbacks para rotas da API que não têm price, image, duration
    const price = (item as any).price ?? 0;
    const image = (item as any).image ?? 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400';
    const duration = (item as any).duration ?? (item as any).estimatedDuration ? `${Math.floor((item as any).estimatedDuration / 60)}h` : '--';

    return (
      <TouchableOpacityBox
        mr="s16"
        backgroundColor="surface"
        borderRadius="s20"
        overflow="hidden"
        width={180}
        onPress={() => {
          // @ts-ignore - navigation will be typed properly with CompositeNavigationProp
          navigation.navigate('SearchResults', {
            origin: item.origin,
            destination: item.destination,
          });
        }}
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 5,
        }}>
        <Image
          source={{uri: image}}
          style={{width: '100%', height: 120}}
          resizeMode="cover"
        />
        <Box padding="s16">
          <Box flexDirection="row" alignItems="center" mb="s8">
            <Icon name="place" size={16} color="primary" />
            <Text preset="paragraphSmall" color="text" bold ml="s4">
              {item.origin}
            </Text>
            <Box mx="s4">
              <Icon name="arrow-forward" size={14} color="textSecondary" />
            </Box>
            <Text preset="paragraphSmall" color="text" bold>
              {item.destination}
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text preset="paragraphMedium" color="primary" bold>
              From R${price.toFixed(0)}
            </Text>
            <Box
              backgroundColor="primaryBg"
              paddingHorizontal="s8"
              paddingVertical="s4"
              borderRadius="s8">
              <Text preset="paragraphCaptionSmall" color="primary" bold>
                {duration}
              </Text>
            </Box>
          </Box>
        </Box>
      </TouchableOpacityBox>
    );
  };

  const renderMyTrip = ({item}: {item: typeof MY_TRIPS[0]}) => {
    const statusColor = item.status === 'completed' ? 'success' : 'warning';
    const statusBg = item.status === 'completed' ? 'successBg' : 'warningBg';
    const statusText = item.status === 'completed' ? 'COMPLETED' : 'UPCOMING';

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

        <Box flex={1}>
          <Box flexDirection="row" alignItems="center" mb="s8">
            <Text preset="paragraphMedium" color="text" bold>
              {item.origin}
            </Text>
            <Box mx="s8">
              <Icon name="arrow-forward" size={16} color="textSecondary" />
            </Box>
            <Text preset="paragraphMedium" color="text" bold>
              {item.destination}
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center">
            <Icon name="schedule" size={14} color="textSecondary" />
            <Text preset="paragraphSmall" color="textSecondary" ml="s4">
              {new Date(item.date).toLocaleDateString('pt-BR')} • {item.time}
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
        paddingTop="s56"
        paddingBottom="s28"
        backgroundColor="primary">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="s20">
          <Box>
            <Text preset="paragraphMedium" color="surface" opacity={0.9} mb="s4">
              NavegaJá App
            </Text>
            <Text preset="headingMedium" color="surface" bold>
              Olá, {user?.name?.split(' ')[0]}!
            </Text>
          </Box>
          <TouchableOpacityBox
            width={48}
            height={48}
            borderRadius="s24"
            backgroundColor="surface"
            alignItems="center"
            justifyContent="center"
            onPress={() => navigation.navigate('Profile')}>
            <Icon name="menu" size={24} color="primary" />
          </TouchableOpacityBox>
        </Box>

        {/* Search Bar */}
        <TouchableOpacityBox
          backgroundColor="surface"
          borderRadius="s16"
          paddingHorizontal="s16"
          paddingVertical="s14"
          flexDirection="row"
          alignItems="center"
          onPress={() => navigation.navigate('Search')}
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
          }}>
          <Icon name="search" size={22} color="textSecondary" />
          <Text preset="paragraphMedium" color="textSecondary" ml="s12" flex={1}>
            Origem or Destination
          </Text>
        </TouchableOpacityBox>
      </Box>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Popular Routes */}
        <Box mt="s24" mb="s28">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" px="s24" mb="s16">
            <Text preset="headingSmall" color="text" bold>
              Popular Routes
            </Text>
            <TouchableOpacityBox onPress={() => navigation.navigate('Search')}>
              <Text preset="paragraphMedium" color="primary" bold>
                View All
              </Text>
            </TouchableOpacityBox>
          </Box>

          <FlatList
            horizontal
            data={POPULAR_ROUTES}
            keyExtractor={item => item.id}
            renderItem={renderPopularRoute}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 24}}
          />
        </Box>

        {/* My Next Trips */}
        <Box px="s24" mb="s24">
          <Text preset="headingSmall" color="text" bold mb="s16">
            My Next Trips
          </Text>

          {(bookings.length > 0 ? bookings : MY_TRIPS).slice(0, 3).map((trip: any) => (
            <Box key={trip.id}>
              {renderMyTrip({item: trip})}
            </Box>
          ))}
        </Box>

        {/* Promo Card */}
        <Box px="s24" mb="s32">
          <Box
            backgroundColor="success"
            borderRadius="s20"
            padding="s24"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}>
            <Text preset="headingSmall" color="surface" bold mb="s8">
              Ganhe 25% de desconto
            </Text>
            <Text preset="paragraphMedium" color="surface" mb="s20" opacity={0.95}>
              Na sua primeira viagem com parceiros selecionados
            </Text>
            <Box alignSelf="flex-start">
              <TouchableOpacityBox
                backgroundColor="surface"
                paddingHorizontal="s20"
                paddingVertical="s12"
                borderRadius="s12">
                <Text preset="paragraphMedium" color="success" bold>
                  Aproveitar
                </Text>
              </TouchableOpacityBox>
            </Box>
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}
