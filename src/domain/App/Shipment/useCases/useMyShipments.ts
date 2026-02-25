import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '../../../../infra/queryKeys';
import {shipmentService} from '../shipmentService';
import {Shipment} from '../shipmentTypes';

export function useMyShipments() {
  const query = useQuery<Shipment[], Error>({
    queryKey: queryKeys.shipments.my(),
    queryFn: () => shipmentService.getMyShipments(),
  });

  return {
    shipments: query.data ?? [],
    fetch: query.refetch,
    isLoading: query.isLoading,
    error: query.error,
  };
}
