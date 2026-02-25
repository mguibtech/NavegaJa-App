import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {paymentMethodService} from '../paymentMethodService';
import {StoredCard} from '../paymentMethodTypes';

export function useSetDefaultCard() {
  const queryClient = useQueryClient();

  const mutation = useMutation<StoredCard, Error, string>({
    mutationFn: id => paymentMethodService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.paymentMethods.my()});
    },
  });

  return {
    setDefault: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
