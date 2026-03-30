import {useMutation, useQueryClient} from '@tanstack/react-query';

import {
  enqueueCheckInBooking,
  isLikelyOfflineError,
  OfflineQueuedError,
  queryKeys,
  refreshOnlineState,
} from '@infra';

import {bookingAPI} from '../bookingAPI';

export function useCheckInBooking() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const buildQueuedError = (jobId: string) =>
        new OfflineQueuedError(
          'Sem internet. O check-in foi salvo e sera sincronizado automaticamente quando a conexao voltar.',
          jobId,
        );

      const isOnline = await refreshOnlineState();
      if (!isOnline) {
        const queuedJob = await enqueueCheckInBooking(bookingId);
        throw buildQueuedError(queuedJob.id);
      }

      try {
        return await bookingAPI.checkIn(bookingId);
      } catch (error) {
        if (isLikelyOfflineError(error)) {
          const queuedJob = await enqueueCheckInBooking(bookingId);
          throw buildQueuedError(queuedJob.id);
        }
        throw error;
      }
    },
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
