import {Booking, CreateBookingRequest} from '@types';

import {api} from './apiClient';

export const bookingsApi = {
  async getMyBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings/my-bookings');
    return response.data;
  },

  async getById(bookingId: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/${bookingId}`);
    return response.data;
  },

  async create(data: CreateBookingRequest): Promise<Booking> {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  },

  async cancel(bookingId: string): Promise<Booking> {
    const response = await api.post<Booking>(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  async checkin(bookingId: string): Promise<Booking> {
    const response = await api.post<Booking>(`/bookings/${bookingId}/checkin`);
    return response.data;
  },

  async validateQR(qrCode: string): Promise<{valid: boolean; booking?: Booking}> {
    const response = await api.post<{valid: boolean; booking?: Booking}>(
      '/bookings/validate-qr',
      {qrCode},
    );
    return response.data;
  },
};
