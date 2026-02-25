import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {reviewService} from '../../reviewService';
import {CreatePassengerReviewData, Review} from '../../reviewTypes';

export async function createReviewUseCase(data: CreatePassengerReviewData): Promise<Review> {
  return reviewService.create(data);
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const mutation = useMutation<Review, Error, CreatePassengerReviewData>({
    mutationFn: (data: CreatePassengerReviewData) => reviewService.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({queryKey: queryKeys.reviews.my()});
      queryClient.invalidateQueries({queryKey: queryKeys.reviews.byTrip(variables.tripId)});
    },
  });
  return {
    createReview: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
