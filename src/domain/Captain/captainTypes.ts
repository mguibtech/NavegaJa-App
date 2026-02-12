import {Booking} from '../App/Booking/bookingTypes';
import {Trip} from '../App/Trip/tripTypes';

export interface Payment {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export interface EarningsResponse {
  totalPending: number;
  totalReceived: number;
  payments: Payment[];
}

export interface AdvancePaymentResponse {
  success: boolean;
}

export type {Trip, Booking};
