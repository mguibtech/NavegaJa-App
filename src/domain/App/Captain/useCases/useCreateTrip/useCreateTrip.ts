import {useState} from 'react';

import {captainAPI} from '../../captainAPI';
import {CreateTripData, Trip} from '../../../Trip/tripTypes';

export function useCreateTrip() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function createTrip(data: CreateTripData): Promise<Trip> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await captainAPI.createTrip(data);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  return {createTrip, isLoading, error};
}
