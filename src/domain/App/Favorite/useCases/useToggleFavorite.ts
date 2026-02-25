import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {favoriteService} from '../favoriteService';
import type {CreateFavoriteDto} from '../favoriteTypes';

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  const mutation = useMutation<{action: 'added' | 'removed'}, Error, CreateFavoriteDto>({
    mutationFn: (data: CreateFavoriteDto) => favoriteService.toggleFavorite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.favorites.my()});
    },
  });

  return {
    toggle: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
