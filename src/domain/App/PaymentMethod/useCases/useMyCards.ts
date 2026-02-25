import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {paymentMethodService} from '../paymentMethodService';
import {StoredCard} from '../paymentMethodTypes';

export function useMyCards() {
  const query = useQuery<StoredCard[], Error>({
    queryKey: queryKeys.paymentMethods.my(),
    queryFn: () => paymentMethodService.getAll(),
  });

  return {
    cards: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
