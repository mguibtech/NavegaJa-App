import {Booking, CreateBookingRequest} from '@types';

import {api} from './apiClient';

export const bookingsApi = {
  async create(data: CreateBookingRequest): Promise<Booking> {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  },

  async getMyBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings/my-bookings');
    return response.data;
  },

  async getById(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  async getByTrip(tripId: string): Promise<Booking[]> {
    const response = await api.get<Booking[]>(`/bookings/trip/${tripId}`);
    return response.data;
  },

  async checkin(id: string): Promise<Booking> {
    const response = await api.patch<Booking>(`/bookings/${id}/checkin`);
    return response.data;
  },

  async cancel(id: string): Promise<Booking> {
    const response = await api.patch<Booking>(`/bookings/${id}/cancel`);
    return response.data;
  },
};
