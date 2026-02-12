import {api} from '@api';

import {CreateReviewData, Review} from '../../reviewTypes';

export async function createReviewUseCase(
  data: CreateReviewData,
): Promise<Review> {
  const response = await api.post<Review>('/reviews', data);
  return response;
}
