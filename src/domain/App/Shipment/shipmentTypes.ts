import {PaymentMethod} from '../Booking/bookingTypes';

// Enums - v2.0 (8 estados)
export enum ShipmentStatus {
  PENDING = 'pending',           // Criada, aguardando pagamento
  PAID = 'paid',                 // Pagamento confirmado
  COLLECTED = 'collected',       // Coletada pelo capitão (QR Code)
  IN_TRANSIT = 'in_transit',     // Em trânsito (viagem partiu - AUTO)
  ARRIVED = 'arrived',           // Chegou ao destino (viagem chegou - AUTO)
  OUT_FOR_DELIVERY = 'out_for_delivery', // Saiu para entrega
  DELIVERED = 'delivered',       // Entregue (validado por destinatário)
  CANCELLED = 'cancelled',       // Cancelada
}

// Shipment principal - v2.0
export interface Shipment {
  id: string;
  senderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  description: string;
  weight: number;
  dimensions?: {length: number; width: number; height: number};
  tripId: string;
  trackingCode: string;
  status: ShipmentStatus;

  // Fotos (3 tipos)
  photos?: string[];              // Fotos da encomenda (criação)
  collectionPhotoUrl?: string;    // Foto no momento da coleta
  deliveryPhotoUrl?: string;      // Foto no momento da entrega

  // QR Code + Validação
  qrCode: string;
  validationCode: string;         // PIN 6 dígitos (fallback)

  // Financeiro
  price: number;
  paymentMethod: PaymentMethod;
  couponCode?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  collectedAt?: string;
  deliveredAt?: string;

  // Relations
  trip?: any;
  sender?: any;
  deliveryReview?: ShipmentReview;

  // Gamificação v2.0
  navegaCoinsEarned?: number;     // Moedas creditadas após entrega
}

// Create shipment
export interface CreateShipmentData {
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  description: string;
  weight: number;
  dimensions?: {length: number; width: number; height: number};
  tripId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

// Calculate price
export interface CalculateShipmentPriceRequest {
  weight: number;
  dimensions?: {length: number; width: number; height: number};
  tripId: string;
  couponCode?: string;
}

export interface CalculateShipmentPriceResponse {
  basePrice: number;
  volumetricWeight?: number;
  actualWeight: number;
  chargedWeight: number;
  weightCharge: number;
  pricePerKg: number;
  couponDiscount?: number;
  totalDiscount: number;
  finalPrice: number;
  appliedCoupon?: {
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    discount: number;
  };
}

// Track shipment
export interface TrackShipmentResponse {
  shipment: Shipment;
  timeline: ShipmentTimelineEvent[];
}

export interface ShipmentTimelineEvent {
  id: string;
  status: ShipmentStatus;
  description: string;
  location?: string;
  timestamp: string;
}

// Reviews
export interface ShipmentReview {
  id: string;
  shipmentId: string;
  senderId: string;
  rating: number;
  deliveryQuality: number;
  timeliness: number;
  comment?: string;
  createdAt: string;
}

export interface CreateShipmentReviewData {
  shipmentId: string;
  rating: number;
  deliveryQuality: number;
  timeliness: number;
  comment?: string;
}

// Cancel
export interface CancelShipmentData {
  reason?: string;
}

// S3 Upload
export interface PresignedUrlData {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface GetPresignedUrlsRequest {
  count: number;
}

export interface GetPresignedUrlsResponse {
  urls: PresignedUrlData[];
  expiresIn: number;
}

// Confirm Payment (v2.0)
export interface ConfirmPaymentData {
  paymentProof?: string; // URL da foto do comprovante (opcional)
}

export interface ConfirmPaymentResponse {
  shipment: Shipment;
  message: string;
}

// Collect Shipment (v2.0 - Capitão)
export interface CollectShipmentData {
  collectionPhoto?: string; // URL da foto no momento da coleta
}

export interface CollectShipmentResponse {
  shipment: Shipment;
  message: string;
}

// Validate Delivery (v2.0 - Destinatário)
export interface ValidateDeliveryData {
  validationCode: string;     // PIN 6 dígitos
  deliveryPhoto?: string;     // Foto no momento da entrega (opcional)
}

export interface ValidateDeliveryResponse {
  shipment: Shipment;
  message: string;
  navegaCoinsEarned?: number; // Moedas ganhas
}

// Out for Delivery (v2.0 - Capitão)
export interface OutForDeliveryResponse {
  shipment: Shipment;
  message: string;
}

// Other
export interface ReportIncidentData {
  type: string;
  description: string;
  photo?: string;
}

export interface ValidateQRResponse {
  valid: boolean;
  shipment?: Shipment;
}
