import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';
import {Trip} from '../../../Trip/tripTypes';

export function useCaptainTrips() {
  const query = useQuery<Trip[], Error>({
    queryKey: queryKeys.captain.trips(),
    queryFn: () => captainService.getMyTrips(),
  });

  return {
    trips: query.data ?? [],
    fetchMyTrips: query.refetch,
    isLoading: query.isLoading,
    error: query.error,
  };
}
