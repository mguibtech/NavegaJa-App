import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {tripService} from '../tripService';
import {TripManageData} from '../tripTypes';

export function useTripManage(tripId: string) {
  const query = useQuery<TripManageData, Error>({
    queryKey: queryKeys.captain.manage(tripId),
    queryFn: () => tripService.getTripManage(tripId),
    enabled: !!tripId,
    retry: 0,
  });

  return {
    manageData: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
