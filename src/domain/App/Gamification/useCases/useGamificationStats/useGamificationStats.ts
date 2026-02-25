import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {gamificationService} from '../../gamificationService';
import {GamificationStats} from '../../gamificationTypes';

export function useGamificationStats() {
  const query = useQuery<GamificationStats, Error>({
    queryKey: queryKeys.gamification.stats(),
    queryFn: () => gamificationService.getStats(),
  });

  return {
    stats: query.data ?? null,
    fetchStats: query.refetch,
    isLoading: query.isLoading,
    error: query.error,
  };
}
