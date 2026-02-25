import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';

export function useDeleteBoat() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => captainService.deleteBoat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.captain.boats()});
    },
  });

  return {
    deleteBoat: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
