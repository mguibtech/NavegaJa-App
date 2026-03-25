import {useEffect, useState} from 'react';
import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {bookingService} from '../bookingService';
import {Booking} from '../bookingTypes';

export function useMyBookings() {
  const [initialData, setInitialData] = useState<Booking[]>([]);

  // Carrega cache offline imediatamente
  useEffect(() => {
    bookingService.loadOffline().then(cached => {
      if (cached && cached.length > 0 && initialData.length === 0) {
        setInitialData(cached);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const query = useQuery<Booking[], Error>({
    queryKey: queryKeys.bookings.my(),
    queryFn: () => bookingService.getMyBookings(),
    placeholderData: previousData => previousData,
  });

  return {
    bookings: query.data ?? initialData,
    fetch: query.refetch,
    isLoading: query.isLoading && initialData.length === 0,
    error: query.error,
  };
}
