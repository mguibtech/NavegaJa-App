import {useEffect, useState} from 'react';

import {weatherService} from '../weatherService';
import {RiverLevel} from '../weatherTypes';

export function useRiverLevels() {
  const [riverLevels, setRiverLevels] = useState<RiverLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Carrega cache offline imediatamente ao montar
  useEffect(() => {
    weatherService.loadRiverLevelsOffline().then(cached => {
      if (cached && cached.length > 0 && riverLevels.length === 0) {
        setRiverLevels(cached);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetch(): Promise<RiverLevel[]> {
    setIsLoading(true);
    setError(null);
    try {
      const data = await weatherService.getRiverLevels();
      setRiverLevels(data);
      return data;
    } catch (err: any) {
      setError(err);
      // Se falhar rede, tenta garantir que temos o cache
      const cached = await weatherService.loadRiverLevelsOffline();
      setRiverLevels(cached);
      return cached;
    } finally {
      setIsLoading(false);
    }
  }

  return {riverLevels, fetch, isLoading, error};
}
