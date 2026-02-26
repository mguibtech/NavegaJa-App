import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {stopReviewAPI} from '../stopReviewAPI';

export function useStopReviews(location: string) {
  const query = useQuery({
    queryKey: queryKeys.stopReviews.byLocation(location),
    queryFn: () => stopReviewAPI.getByLocation(location),
    enabled: !!location,
    staleTime: 5 * 60 * 1000,
  });

  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
