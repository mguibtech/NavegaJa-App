import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';
import {CreateTripData, Trip} from '../../../Trip/tripTypes';

export function useCreateTrip() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Trip, Error, CreateTripData>({
    mutationFn: (data: CreateTripData) => captainService.createTrip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.captain.trips()});
    },
  });

  return {
    createTrip: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
