import {api} from '@api';
import {
  Coupon,
  CalculatePriceRequest,
  CalculatePriceResponse,
} from './discountTypes';

class DiscountAPI {
  /**
   * Buscar cupom por código
   */
  async getCouponByCode(code: string): Promise<Coupon> {
    const response = await api.get<Coupon>(`/coupons/${code}`);
    return response;
  }

  /**
   * Calcular preço com preview (mostra todos os descontos aplicados)
   */
  async calculatePrice(
    data: CalculatePriceRequest,
  ): Promise<CalculatePriceResponse> {
    const response = await api.post<CalculatePriceResponse>(
      '/bookings/calculate-price',
      data,
    );
    return response;
  }
}

export const discountAPI = new DiscountAPI();
