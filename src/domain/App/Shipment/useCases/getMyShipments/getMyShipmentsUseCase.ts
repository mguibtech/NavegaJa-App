import {api} from '@api';

import {Shipment} from '../../shipmentTypes';

export async function getMyShipmentsUseCase(): Promise<Shipment[]> {
  const response = await api.get<Shipment[]>('/shipments/my-shipments');
  return response;
}
