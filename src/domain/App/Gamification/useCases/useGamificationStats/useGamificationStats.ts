import {useState} from 'react';

import {gamificationAPI} from '../../gamificationAPI';
import {GamificationStats} from '../../gamificationTypes';

export function useGamificationStats() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetchStats(): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await gamificationAPI.getStats();
      setStats(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  return {stats, isLoading, error, fetchStats};
}
