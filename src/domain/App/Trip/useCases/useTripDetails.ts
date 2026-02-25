import {useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {tripService} from '../tripService';
import {Trip} from '../tripTypes';

export function useTripDetails(tripId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Trip, Error>({
    queryKey: queryKeys.trips.detail(tripId ?? ''),
    queryFn: () => tripService.getTripById(tripId!),
    enabled: !!tripId,
  });

  return {
    trip: query.data ?? null,
    getTripById: async (id: string) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.trips.detail(id),
        queryFn: () => tripService.getTripById(id),
      });
    },
    clearTrip: () => {
      if (tripId) {
        queryClient.removeQueries({queryKey: queryKeys.trips.detail(tripId)});
      }
    },
    isLoading: query.isLoading,
    error: query.error,
  };
}
