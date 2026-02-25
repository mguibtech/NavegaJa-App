import {api} from '@api';

import {Booking, CancelBookingData, CreateBookingData, PaymentStatusResponse} from './bookingTypes';

async function getMyBookings(): Promise<Booking[]> {
  const response = await api.get<Booking[]>('/bookings/my-bookings');
  return response;
}

async function getById(id: string): Promise<Booking> {
  const response = await api.get<Booking>(`/bookings/${id}`);
  return response;
}

async function create(data: CreateBookingData): Promise<Booking> {
  const response = await api.post<Booking>('/bookings', data);
  return response;
}

async function cancel(id: string, data?: CancelBookingData): Promise<void> {
  await api.post(`/bookings/${id}/cancel`, data);
}

async function checkIn(id: string): Promise<Booking> {
  const response = await api.post<Booking>(`/bookings/${id}/checkin`);
  return response;
}

async function getPaymentStatus(id: string): Promise<PaymentStatusResponse> {
  const response = await api.get<PaymentStatusResponse>(`/bookings/${id}/payment-status`);
  return response;
}

export const bookingAPI = {
  getMyBookings,
  getById,
  create,
  cancel,
  checkIn,
  getPaymentStatus,
};
