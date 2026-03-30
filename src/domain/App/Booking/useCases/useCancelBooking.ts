import {useMutation, useQueryClient} from '@tanstack/react-query';

import {
  enqueueCancelBooking,
  isLikelyOfflineError,
  OfflineQueuedError,
  queryKeys,
  refreshOnlineState,
} from '@infra';

import {bookingService} from '../bookingService';

export function useCancelBooking() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, {bookingId: string; reason?: string}>({
    mutationFn: async ({bookingId, reason}) => {
      const buildQueuedError = (jobId: string) =>
        new OfflineQueuedError(
          'Sem internet. O cancelamento foi salvo e sera sincronizado automaticamente quando a conexao voltar.',
          jobId,
        );

      const isOnline = await refreshOnlineState();
      if (!isOnline) {
        const queuedJob = await enqueueCancelBooking(bookingId, reason);
        throw buildQueuedError(queuedJob.id);
      }

      try {
        await bookingService.cancelBooking(bookingId, reason);
      } catch (error) {
        if (isLikelyOfflineError(error)) {
          const queuedJob = await enqueueCancelBooking(bookingId, reason);
          throw buildQueuedError(queuedJob.id);
        }

        throw error;
      }
    },
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
