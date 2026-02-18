import {useState} from 'react';

import {captainAPI} from '../../captainAPI';
import {Trip} from '../../../Trip/tripTypes';

export function useStartTrip() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function startTrip(tripId: string): Promise<Trip> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await captainAPI.updateTripStatus(tripId, 'in_progress');
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  return {startTrip, isLoading, error};
}
