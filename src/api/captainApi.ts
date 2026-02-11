import {Booking, Trip} from '@types';

import {api} from './apiClient';

interface EarningsResponse {
  totalPending: number;
  totalReceived: number;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    paidAt: string | null;
    createdAt: string;
  }>;
}

export const captainApi = {
  async getEarnings(): Promise<EarningsResponse> {
    const response = await api.get<EarningsResponse>('/captain/earnings');
    return response.data;
  },

  async getTrips(status?: string): Promise<Trip[]> {
    const params = status ? {status} : {};
    const response = await api.get<Trip[]>('/captain/trips', {params});
    return response.data;
  },

  async getPassengers(tripId: string): Promise<Booking[]> {
    const response = await api.get<Booking[]>(
      `/captain/trips/${tripId}/passengers`,
    );
    return response.data;
  },

  async advancePayment(amount: number): Promise<{success: boolean}> {
    const response = await api.post<{success: boolean}>(
      '/captain/advance-payment',
      {amount},
    );
    return response.data;
  },
};
