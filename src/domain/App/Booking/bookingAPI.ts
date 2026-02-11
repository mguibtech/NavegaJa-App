import {api} from '@api';

import {Booking, CancelBookingData, CreateBookingData} from './bookingTypes';

class BookingAPI {
  async getMyBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings/my-bookings');
    return response.data;
  }

  async getById(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  }

  async create(data: CreateBookingData): Promise<Booking> {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  }

  async cancel(id: string, data?: CancelBookingData): Promise<void> {
    await api.post(`/bookings/${id}/cancel`, data);
  }

  async checkIn(id: string): Promise<Booking> {
    const response = await api.post<Booking>(`/bookings/${id}/checkin`);
    return response.data;
  }
}

export const bookingAPI = new BookingAPI();
