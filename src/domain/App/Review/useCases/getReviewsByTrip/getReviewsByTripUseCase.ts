import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {reviewService} from '../../reviewService';
import {Review} from '../../reviewTypes';

export async function getReviewsByTripUseCase(tripId: string): Promise<Review[]> {
  return reviewService.getByTrip(tripId);
}

export function useGetReviewsByTrip(tripId: string) {
  const query = useQuery<Review[], Error>({
    queryKey: queryKeys.reviews.byTrip(tripId),
    queryFn: () => reviewService.getByTrip(tripId),
    enabled: !!tripId,
  });
  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
