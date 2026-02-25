import {useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {tripService} from '../tripService';
import {PopularDestinationsResponse} from '../popularRoutesTypes';

export function usePopularRoutes() {
  const queryClient = useQueryClient();
  const query = useQuery<PopularDestinationsResponse, Error>({
    queryKey: queryKeys.trips.popular(),
    queryFn: () => tripService.getPopular(),
  });

  return {
    data: query.data ?? null,
    fetch: query.refetch,
    clear: () => queryClient.removeQueries({queryKey: queryKeys.trips.popular()}),
    isLoading: query.isLoading,
    error: query.error,
  };
}
