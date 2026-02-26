import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';
import {gamificationService} from '../gamificationService';
import {KmStats} from '../gamificationTypes';

export function useKmStats() {
  const query = useQuery<KmStats, Error>({
    queryKey: queryKeys.gamification.km(),
    queryFn: () => gamificationService.getKmStats(),
    staleTime: 2 * 60 * 1000,
  });

  return {
    kmStats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
