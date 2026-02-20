import {api} from '@api';

import {CreateCaptainReviewData, Review} from '../../reviewTypes';

export async function captainReviewPassengerUseCase(
  data: CreateCaptainReviewData,
): Promise<Review> {
  return api.post<Review>('/reviews/captain-review', data);
}
