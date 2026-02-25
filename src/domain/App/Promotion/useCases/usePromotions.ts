import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {promotionService} from '../promotionService';
import {Promotion} from '../promotionTypes';

export function usePromotions() {
  const query = useQuery<Promotion[], Error>({
    queryKey: queryKeys.promotions.active(),
    queryFn: () => promotionService.getActivePromotions(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    promotions: query.data ?? [],
    fetch: query.refetch,
    isLoading: query.isLoading,
    error: query.error,
  };
}
