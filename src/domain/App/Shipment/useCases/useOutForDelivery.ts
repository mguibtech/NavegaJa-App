import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '../../../../infra/queryKeys';
import {shipmentService} from '../shipmentService';
import {OutForDeliveryResponse} from '../shipmentTypes';

export function useOutForDelivery() {
  const queryClient = useQueryClient();

  const mutation = useMutation<OutForDeliveryResponse, Error, string>({
    mutationFn: (shipmentId) => shipmentService.outForDelivery(shipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.shipments.my()});
    },
  });

  return {
    markOutForDelivery: (shipmentId: string) => mutation.mutateAsync(shipmentId),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
