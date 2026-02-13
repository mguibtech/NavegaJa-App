import {Trip} from '../Trip/tripTypes';
import {PriceBreakdown} from '../Discount/discountTypes';

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  seatNumber?: number;
  quantity: number;
  totalPrice: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  qrCode?: string;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;

  // Populated by backend (optional)
  trip?: Trip;
  priceBreakdown?: PriceBreakdown;  // Discount details
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentMethod {
  PIX = 'pix',
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
}

export interface CreateBookingData {
  tripId: string;
  seatNumber?: number;
  quantity: number;
  paymentMethod: PaymentMethod;
  couponCode?: string;  // Optional coupon code
}

export interface CancelBookingData {
  reason?: string;
}
