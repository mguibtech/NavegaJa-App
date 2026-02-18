import {useState} from 'react';

import {captainAPI} from '../../captainAPI';
import {Trip} from '../../../Trip/tripTypes';

export function useCaptainTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetchMyTrips() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await captainAPI.getMyTrips();
      setTrips(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  return {trips, isLoading, error, fetchMyTrips};
}
