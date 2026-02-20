import {api} from '@api';

import {MyReviewsResponse} from '../../reviewTypes';

export async function getMyReviewsUseCase(): Promise<MyReviewsResponse> {
  return api.get<MyReviewsResponse>('/reviews/my');
}
