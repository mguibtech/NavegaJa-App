import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';
import {shipmentService} from '../shipmentService';
import {Shipment} from '../shipmentTypes';

export function useMyShipments() {
  const query = useQuery<Shipment[], Error>({
    queryKey: queryKeys.shipments.my(),
    queryFn: () => shipmentService.getMyShipments(),
    placeholderData: previousData => previousData,
  });

  return {
    shipments: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    fetch: query.refetch,
  };
}
