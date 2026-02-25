import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {bookingService} from '../bookingService';
import {Booking} from '../bookingTypes';

export function useMyBookings() {
  const query = useQuery<Booking[], Error>({
    queryKey: queryKeys.bookings.my(),
    queryFn: () => bookingService.getMyBookings(),
    placeholderData: previousData => previousData,
  });

  return {
    bookings: query.data ?? [],
    fetch: query.refetch,
    isLoading: query.isLoading,
    error: query.error,
  };
}
