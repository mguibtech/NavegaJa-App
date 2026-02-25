import {useEffect} from 'react';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {useCaptainTrips, TripStatus} from '@domain';
import {useAuthStore} from '@store';
import {formatBRL} from '@utils';

export function useCaptainFinancial() {
  const user = useAuthStore(s => s.user);
  const {trips, isLoading, fetchMyTrips} = useCaptainTrips();

  useEffect(() => {
    fetchMyTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedTrips = trips.filter(t => t.status === TripStatus.COMPLETED);

  const now = new Date();

  const monthTrips = completedTrips.filter(t => {
    try {
      const d = new Date(t.departureAt);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    } catch {
      return false;
    }
  });

  function tripEarnings(t: (typeof trips)[number]): number {
    const seatsUsed = (t.totalSeats ?? 0) - (t.availableSeats ?? 0);
    return Number(t.price) * Math.max(0, seatsUsed);
  }

  const totalEarnings = completedTrips.reduce((sum, t) => sum + tripEarnings(t), 0);
  const monthEarnings = monthTrips.reduce((sum, t) => sum + tripEarnings(t), 0);
  const totalPassengers = completedTrips.reduce(
    (sum, t) => sum + Math.max(0, (t.totalSeats ?? 0) - (t.availableSeats ?? 0)),
    0,
  );

  function formatDeparture(dateStr: string) {
    try {
      return format(new Date(dateStr), 'dd/MM/yy', {locale: ptBR});
    } catch {
      return '';
    }
  }

  function formatMonthYear(date: Date) {
    return format(date, "MMMM 'de' yyyy", {locale: ptBR});
  }

  return {
    user,
    trips,
    isLoading,
    completedTrips,
    monthTrips,
    now,
    totalEarnings,
    monthEarnings,
    totalPassengers,
    tripEarnings,
    formatDeparture,
    formatMonthYear,
    formatBRL,
    fetchMyTrips,
  };
}
