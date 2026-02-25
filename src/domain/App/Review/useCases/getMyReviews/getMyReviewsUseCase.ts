import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {reviewService} from '../../reviewService';
import {MyReviewsResponse} from '../../reviewTypes';

export async function getMyReviewsUseCase(): Promise<MyReviewsResponse> {
  return reviewService.getMyReviews();
}

export function useGetMyReviews() {
  const query = useQuery<MyReviewsResponse, Error>({
    queryKey: queryKeys.reviews.my(),
    queryFn: () => reviewService.getMyReviews(),
  });
  return {
    reviews: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
