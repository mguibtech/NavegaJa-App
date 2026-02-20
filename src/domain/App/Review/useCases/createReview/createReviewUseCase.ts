import {api} from '@api';

import {CreatePassengerReviewData, Review} from '../../reviewTypes';

export async function createReviewUseCase(
  data: CreatePassengerReviewData,
): Promise<Review> {
  return api.post<Review>('/reviews', data);
}
