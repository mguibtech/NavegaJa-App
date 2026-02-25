import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {gamificationService} from '../../gamificationService';
import {LeaderboardEntry} from '../../gamificationTypes';

export function useLeaderboard() {
  const query = useQuery<LeaderboardEntry[], Error>({
    queryKey: queryKeys.gamification.leaderboard(),
    queryFn: () => gamificationService.getLeaderboard(),
  });

  return {
    leaderboard: query.data ?? [],
    fetchLeaderboard: query.refetch,
    isLoading: query.isLoading,
    error: query.error,
  };
}
