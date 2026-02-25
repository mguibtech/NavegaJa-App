import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {Route} from '../../routeTypes';
import {getPopularRoutesUseCase} from './getPopularRoutesUseCase';

export function usePopularRoutes() {
  const query = useQuery<Route[], Error>({
    queryKey: queryKeys.routes.popular(),
    queryFn: () => getPopularRoutesUseCase(),
  });

  return {
    routes: query.data ?? [],
    fetch: query.refetch,
    isLoading: query.isLoading,
    error: query.error,
  };
}
