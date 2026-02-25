import {discountAPI} from './discountAPI';
import {
  CalculatePriceRequest,
  CalculatePriceResponse,
  ValidateCouponRequest,
  ValidateCouponResponse,
} from './discountTypes';

async function calculatePrice(data: CalculatePriceRequest): Promise<CalculatePriceResponse> {
  return discountAPI.calculatePrice(data);
}

async function validateCoupon(data: ValidateCouponRequest): Promise<ValidateCouponResponse> {
  return discountAPI.validateCoupon(data);
}

export const discountService = {
  calculatePrice,
  validateCoupon,
};
