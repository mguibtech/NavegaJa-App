import {useState} from 'react';

import {gamificationAPI} from '../../gamificationAPI';
import {GamificationTransaction} from '../../gamificationTypes';

const PAGE_SIZE = 20;

export function useGamificationHistory() {
  const [history, setHistory] = useState<GamificationTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  async function fetchHistory(): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await gamificationAPI.getHistory(1, PAGE_SIZE);
      setHistory(result);
      setPage(1);
      setHasMore(result.length === PAGE_SIZE);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchMoreHistory(): Promise<void> {
    if (isLoadingMore || !hasMore) {return;}
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await gamificationAPI.getHistory(nextPage, PAGE_SIZE);
      setHistory(prev => [...prev, ...result]);
      setPage(nextPage);
      setHasMore(result.length === PAGE_SIZE);
    } catch {
      // silently ignore load-more errors
    } finally {
      setIsLoadingMore(false);
    }
  }

  return {history, isLoading, isLoadingMore, error, hasMore, fetchHistory, fetchMoreHistory};
}
