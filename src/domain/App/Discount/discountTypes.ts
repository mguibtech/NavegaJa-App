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
