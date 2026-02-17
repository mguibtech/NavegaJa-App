import {useState} from 'react';

import {tripService} from '../tripService';
import {Trip} from '../tripTypes';

export function useTripDetails() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function getTripById(id: string): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tripService.getTripById(id);
      setTrip(result);
      setIsLoading(false);
    } catch (err) {

      // Ignora erros 401 (são tratados automaticamente pelo refresh token)
      if ((err as any)?.statusCode !== 401) {
        setError(err as Error);
      }

      setTrip(null);
      setIsLoading(false);
      throw err;
    }
  }

  function clearTrip() {
    setTrip(null);
    setError(null);
  }

  return {
    trip,
    getTripById,
    clearTrip,
    isLoading,
    error,
  };
}
