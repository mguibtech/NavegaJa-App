import {CreateShipmentRequest, Shipment, ShipmentStatus} from '@types';

import {api} from './apiClient';

export const shipmentsApi = {
  async create(data: CreateShipmentRequest): Promise<Shipment> {
    const response = await api.post<Shipment>('/shipments', data);
    return response.data;
  },

  async getMyShipments(): Promise<Shipment[]> {
    const response = await api.get<Shipment[]>('/shipments/my-shipments');
    return response.data;
  },

  async track(code: string): Promise<Shipment> {
    const response = await api.get<Shipment>(`/shipments/track/${code}`);
    return response.data;
  },

  async updateStatus(id: string, status: ShipmentStatus): Promise<Shipment> {
    const response = await api.patch<Shipment>(`/shipments/${id}/status`, {
      status,
    });
    return response.data;
  },

  async deliver(
    id: string,
    deliveryPhotoUrl?: string,
  ): Promise<Shipment> {
    const response = await api.patch<Shipment>(`/shipments/${id}/deliver`, {
      deliveryPhotoUrl,
    });
    return response.data;
  },
};
