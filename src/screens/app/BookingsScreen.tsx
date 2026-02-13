import React, {useState, useEffect} from 'react';
import {FlatList, RefreshControl} from 'react-native';

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {useMyBookings} from '@domain';

import {AppStackParamList, TabsParamList} from '@routes';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Bookings'>,
  NativeStackScreenProps<AppStackParamList>
>;

type BookingStatus = 'active' | 'completed';

// Mock data
const MOCK_BOOKINGS = [
  {
    id: '1',
    origin: 'Manaus',
    destination: 'Parintins',
    departureTime: '08:00',
    date: '2026-02-20',
    price: 85.0,
    seats: 2,
    boatName: 'Expresso Amazonas',
    status: 'active' as BookingStatus,
    qrCode: 'QR123456',
  },
  {
    id: '2',
    origin: 'Manaus',
    destination: 'Itacoatiara',
    departureTime: '09:30',
    date: '2026-02-18',
    price: 45.0,
    seats: 1,
    boatName: 'Rio Negro Express',
    status: 'active' as BookingStatus,
    qrCode: 'QR789012',
  },
  {
    id: '3',
    origin: 'Parintins',
    destination: 'Manaus',
    departureTime: '15:00',
    date: '2026-02-10',
    price: 85.0,
    seats: 1,
    boatName: 'Boto Cor de Rosa',
    status: 'completed' as BookingStatus,
    qrCode: 'QR345678',
  },
];

export function BookingsScreen({navigation}: Props) {
  const [selectedTab, setSelectedTab] = useState<BookingStatus>('active');
  const [refreshing, setRefreshing] = useState(false);
  const {bookings, fetch: fetchBookings} = useMyBookings();

  // Buscar bookings ao montar a tela
  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchBookings();
    } catch (_error) {
      console.error('Error refreshing bookings:', _error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filtrar bookings reais por status
  const filteredBookings = (() => {
    // Se não houver bookings reais, usar mock data como fallback
    const dataSource = bookings.length > 0 ? bookings : MOCK_BOOKINGS;

    return dataSource.filter((booking: any) => {
      if (selectedTab === 'active') {
        // Active: pending, confirmed, checked_in
        if (booking.status === 'active') return true; // Mock data
        return booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'checked_in'; // Real data
      } else {
        // Completed: completed, cancelled
        if (booking.status === 'completed') return true; // Mock data
        return booking.status === 'completed' || booking.status === 'cancelled'; // Real data
      }
    });
  })();

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
        <Text preset="headingSmall" color="text" bold textAlign="center">
          Minhas Reservas
        </Text>
      </Box>

      {/* Tabs */}
      <Box
        flexDirection="row"
        paddingHorizontal="s24"
        paddingTop="s16"
        gap="s12">
        <TouchableOpacityBox
          flex={1}
          paddingVertical="s12"
          borderRadius="s12"
          backgroundColor={selectedTab === 'active' ? 'primary' : 'surface'}
          alignItems="center"
          onPress={() => setSelectedTab('active')}>
          <Text
            preset="paragraphMedium"
            color={selectedTab === 'active' ? 'surface' : 'text'}
            bold>
            Ativas
          </Text>
        </TouchableOpacityBox>

        <TouchableOpacityBox
          flex={1}
          paddingVertical="s12"
          borderRadius="s12"
          backgroundColor={selectedTab === 'completed' ? 'primary' : 'surface'}
          alignItems="center"
          onPress={() => setSelectedTab('completed')}>
          <Text
            preset="paragraphMedium"
            color={selectedTab === 'completed' ? 'surface' : 'text'}
            bold>
            Concluídas
          </Text>
        </TouchableOpacityBox>
      </Box>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 24}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => {
          // Handle both mock data and real booking data
          const isMockData = 'date' in item;
          const origin = isMockData ? item.origin : item.trip?.origin || 'Origem desconhecida';
          const destination = isMockData ? item.destination : item.trip?.destination || 'Destino desconhecido';
          const dateStr = isMockData ? item.date : item.trip?.departureAt;
          const timeStr = isMockData ? item.departureTime : (item.trip?.departureAt ? new Date(item.trip.departureAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) : '--:--');
          const boatName = isMockData ? item.boatName : (item.trip?.boat?.name || `Barco ${item.trip?.boatId?.slice(0, 8) || 'N/A'}`);
          const price = isMockData ? item.price : item.totalPrice;
          const seats = isMockData ? item.seats : item.quantity;

          // Format date
          let formattedDate = 'Data não disponível';
          if (dateStr) {
            try {
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                });
              }
            } catch (e) {
              console.error('Error formatting date:', e);
            }
          }

          // Determine if active based on status
          const isActive = isMockData
            ? item.status === 'active'
            : (item.status === 'pending' || item.status === 'confirmed' || item.status === 'checked_in');

          return (
            <TouchableOpacityBox
              mb="s16"
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              onPress={() => navigation.navigate('Ticket', {bookingId: item.id})}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
              {/* Status Badge */}
              <Box
                position="absolute"
                top={16}
                right={16}
                backgroundColor={isActive ? 'successBg' : 'border'}
                paddingHorizontal="s12"
                paddingVertical="s8"
                borderRadius="s8">
                <Text
                  preset="paragraphSmall"
                  color={isActive ? 'success' : 'textSecondary'}
                  bold>
                  {isActive ? 'Ativa' : 'Concluída'}
                </Text>
              </Box>

              {/* Route Info */}
              <Box flexDirection="row" alignItems="center" mb="s16" mt="s8">
                <Box flex={1}>
                  <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                    Origem
                  </Text>
                  <Text preset="paragraphMedium" color="text" bold numberOfLines={1}>
                    {origin}
                  </Text>
                </Box>

                <Box
                  width={40}
                  height={40}
                  borderRadius="s20"
                  backgroundColor="primaryBg"
                  alignItems="center"
                  justifyContent="center"
                  mx="s12">
                  <Icon name="arrow-forward" size={20} color="primary" />
                </Box>

                <Box flex={1}>
                  <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                    Destino
                  </Text>
                  <Text preset="paragraphMedium" color="text" bold numberOfLines={1}>
                    {destination}
                  </Text>
                </Box>
              </Box>

              {/* Date & Time */}
              <Box
                flexDirection="row"
                alignItems="center"
                mb="s12"
                paddingVertical="s12"
                paddingHorizontal="s16"
                backgroundColor="background"
                borderRadius="s12">
                <Icon name="event" size={20} color="primary" />
                <Text preset="paragraphMedium" color="text" ml="s8" numberOfLines={1} flexShrink={1}>
                  {formattedDate}
                </Text>
                <Text preset="paragraphMedium" color="textSecondary" ml="s4">
                  às {timeStr}
                </Text>
              </Box>

              {/* Boat */}
              <Box flexDirection="row" alignItems="center" mb="s16">
                <Icon name="directions-boat" size={18} color="secondary" />
                <Text preset="paragraphSmall" color="text" ml="s8" numberOfLines={1}>
                  {boatName}
                </Text>
              </Box>

              {/* Footer */}
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                paddingTop="s16"
                borderTopWidth={1}
                borderTopColor="border">
                <Box>
                  <Text preset="paragraphSmall" color="textSecondary" mb="s4">
                    Total pago
                  </Text>
                  <Text preset="headingSmall" color="primary" bold>
                    R$ {(typeof price === 'number' ? price * seats : parseFloat(String(price)) * seats || 0).toFixed(2)}
                  </Text>
                </Box>

                <Box
                  flexDirection="row"
                  alignItems="center"
                  backgroundColor="primaryBg"
                  paddingHorizontal="s16"
                  paddingVertical="s10"
                  borderRadius="s8">
                  <Icon name="confirmation-number" size={18} color="primary" />
                  <Text preset="paragraphSmall" color="primary" bold ml="s8">
                    {seats} {seats === 1 ? 'passagem' : 'passagens'}
                  </Text>
                </Box>
              </Box>

              {/* Actions */}
              {isActive && (
                <Box mt="s16" flexDirection="row" gap="s12">
                  <TouchableOpacityBox
                    flex={1}
                    paddingVertical="s12"
                    borderRadius="s12"
                    backgroundColor="primary"
                    alignItems="center"
                    flexDirection="row"
                    justifyContent="center"
                    onPress={() => navigation.navigate('Ticket', {bookingId: item.id})}>
                    <Icon name="qr-code" size={20} color="surface" />
                    <Text preset="paragraphMedium" color="surface" bold ml="s8">
                      Ver QR Code
                    </Text>
                  </TouchableOpacityBox>

                  <TouchableOpacityBox
                    width={48}
                    height={48}
                    borderRadius="s12"
                    backgroundColor="dangerBg"
                    alignItems="center"
                    justifyContent="center">
                    <Icon name="close" size={20} color="danger" />
                  </TouchableOpacityBox>
                </Box>
              )}
            </TouchableOpacityBox>
          );
        }}
        ListEmptyComponent={
          <Box alignItems="center" paddingVertical="s48">
            <Icon
              name={selectedTab === 'active' ? 'receipt-long' : 'check-circle'}
              size={64}
              color="border"
            />
            <Text preset="headingSmall" color="textSecondary" mt="s16">
              Nenhuma reserva {selectedTab === 'active' ? 'ativa' : 'concluída'}
            </Text>
            <Text
              preset="paragraphMedium"
              color="textSecondary"
              mt="s8"
              textAlign="center">
              {selectedTab === 'active'
                ? 'Suas próximas viagens aparecerão aqui'
                : 'Seu histórico de viagens aparecerá aqui'}
            </Text>
          </Box>
        }
      />
      
    </Box>
  );
}
