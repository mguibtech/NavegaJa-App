import {useMutation, useQueryClient} from '@tanstack/react-query';

import {
  enqueueCreateBooking,
  isLikelyOfflineError,
  OfflineQueuedError,
  queryKeys,
  refreshOnlineState,
} from '@infra';

import {bookingService} from '../bookingService';
import {Booking, CreateBookingData} from '../bookingTypes';

export function useCreateBooking() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Booking, Error, CreateBookingData>({
    mutationFn: async (data: CreateBookingData) => {
      const buildQueuedError = (jobId: string) =>
        new OfflineQueuedError(
          'Sem internet. A reserva foi salva e sera sincronizada automaticamente quando a conexao voltar.',
          jobId,
        );

      const isOnline = await refreshOnlineState();
      if (!isOnline) {
        const queuedJob = await enqueueCreateBooking(data);
        throw buildQueuedError(queuedJob.id);
      }

      try {
        return await bookingService.createBooking(data);
      } catch (error) {
        if (isLikelyOfflineError(error)) {
          const queuedJob = await enqueueCreateBooking(data);
          throw buildQueuedError(queuedJob.id);
        }

        throw error;
      }
    },
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
