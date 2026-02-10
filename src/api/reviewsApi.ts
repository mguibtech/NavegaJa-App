import {CreateReviewRequest, Review} from '@types';

import {api} from './apiClient';

export const reviewsApi = {
  async create(data: CreateReviewRequest): Promise<Review> {
    const response = await api.post<Review>('/reviews', data);
    return response.data;
  },

  async getByCaptain(captainId: string): Promise<Review[]> {
    const response = await api.get<Review[]>(`/reviews/captain/${captainId}`);
    return response.data;
  },
};
