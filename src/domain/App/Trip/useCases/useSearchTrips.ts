import {useEffect, useState} from 'react';
import {useMutation} from '@tanstack/react-query';

import {tripService} from '../tripService';
import {SearchTripsParams, Trip} from '../tripTypes';

export function useSearchTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);

  // Carrega última busca do cache offline
  useEffect(() => {
    tripService.loadSearchOffline().then(cached => {
      if (cached && cached.length > 0 && trips.length === 0) {
        setTrips(cached);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mutation = useMutation<Trip[], Error, SearchTripsParams>({
    mutationFn: (params: SearchTripsParams) => tripService.searchTrips(params),
    onSuccess: (data) => {
      setTrips(data);
    },
    onError: (err: any) => {
      if (err?.statusCode === 401) {return;}
    },
  });

  return {
    trips: trips,
    search: mutation.mutateAsync,
    clearTrips: () => {
      mutation.reset();
      setTrips([]);
    },
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
