import {api} from '@api';

import {Shipment} from '../../shipmentTypes';

export async function createShipmentUseCase(data: FormData): Promise<Shipment> {
  const response = await api.post<Shipment>('/shipments', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
}
