import {Shipment} from '@types';

import {api} from './apiClient';

export const shipmentsApi = {
  async getMyShipments(): Promise<Shipment[]> {
    const response = await api.get<Shipment[]>('/shipments/my-shipments');
    return response.data;
  },

  async track(trackingCode: string): Promise<Shipment> {
    const response = await api.get<Shipment>(`/shipments/track/${trackingCode}`);
    return response.data;
  },

  async create(data: FormData): Promise<Shipment> {
    const response = await api.post<Shipment>('/shipments', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async reportIncident(
    shipmentId: string,
    data: {
      type: string;
      description: string;
      photo?: string;
    },
  ): Promise<void> {
    await api.post(`/shipments/${shipmentId}/incident`, data);
  },

  async validateQR(
    qrCode: string,
  ): Promise<{valid: boolean; shipment?: Shipment}> {
    const response = await api.post<{valid: boolean; shipment?: Shipment}>(
      '/shipments/validate-qr',
      {qrCode},
    );
    return response.data;
  },
};
