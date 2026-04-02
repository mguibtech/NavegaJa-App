import React from 'react';
import {StyleSheet} from 'react-native';
import {Box, BookingCardSkeleton, ConfirmationModal, Icon, Text, TouchableOpacityBox, ScreenList} from '@components';
import {Booking} from '@domain';
import {formatBRL} from '@utils';

import {useBookingsScreen} from './useBookingsScreen';

const styles = StyleSheet.create({
  bookingCard: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});

function getBadgeBackgroundStyle(backgroundColor: string) {
  return {backgroundColor};
}

function getBadgeTextStyle(color: string) {
  return {color};
}

export function BookingsScreen() {
  const {
    selectedTab,
    setSelectedTab,
    refreshing,
    bookingToCancel,
    setBookingToCancel,
    bookingsError,
    isCancelling,
    isLoadingBookings,
    filteredBookings,
    onRefresh,
    handleConfirmCancel,
    getStatusBadge,
    canCancelBooking,
    navigateToTicket,
    navigateToReview,
  } = useBookingsScreen();

  const tabs = [
    {id: 'active', label: 'Ativas'},
    {id: 'completed', label: 'Concluídas'},
  ];

  return (
    <Box flex={1}>
      <ScreenList
        title="Minhas Reservas"
        data={filteredBookings}
        isLoading={isLoadingBookings}
        error={bookingsError}
        refreshing={refreshing}
        onRefresh={onRefresh}
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={tabId => setSelectedTab(tabId as 'active' | 'completed')}
        SkeletonComponent={BookingCardSkeleton}
        emptyIcon={selectedTab === 'active' ? 'receipt-long' : 'check-circle'}
        emptyTitle={`Nenhuma reserva ${selectedTab === 'active' ? 'ativa' : 'concluída'}`}
        emptyDescription={selectedTab === 'active' ? 'Suas próximas viagens aparecerão aqui' : 'Seu histórico de viagens aparecerá aqui'}
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

          return (
            <TouchableOpacityBox
              mb="s16"
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              onPress={() => navigateToTicket(item.id)}
              style={styles.bookingCard}>
              {/* Card Header */}
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
                  style={getBadgeBackgroundStyle(badge.bg)}>
                  <Text
                    preset="paragraphCaptionSmall"
                    bold
                    style={getBadgeTextStyle(badge.textColor)}>
                    {badge.label}
                  </Text>
                </Box>
              </Box>

              {/* Trip Info */}
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

              {/* Price & Seats */}
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

                  {canCancel && (
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
                  )}
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
