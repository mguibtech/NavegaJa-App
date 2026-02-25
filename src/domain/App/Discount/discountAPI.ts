import {api} from '@api';
import {
  Coupon,
  CalculatePriceRequest,
  CalculatePriceResponse,
  ValidateCouponRequest,
  ValidateCouponResponse,
} from './discountTypes';

/**
 * Buscar cupom por código
 */
async function getCouponByCode(code: string): Promise<Coupon> {
  const response = await api.get<Coupon>(`/coupons/${code}`);
  return response;
}

/**
 * Validar cupom (endpoint separado da spec backend)
 * POST /coupons/validate
 */
async function validateCoupon(
  data: ValidateCouponRequest,
): Promise<ValidateCouponResponse> {
  const response = await api.post<ValidateCouponResponse>(
    '/coupons/validate',
    data,
  );
  return response;
}

/**
 * Calcular preço com preview (mostra todos os descontos aplicados)
 */
async function calculatePrice(
  data: CalculatePriceRequest,
): Promise<CalculatePriceResponse> {
  const response = await api.post<CalculatePriceResponse>(
    '/bookings/calculate-price',
    data,
  );
  return response;
}

export const discountAPI = {
  getCouponByCode,
  validateCoupon,
  calculatePrice,
};
