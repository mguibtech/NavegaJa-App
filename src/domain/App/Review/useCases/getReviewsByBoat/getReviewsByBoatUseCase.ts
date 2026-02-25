import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {reviewService} from '../../reviewService';
import {Review} from '../../reviewTypes';

export async function getReviewsByBoatUseCase(boatId: string): Promise<Review[]> {
  return reviewService.getByBoat(boatId);
}

export function useGetReviewsByBoat(boatId: string) {
  const query = useQuery<Review[], Error>({
    queryKey: queryKeys.reviews.byBoat(boatId),
    queryFn: () => reviewService.getByBoat(boatId),
    enabled: !!boatId,
  });
  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
