import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';

type OutForDeliveryResult = {shipment: any; message: string};

export function useCaptainOutForDelivery() {
  const queryClient = useQueryClient();

  const mutation = useMutation<OutForDeliveryResult, Error, string>({
    mutationFn: (shipmentId: string) => captainService.shipmentOutForDelivery(shipmentId),
    onSuccess: (_, shipmentId) => {
      queryClient.invalidateQueries({queryKey: queryKeys.captain.shipment(shipmentId)});
    },
  });

  return {
    markOutForDelivery: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
