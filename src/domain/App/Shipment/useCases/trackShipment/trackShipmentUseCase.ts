import {api} from '@api';

import {Shipment} from '../../shipmentTypes';

export async function trackShipmentUseCase(
  trackingCode: string,
): Promise<Shipment> {
  const response = await api.get<Shipment>(
    `/shipments/track/${trackingCode}`,
  );
  return response;
}
