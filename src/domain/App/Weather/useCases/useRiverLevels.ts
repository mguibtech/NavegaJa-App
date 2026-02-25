import {useState} from 'react';

import {weatherService} from '../weatherService';
import {RiverLevel} from '../weatherTypes';

export function useRiverLevels() {
  const [riverLevels, setRiverLevels] = useState<RiverLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetch(): Promise<RiverLevel[]> {
    setIsLoading(true);
    setError(null);
    try {
      const data = await weatherService.getRiverLevels();
      setRiverLevels(data);
      return data;
    } catch (err: any) {
      setError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  return {riverLevels, fetch, isLoading, error};
}
