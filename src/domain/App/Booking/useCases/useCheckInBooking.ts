import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {bookingAPI} from '../bookingAPI';

export function useCheckInBooking() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (bookingId: string) => bookingAPI.checkIn(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.captain.all});
    },
  });

  return {
    checkIn: (bookingId: string) => mutation.mutateAsync(bookingId),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
