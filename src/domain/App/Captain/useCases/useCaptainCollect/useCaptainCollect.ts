import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';

type CollectParams = {shipmentId: string; validationCode: string};
type CollectResult = {shipment: any; message: string};

export function useCaptainCollect() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CollectResult, Error, CollectParams>({
    mutationFn: ({shipmentId, validationCode}) =>
      captainService.collectShipment(shipmentId, validationCode),
    onSuccess: (_, {shipmentId}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.captain.shipment(shipmentId)});
    },
  });

  return {
    collect: (shipmentId: string, validationCode: string) =>
      mutation.mutateAsync({shipmentId, validationCode}),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
