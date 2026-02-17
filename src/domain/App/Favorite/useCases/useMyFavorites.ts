import {useState, useEffect} from 'react';

import {favoriteService} from '../favoriteService';
import type {Favorite, FavoriteType, CheckFavoriteDto} from '../favoriteTypes';

export function useMyFavorites(type?: FavoriteType) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Carrega favoritos offline ao montar
  useEffect(() => {
    loadOfflineData();
  }, [type]);

  async function loadOfflineData() {
    const offline = await favoriteService.loadOffline();
    const filtered = type ? offline.filter(f => f.type === type) : offline;
    setFavorites(filtered);
  }

  async function fetch(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await favoriteService.getMyFavorites(type);
      setFavorites(result);
    } catch (err) {

      // Ignora erros 401 (são tratados automaticamente pelo refresh token)
      if ((err as any)?.statusCode !== 401) {
        setError(err as Error);
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  // Helper: Verifica se um favorito existe localmente
  function isFavorited(data: CheckFavoriteDto): boolean {
    return favorites.some(f => {
      if (f.type !== data.type) return false;

      switch (data.type) {
        case 'destination':
          return (
            f.destination === data.destination &&
            (f.origin === data.origin || (!f.origin && !data.origin))
          );
        case 'boat':
          return f.boatId === data.boatId;
        case 'captain':
          return f.captainId === data.captainId;
        default:
          return false;
      }
    });
  }

  return {
    favorites,
    fetch,
    isFavorited,
    isLoading,
    error,
  };
}
