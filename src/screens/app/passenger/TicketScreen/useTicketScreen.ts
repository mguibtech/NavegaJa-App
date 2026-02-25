import {useEffect, useState} from 'react';
import {Share} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {BookingStatus, PaymentMethod, useBookingDetails, useCancelBooking, useTripDetails} from '@domain';
import type {AppStackParamList} from '@routes';
import {formatBRL} from '@utils';

export type TicketStatus = 'confirmed' | 'active' | 'completed' | 'cancelled' | 'pending';

export function useTicketScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'Ticket'>>();
  const {bookingId} = route.params;

  const {booking, isLoading: bookingLoading, error: bookingError} = useBookingDetails(bookingId);
  const {trip, isLoading: tripLoading} = useTripDetails(booking?.tripId);
  const isLoading = bookingLoading || tripLoading;

  const [showLoadErrorModal, setShowLoadErrorModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [showCancelErrorModal, setShowCancelErrorModal] = useState(false);

  const {cancel} = useCancelBooking();

  useEffect(() => {
    if (bookingError) {
      setShowLoadErrorModal(true);
    }
  }, [bookingError]);

  function mapBookingStatusToTicketStatus(status: BookingStatus): TicketStatus {
    switch (status) {
      case BookingStatus.PENDING:    return 'pending';
      case BookingStatus.CONFIRMED:  return 'confirmed';
      case BookingStatus.CHECKED_IN: return 'active';
      case BookingStatus.COMPLETED:  return 'completed';
      case BookingStatus.CANCELLED:  return 'cancelled';
      default:                       return 'confirmed';
    }
  }

  function getPaymentMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.PIX:         return 'PIX';
      case PaymentMethod.CASH:        return 'Dinheiro';
      case PaymentMethod.CREDIT_CARD: return 'Cartão de Crédito';
      case PaymentMethod.DEBIT_CARD:  return 'Cartão de Débito';
      default:                        return method;
    }
  }

  function getStatusConfig(status: TicketStatus) {
    switch (status) {
      case 'pending':   return {label: 'Pendente',   color: 'warning' as const,       bg: 'warningBg' as const, icon: 'schedule'};
      case 'confirmed': return {label: 'Confirmada', color: 'success' as const,       bg: 'successBg' as const, icon: 'check-circle'};
      case 'active':    return {label: 'Em Viagem',  color: 'info' as const,          bg: 'infoBg' as const,    icon: 'sailing'};
      case 'completed': return {label: 'Concluída',  color: 'textSecondary' as const, bg: 'border' as const,    icon: 'check'};
      case 'cancelled': return {label: 'Cancelada',  color: 'danger' as const,        bg: 'dangerBg' as const,  icon: 'cancel'};
    }
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  function formatShortDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  async function handleShare() {
    if (!booking || !trip) {return;}
    try {
      await Share.share({
        message:
          `Meu bilhete NavegaJá\n\nCódigo: ${booking.id}\n` +
          `${trip.origin} → ${trip.destination}\n` +
          `Data: ${formatShortDate(trip.departureAt)}\n` +
          `Horário: ${formatTime(trip.departureAt)}`,
      });
    } catch (_error) {
      console.error('Error sharing:', _error);
    }
  }

  function handleStartTracking() {
    if (!booking) {return;}
    navigation.navigate('Tracking', {bookingId: booking.id});
  }

  function handleCancelBooking() {
    setShowCancelConfirmModal(true);
  }

  async function handleConfirmCancel() {
    if (!booking) {return;}
    setShowCancelConfirmModal(false);
    try {
      await cancel(booking.id);
      setShowCancelSuccessModal(true);
    } catch {
      setShowCancelErrorModal(true);
    }
  }

  function navigateHome() {
    navigation.navigate('HomeTabs');
  }

  const ticketStatus = booking ? mapBookingStatusToTicketStatus(booking.status) : 'pending';
  const statusConfig = getStatusConfig(ticketStatus);

  return {
    booking,
    trip,
    isLoading,
    showLoadErrorModal,
    setShowLoadErrorModal,
    showCancelConfirmModal,
    setShowCancelConfirmModal,
    showCancelSuccessModal,
    setShowCancelSuccessModal,
    showCancelErrorModal,
    setShowCancelErrorModal,
    ticketStatus,
    statusConfig,
    getPaymentMethodLabel,
    formatTime,
    formatDate,
    formatShortDate,
    formatBRL,
    handleShare,
    handleStartTracking,
    handleCancelBooking,
    handleConfirmCancel,
    navigateHome,
  };
}
