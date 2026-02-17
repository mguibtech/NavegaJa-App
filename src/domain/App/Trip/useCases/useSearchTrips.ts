import {useState} from 'react';

import {tripService} from '../tripService';
import {SearchTripsParams, Trip} from '../tripTypes';

export function useSearchTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function search(params: SearchTripsParams): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tripService.searchTrips(params);
      setTrips(result);
      setIsLoading(false);
    } catch (err) {

      // Ignora erros 401 (são tratados automaticamente pelo refresh token)
      if ((err as any)?.statusCode !== 401) {
        setError(err as Error);
      }

      setTrips([]);
      setIsLoading(false);
      throw err;
    }
  }

  function clearTrips() {
    setTrips([]);
    setError(null);
  }

  return {
    trips,
    search,
    clearTrips,
    isLoading,
    error,
  };
}
