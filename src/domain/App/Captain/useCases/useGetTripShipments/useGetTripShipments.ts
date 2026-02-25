import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';
import {Shipment} from '../../../Shipment/shipmentTypes';

export function useGetTripShipments(tripId?: string) {
  const query = useQuery<Shipment[], Error>({
    queryKey: queryKeys.captain.tripShipments(tripId ?? ''),
    queryFn: () => captainService.getTripShipments(tripId!),
    enabled: !!tripId,
  });

  return {
    shipments: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
