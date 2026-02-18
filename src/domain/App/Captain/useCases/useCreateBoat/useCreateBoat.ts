import {useState} from 'react';

import {captainAPI} from '../../captainAPI';
import {Boat, CreateBoatData} from '../../../Boat/boatTypes';

export function useCreateBoat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function createBoat(data: CreateBoatData): Promise<Boat> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await captainAPI.createBoat(data);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  return {createBoat, isLoading, error};
}
