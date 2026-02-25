import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '../../../../infra/queryKeys';

import {shipmentService} from '../shipmentService';
import {Shipment, ShipmentTimelineEvent} from '../shipmentTypes';

type ShipmentDetails = {
  shipment: Shipment;
  timeline: ShipmentTimelineEvent[];
};

export function useShipmentDetails(shipmentId?: string) {
  const query = useQuery<ShipmentDetails, Error>({
    queryKey: queryKeys.shipments.detail(shipmentId ?? ''),
    queryFn: async () => {
      const [shipment, timeline] = await Promise.all([
        shipmentService.getById(shipmentId!),
        shipmentService.getTimeline(shipmentId!),
      ]);
      return {shipment, timeline};
    },
    enabled: !!shipmentId,
  });

  return {
    shipment: query.data?.shipment ?? null,
    timeline: query.data?.timeline ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
