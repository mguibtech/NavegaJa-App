import {useState} from 'react';

import {captainAPI} from '../../captainAPI';
import {Boat} from '../../../Boat/boatTypes';

export function useMyBoats() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetchBoats() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await captainAPI.getMyBoats();
      setBoats(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  return {boats, isLoading, error, fetchBoats};
}
