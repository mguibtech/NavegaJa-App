import {useState} from 'react';

import {weatherService} from '../weatherService';
import {RiverLevel} from '../weatherTypes';

export function useRiverLevel() {
  const [riverLevel, setRiverLevel] = useState<RiverLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetch(stationCode: string): Promise<RiverLevel | null> {
    setIsLoading(true);
    setError(null);
    try {
      const data = await weatherService.getRiverLevel(stationCode);
      setRiverLevel(data);
      return data;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function clear() {
    setRiverLevel(null);
    setError(null);
  }

  return {riverLevel, fetch, clear, isLoading, error};
}
