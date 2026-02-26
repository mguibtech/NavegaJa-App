import {api} from '@api';
import {API_ENDPOINTS} from '@api/config';

import {StopReview, TopStopReview, CreateStopReviewData} from './stopReviewTypes';

export const stopReviewAPI = {
  create(data: CreateStopReviewData): Promise<StopReview> {
    return api.post<StopReview>(API_ENDPOINTS.STOP_REVIEWS, data);
  },

  getByLocation(location: string, page = 1, limit = 20): Promise<StopReview[]> {
    return api
      .get<StopReview[]>(API_ENDPOINTS.STOP_REVIEWS, {params: {location, page, limit}})
      ;
  },

  getTop(limit = 10): Promise<TopStopReview[]> {
    return api
      .get<TopStopReview[]>(API_ENDPOINTS.STOP_REVIEWS_TOP, {params: {limit}})
      ;
  },

  getMy(page = 1, limit = 20): Promise<StopReview[]> {
    return api
      .get<StopReview[]>(API_ENDPOINTS.STOP_REVIEWS_MY, {params: {page, limit}})
      ;
  },
};
