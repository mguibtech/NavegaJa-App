import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {reviewService} from '../../reviewService';
import {CreateCaptainReviewData, Review} from '../../reviewTypes';

export async function captainReviewPassengerUseCase(data: CreateCaptainReviewData): Promise<Review> {
  return reviewService.captainReviewPassenger(data);
}

export function useCaptainReviewPassenger() {
  const queryClient = useQueryClient();
  const mutation = useMutation<Review, Error, CreateCaptainReviewData>({
    mutationFn: (data: CreateCaptainReviewData) => reviewService.captainReviewPassenger(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({queryKey: queryKeys.reviews.my()});
      queryClient.invalidateQueries({queryKey: queryKeys.reviews.byTrip(variables.tripId)});
    },
  });
  return {
    captainReviewPassenger: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
