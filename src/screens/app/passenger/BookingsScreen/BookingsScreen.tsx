import React from 'react';
import {FlatList, RefreshControl, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, BookingCardSkeleton, ConfirmationModal, Icon, Text, TouchableOpacityBox} from '@components';
import {Booking} from '@domain';
import {formatBRL} from '@utils';

import {useBookingsScreen} from './useBookingsScreen';

export function BookingsScreen() {
  const {top} = useSafeAreaInsets();
  const {
    selectedTab,
    setSelectedTab,
    refreshing,
    bookingToCancel,
    setBookingToCancel,
    bookingsError,
    fetchBookings,
    isCancelling,
    isLoadingBookings,
    filteredBookings,
    hasMoreBookings,
    loadMoreBookings,
    onRefresh,
    handleConfirmCancel,
    getStatusBadge,
    canCancelBooking,
    navigateToTicket,
    navigateToReview,
  } = useBookingsScreen();

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s20"
        paddingBottom="s16"
        backgroundColor="surface"
        style={{
          paddingTop: top + 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Text preset="headingMedium" color="text" bold mb="s16">
          Minhas Reservas
        </Text>

        <Box flexDirection="row" gap="s12">
          <TouchableOpacityBox
            flex={1}
            paddingVertical="s12"
            borderRadius="s12"
            backgroundColor={selectedTab === 'active' ? 'primary' : 'background'}
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
            backgroundColor={selectedTab === 'completed' ? 'primary' : 'background'}
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
      </Box>

      {bookingsError && (
        <Box
          flexDirection="row"
          alignItems="center"
          paddingHorizontal="s16"
          paddingVertical="s12"
          style={{backgroundColor: '#FEF3C7', borderBottomWidth: 1, borderBottomColor: '#FDE68A'}}>
          <Icon name="wifi-off" size={16} color="warning" />
          <Text preset="paragraphSmall" color="text" ml="s8" flex={1}>
            Sem conexão. Exibindo dados em cache.
          </Text>
          <TouchableOpacityBox onPress={() => fetchBookings().catch(() => {})} pl="s12">
            <Text preset="paragraphSmall" color="primary" bold>Tentar</Text>
          </TouchableOpacityBox>
        </Box>
      )}

      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 24}}
        onEndReached={loadMoreBookings}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          hasMoreBookings ? (
            <Box paddingVertical="s16" alignItems="center">
              <ActivityIndicator />
            </Box>
          ) : null
        }
        renderItem={({item}: {item: Booking}) => {
          const origin = item.trip?.origin || 'Origem desconhecida';
          const destination = item.trip?.destination || 'Destino desconhecido';
          const dateStr = item.trip?.departureAt;
          const timeStr = dateStr
            ? new Date(dateStr).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})
            : '--:--';
          const boatName = item.trip?.boat?.name || `Barco ${item.trip?.boatId?.slice(0, 8) || 'N/A'}`;
          const seats = item.quantity;
          const rawTotal = Number(item.totalPrice);
          const price =
            rawTotal > 0
              ? rawTotal
              : item.trip?.price
              ? Number(item.trip.price) * seats
              : 0;

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
            } catch {
              // ignore date format error
            }
          }

          const isActive =
            item.status === 'pending' ||
            item.status === 'confirmed' ||
            item.status === 'checked_in';
          const canCancel = canCancelBooking(item.status);
          const badge = getStatusBadge(item.status);
          const lockedCancelLabel =
            item.status === 'checked_in'
              ? 'Embarque realizado'
              : item.status === 'completed'
                ? 'Viagem concluída'
                : null;

          return (
            <TouchableOpacityBox
              mb="s16"
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              onPress={() => navigateToTicket(item.id)}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                mb="s16">
                <Text preset="paragraphCaptionSmall" color="textSecondary">
                  #{item.id?.slice(0, 8).toUpperCase() || 'N/A'}
                </Text>
                <Box
                  paddingHorizontal="s10"
                  paddingVertical="s4"
                  borderRadius="s8"
                  style={{backgroundColor: badge.bg}}>
                  <Text
                    preset="paragraphCaptionSmall"
                    bold
                    style={{color: badge.textColor}}>
                    {badge.label}
                  </Text>
                </Box>
              </Box>

              <Box flexDirection="row" alignItems="center" mb="s16">
                <Box flex={1}>
                  <Text preset="paragraphSmall" color="textSecondary" mb="s4">Origem</Text>
                  <Text preset="paragraphMedium" color="text" bold numberOfLines={1}>{origin}</Text>
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
                  <Text preset="paragraphSmall" color="textSecondary" mb="s4">Destino</Text>
                  <Text preset="paragraphMedium" color="text" bold numberOfLines={1}>{destination}</Text>
                </Box>
              </Box>

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

              <Box flexDirection="row" alignItems="center" mb="s16">
                <Icon name="directions-boat" size={18} color="secondary" />
                <Text preset="paragraphSmall" color="text" ml="s8" numberOfLines={1}>
                  {boatName}
                </Text>
              </Box>

              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                paddingTop="s16"
                borderTopWidth={1}
                borderTopColor="border">
                <Box>
                  <Text preset="paragraphSmall" color="textSecondary" mb="s4">Total pago</Text>
                  <Text preset="headingSmall" color="primary" bold>{formatBRL(price)}</Text>
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
                    {(item as Booking).childrenCount
                      ? ` · ${(item as Booking).childrenCount} criança${(item as Booking).childrenCount! > 1 ? 's' : ''}`
                      : ''}
                  </Text>
                </Box>
              </Box>

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
                    onPress={() => navigateToTicket(item.id)}>
                    <Icon name="qr-code" size={20} color="surface" />
                    <Text preset="paragraphMedium" color="surface" bold ml="s8">
                      Ver QR Code
                    </Text>
                  </TouchableOpacityBox>

                  {canCancel ? (
                    <TouchableOpacityBox
                      width={48}
                      height={48}
                      borderRadius="s12"
                      backgroundColor="dangerBg"
                      alignItems="center"
                      justifyContent="center"
                      onPress={() => setBookingToCancel(item)}>
                      <Icon name="close" size={20} color="danger" />
                    </TouchableOpacityBox>
                  ) : (
                    <Box
                      paddingHorizontal="s12"
                      borderRadius="s12"
                      backgroundColor="infoBg"
                      alignItems="center"
                      justifyContent="center">
                      <Text preset="paragraphCaptionSmall" color="info" bold textAlign="center">
                        Embarque realizado
                      </Text>
                    </Box>
                  )}
                </Box>
              )}

              {!isActive && lockedCancelLabel && (
                <Box
                  mt="s16"
                  paddingVertical="s12"
                  paddingHorizontal="s16"
                  borderRadius="s12"
                  backgroundColor="background"
                  alignItems="center">
                  <Text preset="paragraphSmall" color="textSecondary" bold>
                    {lockedCancelLabel}
                  </Text>
                </Box>
              )}

              {item.status === 'completed' && item.trip?.captainId && (
                <Box mt="s16">
                  <TouchableOpacityBox
                    paddingVertical="s12"
                    borderRadius="s12"
                    borderWidth={1}
                    borderColor="primary"
                    alignItems="center"
                    flexDirection="row"
                    justifyContent="center"
                    onPress={() =>
                      navigateToReview(
                        item.tripId,
                        item.trip?.captain?.name,
                        item.trip?.boat?.name,
                      )
                    }>
                    <Icon name="star" size={18} color="primary" />
                    <Text preset="paragraphMedium" color="primary" bold ml="s8">
                      Avaliar Viagem
                    </Text>
                  </TouchableOpacityBox>
                </Box>
              )}
            </TouchableOpacityBox>
          );
        }}
        ListEmptyComponent={
          isLoadingBookings ? (
            <Box paddingTop="s8">
              <BookingCardSkeleton />
              <BookingCardSkeleton />
              <BookingCardSkeleton />
            </Box>
          ) : (
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
          )
        }
      />

      <ConfirmationModal
        visible={!!bookingToCancel}
        title="Cancelar reserva?"
        message="Esta ação não pode ser desfeita. Deseja cancelar sua reserva?"
        confirmText="Sim, cancelar"
        cancelText="Voltar"
        icon="warning"
        iconColor="danger"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setBookingToCancel(null)}
      />
    </Box>
  );
}
