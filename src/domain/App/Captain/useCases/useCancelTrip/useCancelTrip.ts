import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';
import {Trip} from '../../../Trip/tripTypes';

export function useCancelTrip() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Trip, Error, string>({
    mutationFn: (tripId: string) => captainService.updateTripStatus(tripId, 'cancelled'),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.captain.trips()});
      queryClient.invalidateQueries({queryKey: queryKeys.bookings.all});
    },
  });

  return {
    cancelTrip: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
