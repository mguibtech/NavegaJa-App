import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {reviewService} from '../../reviewService';
import {CanReviewResponse} from '../../reviewTypes';

export async function canReviewUseCase(tripId: string): Promise<CanReviewResponse> {
  return reviewService.canReview(tripId);
}

export function useCanReview(tripId: string) {
  const query = useQuery<CanReviewResponse, Error>({
    queryKey: queryKeys.reviews.canReview(tripId),
    queryFn: () => reviewService.canReview(tripId),
    enabled: !!tripId,
  });
  return {
    canReviewData: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
