import {promotionAPI} from './promotionAPI';
import {Promotion} from './promotionTypes';

async function getActivePromotions(): Promise<Promotion[]> {
  try {
    const response = await promotionAPI.getActivePromotions();
    if (!response || !Array.isArray(response.promotions)) {
      return [];
    }
    const nowDate = new Date();
    return response.promotions
      .filter(promo => {
        const isActive = promo.isActive !== undefined ? promo.isActive : true;
        const isDateValid =
          nowDate >= new Date(promo.startDate) && nowDate <= new Date(promo.endDate);
        return isActive && isDateValid;
      })
      .sort((a, b) => b.priority - a.priority);
  } catch (err: any) {
    const status = err?.statusCode ?? err?.response?.status;
    if (status === 404 || status === 429) {
      return [];
    }
    throw err;
  }
}

export const promotionService = {
  getActivePromotions,
};
