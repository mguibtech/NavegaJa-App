import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';
import {Trip} from '../../../Trip/tripTypes';

export function useStartTrip() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Trip, Error, string>({
    mutationFn: (tripId: string) => captainService.updateTripStatus(tripId, 'in_progress'),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.captain.trips()});
    },
  });

  return {
    startTrip: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
