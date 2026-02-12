import {api} from '@api';

import {Review} from '../../reviewTypes';

export async function getReviewsByCaptainUseCase(
  captainId: string,
): Promise<Review[]> {
  const response = await api.get<Review[]>(`/reviews/captain/${captainId}`);
  return response;
}
