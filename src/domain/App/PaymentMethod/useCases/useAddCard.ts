import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {paymentMethodService} from '../paymentMethodService';
import {AddCardPayload, StoredCard} from '../paymentMethodTypes';

export function useAddCard() {
  const queryClient = useQueryClient();

  const mutation = useMutation<StoredCard, Error, AddCardPayload>({
    mutationFn: payload => paymentMethodService.addCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.paymentMethods.my()});
    },
  });

  return {
    addCard: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
