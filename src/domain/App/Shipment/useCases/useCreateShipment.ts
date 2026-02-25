import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '../../../../infra/queryKeys';
import {shipmentService} from '../shipmentService';
import {Shipment, CreateShipmentData} from '../shipmentTypes';

type CreateShipmentParams = {
  data: CreateShipmentData;
  photos: Array<{uri: string; type: string; name: string}>;
};

export function useCreateShipment() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Shipment, Error, CreateShipmentParams>({
    mutationFn: ({data, photos}) => shipmentService.createShipment(data, photos),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.shipments.my()});
    },
  });

  return {
    create: (data: CreateShipmentData, photos: Array<{uri: string; type: string; name: string}>) =>
      mutation.mutateAsync({data, photos}),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
