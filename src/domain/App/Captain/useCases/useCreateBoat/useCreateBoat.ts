import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';
import {Boat, CreateBoatData} from '../../../Boat/boatTypes';

export function useCreateBoat() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Boat, Error, CreateBoatData>({
    mutationFn: (data: CreateBoatData) => captainService.createBoat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.captain.boats()});
    },
  });

  return {
    createBoat: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
