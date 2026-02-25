import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {captainService} from '../../captainService';
import {TripPassenger} from '../../../Trip/tripTypes';

export function useGetTripPassengers(tripId?: string) {
  const query = useQuery<TripPassenger[], Error>({
    queryKey: queryKeys.captain.passengers(tripId ?? ''),
    queryFn: () => captainService.getPassengers(tripId!),
    enabled: !!tripId,
  });

  return {
    passengers: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
