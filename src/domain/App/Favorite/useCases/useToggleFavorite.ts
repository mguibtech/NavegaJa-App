import {useState} from 'react';

import {favoriteService} from '../favoriteService';
import type {CreateFavoriteDto} from '../favoriteTypes';

export function useToggleFavorite() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function toggle(data: CreateFavoriteDto): Promise<{
    action: 'added' | 'removed';
  }> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await favoriteService.toggleFavorite(data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    toggle,
    isLoading,
    error,
  };
}
