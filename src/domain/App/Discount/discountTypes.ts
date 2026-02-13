export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  firstPurchaseOnly: boolean;
  isActive: boolean;
  // Filtros de rota (novos campos da spec backend)
  fromCity?: string;
  toCity?: string;
  createdAt: string;
  updatedAt: string;
}

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export interface DiscountApplied {
  type: 'trip' | 'coupon' | 'loyalty';
  label: string;
  percent?: number;
  amount: number;
  code?: string;
  level?: string;
}

export interface PriceBreakdown {
  basePrice: number;
  tripDiscount?: number;
  tripDiscountPercent?: number;
  couponDiscount?: number;
  couponCode?: string;
  loyaltyDiscount?: number;
  loyaltyDiscountPercent?: number;
  loyaltyLevel?: string;
  totalDiscount: number;
  finalPrice: number;
  quantity?: number;
  discountsApplied: DiscountApplied[];
}

export interface CalculatePriceRequest {
  tripId: string;
  quantity: number;
  couponCode?: string;
}

export interface CalculatePriceResponse extends PriceBreakdown {}

export interface CouponValidationError {
  code: string;
  message: string;
}

// Estados de validação do cupom (da spec backend)
export type CouponState =
  | { status: 'NOT_VALIDATED' }
  | { status: 'VALIDATING' }
  | { status: 'VALID'; data: ValidCouponData }
  | { status: 'INVALID'; error: string }
  | { status: 'ERROR'; error: string };

export interface ValidCouponData {
  code: string;
  type: CouponType;
  value: number;
  originalPrice: number;
  discount: number;
  finalPrice: number;
  savedAmount: number;
}

// Request para validar cupom (endpoint separado)
export interface ValidateCouponRequest {
  code: string;
  tripId: string;
  quantity: number;
}

// Response da validação
export interface ValidateCouponResponse {
  valid: boolean;
  message?: string; // Mensagem de erro se invalid
  data?: ValidCouponData; // Dados se valid
}
