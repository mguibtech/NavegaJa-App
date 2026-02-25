import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';
import {Shipment} from '../../../Shipment/shipmentTypes';

export function useGetCaptainShipment(shipmentId?: string) {
  const query = useQuery<Shipment, Error>({
    queryKey: queryKeys.captain.shipment(shipmentId ?? ''),
    queryFn: () => captainService.getShipmentById(shipmentId!),
    enabled: !!shipmentId,
  });

  return {
    shipment: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
