import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {favoriteService} from '../favoriteService';
import type {CheckFavoriteDto, Favorite, FavoriteType} from '../favoriteTypes';

export function useMyFavorites(type?: FavoriteType) {
  const query = useQuery<Favorite[], Error>({
    queryKey: [...queryKeys.favorites.my(), type ?? 'all'],
    queryFn: () => favoriteService.getMyFavorites(type),
    placeholderData: previousData => previousData,
  });

  function isFavorited(data: CheckFavoriteDto): boolean {
    return (query.data ?? []).some(f => {
      if (f.type !== data.type) {return false;}
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
    favorites: query.data ?? [],
    fetch: query.refetch,
    isFavorited,
    isLoading: query.isLoading,
    error: query.error,
  };
}
