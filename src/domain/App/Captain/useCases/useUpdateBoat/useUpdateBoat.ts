import {useState} from 'react';

import {captainAPI} from '../../captainAPI';
import {Boat, CreateBoatData} from '../../../Boat/boatTypes';

export function useUpdateBoat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function updateBoat(id: string, data: Partial<CreateBoatData>): Promise<Boat> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await captainAPI.updateBoat(id, data);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  return {updateBoat, isLoading, error};
}
