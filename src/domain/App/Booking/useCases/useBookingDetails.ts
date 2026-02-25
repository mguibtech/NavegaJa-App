import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {bookingService} from '../bookingService';
import {Booking} from '../bookingTypes';

export function useBookingDetails(bookingId?: string) {
  const query = useQuery<Booking, Error>({
    queryKey: queryKeys.bookings.detail(bookingId ?? ''),
    queryFn: () => bookingService.getById(bookingId!),
    enabled: !!bookingId,
  });

  return {
    booking: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
