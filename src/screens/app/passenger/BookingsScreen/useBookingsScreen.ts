import {useState, useEffect, useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';

import {useMyBookings, useCancelBooking, Booking} from '@domain';
import {useToast} from '@hooks';
import type {AppStackParamList} from '@routes';

export function useBookingsScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const toast = useToast();
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const {bookings, fetch: fetchBookings, error: bookingsError} = useMyBookings();
  const {cancel, isLoading: isCancelling} = useCancelBooking();

  useFocusEffect(
    useCallback(() => {
      fetchBookings().catch(() => {});
    }, []),
  );

  useEffect(() => {
    const activeCount = bookings.filter(
      b =>
        b.status === 'pending' ||
        b.status === 'confirmed' ||
        b.status === 'checked_in',
    ).length;
    (navigation as any).setOptions({
      tabBarBadge: activeCount > 0 ? activeCount : undefined,
    });
  }, [bookings, navigation]);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await fetchBookings();
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }

  async function handleConfirmCancel() {
    if (!bookingToCancel) return;
    try {
      await cancel(bookingToCancel.id);
      setBookingToCancel(null);
      toast.showSuccess('Reserva cancelada com sucesso.');
      await fetchBookings();
    } catch {
      setBookingToCancel(null);
      toast.showError('Não foi possível cancelar. Tente novamente.');
    }
  }

  function getStatusBadge(status: string): {label: string; bg: string; textColor: string} {
    switch (status) {
      case 'pending':    return {label: 'Ag. Pagamento', bg: '#FEF3C7', textColor: '#92400E'};
      case 'confirmed':  return {label: 'Confirmada',    bg: '#D1FAE5', textColor: '#065F46'};
      case 'checked_in': return {label: 'Embarcado',     bg: '#DBEAFE', textColor: '#1E40AF'};
      case 'completed':  return {label: 'Concluída',     bg: '#F3F4F6', textColor: '#6B7280'};
      case 'cancelled':  return {label: 'Cancelada',     bg: '#FEE2E2', textColor: '#991B1B'};
      default:           return {label: status,          bg: '#F3F4F6', textColor: '#6B7280'};
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (selectedTab === 'active') {
      return booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'checked_in';
    }
    return booking.status === 'completed' || booking.status === 'cancelled';
  });

  function navigateToTicket(bookingId: string) {
    navigation.navigate('Ticket', {bookingId});
  }

  function navigateToReview(tripId: string, captainName?: string, boatName?: string) {
    navigation.navigate('TripReview', {tripId, captainName, boatName});
  }

  return {
    selectedTab,
    setSelectedTab,
    refreshing,
    bookingToCancel,
    setBookingToCancel,
    bookingsError,
    fetchBookings,
    isCancelling,
    filteredBookings,
    onRefresh,
    handleConfirmCancel,
    getStatusBadge,
    navigateToTicket,
    navigateToReview,
  };
}
