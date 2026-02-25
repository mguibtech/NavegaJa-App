import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';
import {CaptainChecklist, UpdateChecklistData} from '../../captainTypes';

type UpdateParams = {id: string; tripId: string; data: UpdateChecklistData};

export function useUpdateChecklist() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CaptainChecklist, Error, UpdateParams>({
    mutationFn: ({id, data}) => captainService.updateChecklist(id, data),
    onSuccess: (_, {tripId}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.captain.checklist(tripId)});
    },
  });

  return {
    update: (id: string, tripId: string, data: UpdateChecklistData) =>
      mutation.mutateAsync({id, tripId, data}),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
