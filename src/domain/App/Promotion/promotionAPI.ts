import {api} from '@api';
import {PromotionsResponse} from './promotionTypes';

async function getActivePromotions(): Promise<PromotionsResponse> {
  const response = await api.get<PromotionsResponse>('/promotions/active');
  return response;
}

export const promotionAPI = {
  getActivePromotions,
};
