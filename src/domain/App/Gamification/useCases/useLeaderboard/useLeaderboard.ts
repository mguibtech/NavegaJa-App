import {useState} from 'react';

import {gamificationAPI} from '../../gamificationAPI';
import {LeaderboardEntry} from '../../gamificationTypes';

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetchLeaderboard(): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await gamificationAPI.getLeaderboard();
      setLeaderboard(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  return {leaderboard, isLoading, error, fetchLeaderboard};
}
