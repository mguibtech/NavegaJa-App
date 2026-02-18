import {useState} from 'react';

import {captainAPI} from '../../captainAPI';
import {Trip} from '../../../Trip/tripTypes';

export function useCompleteTrip() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function completeTrip(tripId: string): Promise<Trip> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await captainAPI.updateTripStatus(tripId, 'completed');
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  return {completeTrip, isLoading, error};
}
