import {api} from '@api';

import {Booking, CancelBookingData, CreateBookingData, PaymentStatusResponse} from './bookingTypes';

class BookingAPI {
  async getMyBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings/my-bookings');
    return response;
  }

  async getById(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response;
  }

  async create(data: CreateBookingData): Promise<Booking> {
    const response = await api.post<Booking>('/bookings', data);
    return response;
  }

  async cancel(id: string, data?: CancelBookingData): Promise<void> {
    await api.post(`/bookings/${id}/cancel`, data);
  }

  async checkIn(id: string): Promise<Booking> {
    const response = await api.post<Booking>(`/bookings/${id}/checkin`);
    return response;
  }

  async getPaymentStatus(id: string): Promise<PaymentStatusResponse> {
    const response = await api.get<PaymentStatusResponse>(`/bookings/${id}/payment-status`);
    return response;
  }
}

export const bookingAPI = new BookingAPI();
