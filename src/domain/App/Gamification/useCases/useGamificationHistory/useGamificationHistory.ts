import {useState} from 'react';

import {gamificationAPI} from '../../gamificationAPI';
import {GamificationTransaction} from '../../gamificationTypes';

export function useGamificationHistory() {
  const [history, setHistory] = useState<GamificationTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetchHistory(): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await gamificationAPI.getHistory();
      setHistory(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  return {history, isLoading, error, fetchHistory};
}
