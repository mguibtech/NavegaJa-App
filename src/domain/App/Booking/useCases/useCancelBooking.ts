import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {bookingService} from '../bookingService';

export function useCancelBooking() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, {bookingId: string; reason?: string}>({
    mutationFn: ({bookingId, reason}) =>
      bookingService.cancelBooking(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.bookings.my()});
    },
  });

  return {
    cancel: (bookingId: string, reason?: string) =>
      mutation.mutateAsync({bookingId, reason}),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
