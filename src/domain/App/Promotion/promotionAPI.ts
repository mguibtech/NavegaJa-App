import {api} from '@api';
import {PromotionsResponse} from './promotionTypes';

class PromotionAPI {
  async getActivePromotions(): Promise<PromotionsResponse> {
    const response = await api.get<PromotionsResponse>('/promotions/active');
    return response;
  }
}

export const promotionAPI = new PromotionAPI();
