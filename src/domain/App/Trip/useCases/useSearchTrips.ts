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
      const error = err as any;

      // Ignora erros 401 (são tratados automaticamente pelo refresh token)
      if (error?.statusCode !== 401) {
        setError(error);
      }

      setTrips([]);
      setIsLoading(false);
      throw error;
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
