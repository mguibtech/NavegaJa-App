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
  paymentStatus?: PaymentStatus;

  // PIX Payment (apenas se paymentMethod = PIX)
  pixQrCode?: string;           // Código copia e cola
  pixQrCodeImage?: string;      // Base64 PNG do QR Code
  pixTxid?: string;             // ID único da transação
  pixExpiresAt?: string;        // ISO 8601 - Expiração (15 min)
  pixKey?: string;              // Chave PIX usada
  pixPaidAt?: string;           // ISO 8601 - Data confirmação

  // Check-in
  qrCode?: string;              // Legacy - mantido para compatibilidade
  qrCodeCheckin?: string;       // QR Code para embarque
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

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
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

export interface PaymentStatusResponse {
  bookingId: string;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  pixPaidAt?: string | null;
  pixExpiresAt?: string | null;
  isExpired: boolean;
}
