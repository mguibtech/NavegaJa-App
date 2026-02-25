import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '../../../../infra/queryKeys';

import {shipmentService} from '../shipmentService';
import {CancelShipmentData} from '../shipmentTypes';

type CancelParams = {shipmentId: string; data?: CancelShipmentData};

export function useCancelShipment() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, CancelParams>({
    mutationFn: ({shipmentId, data}) => shipmentService.cancelShipment(shipmentId, data?.reason),
    onSuccess: (_, {shipmentId}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.shipments.my()});
      queryClient.invalidateQueries({queryKey: queryKeys.shipments.detail(shipmentId)});
    },
  });

  return {
    cancel: (shipmentId: string, data?: CancelShipmentData) =>
      mutation.mutateAsync({shipmentId, data}),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
