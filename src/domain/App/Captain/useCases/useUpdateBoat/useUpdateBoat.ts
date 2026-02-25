import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';
import {Boat, CreateBoatData} from '../../../Boat/boatTypes';

export function useUpdateBoat() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Boat, Error, {id: string; data: Partial<CreateBoatData>}>({
    mutationFn: ({id, data}) => captainService.updateBoat(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({queryKey: queryKeys.captain.boats()});
      queryClient.invalidateQueries({queryKey: queryKeys.boats.detail(variables.id)});
    },
  });

  return {
    updateBoat: (id: string, data: Partial<CreateBoatData>) =>
      mutation.mutateAsync({id, data}),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
