import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {bookingService} from '../bookingService';
import {Booking, CreateBookingData} from '../bookingTypes';

export function useCreateBooking() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Booking, Error, CreateBookingData>({
    mutationFn: (data: CreateBookingData) => bookingService.createBooking(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({queryKey: queryKeys.bookings.my()});
      queryClient.invalidateQueries({queryKey: queryKeys.trips.detail(variables.tripId)});
    },
  });

  return {
    create: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
