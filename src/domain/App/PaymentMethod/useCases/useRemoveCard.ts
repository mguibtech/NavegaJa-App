import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {paymentMethodService} from '../paymentMethodService';

export function useRemoveCard() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: id => paymentMethodService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.paymentMethods.my()});
    },
  });

  return {
    removeCard: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
