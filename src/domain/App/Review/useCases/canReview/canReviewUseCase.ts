import {api} from '@api';

import {CanReviewResponse} from '../../reviewTypes';

export async function canReviewUseCase(
  tripId: string,
): Promise<CanReviewResponse> {
  return api.get<CanReviewResponse>(`/reviews/can-review/${tripId}`);
}
