import {api} from '@api';

import {Review} from '../../reviewTypes';

export async function getReviewsByTripUseCase(
  tripId: string,
): Promise<Review[]> {
  const response = await api.get<Review[]>(`/reviews/trip/${tripId}`);
  return response;
}
