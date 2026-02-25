import {useMutation} from '@tanstack/react-query';

import {tripService} from '../tripService';
import {SearchTripsParams, Trip} from '../tripTypes';

export function useSearchTrips() {
  const mutation = useMutation<Trip[], Error, SearchTripsParams>({
    mutationFn: (params: SearchTripsParams) => tripService.searchTrips(params),
    onError: (err: any) => {
      if (err?.statusCode === 401) {return;}
    },
  });

  return {
    trips: mutation.data ?? [],
    search: mutation.mutateAsync,
    clearTrips: mutation.reset,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
