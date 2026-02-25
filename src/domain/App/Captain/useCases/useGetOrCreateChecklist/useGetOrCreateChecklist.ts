import {useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';
import {CaptainChecklist} from '../../captainTypes';

export function useGetOrCreateChecklist(tripId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<CaptainChecklist, Error>({
    queryKey: queryKeys.captain.checklist(tripId),
    queryFn: async () => {
      try {
        const existing = await captainService.getChecklistByTrip(tripId);
        if (existing) {return existing;}
      } catch (err: any) {
        if (err?.statusCode !== 404) {throw err;}
      }
      return captainService.createChecklist(tripId);
    },
    enabled: !!tripId,
  });

  return {
    checklist: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({queryKey: queryKeys.captain.checklist(tripId)}),
  };
}
