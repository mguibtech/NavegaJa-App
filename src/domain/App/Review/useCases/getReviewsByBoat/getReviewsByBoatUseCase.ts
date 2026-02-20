import {api} from '@api';

import {Review} from '../../reviewTypes';

export async function getReviewsByBoatUseCase(boatId: string): Promise<Review[]> {
  return api.get<Review[]>(`/reviews/boat/${boatId}`);
}
