import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {stopReviewAPI} from '../stopReviewAPI';
import {CreateStopReviewData} from '../stopReviewTypes';

export function useCreateStopReview() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateStopReviewData) => stopReviewAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.stopReviews.all});
    },
  });

  return {
    createReview: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
