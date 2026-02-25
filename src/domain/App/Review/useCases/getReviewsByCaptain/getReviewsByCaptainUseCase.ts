import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {reviewService} from '../../reviewService';
import {Review} from '../../reviewTypes';

export async function getReviewsByCaptainUseCase(captainId: string): Promise<Review[]> {
  return reviewService.getByCaptain(captainId);
}

export function useGetReviewsByCaptain(captainId: string) {
  const query = useQuery<Review[], Error>({
    queryKey: queryKeys.reviews.byCaptain(captainId),
    queryFn: () => reviewService.getByCaptain(captainId),
    enabled: !!captainId,
  });
  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
