import {useEffect, useState} from 'react';

import {locationService} from '../locationService';
import {City} from '../locationTypes';

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetch(): Promise<City[]> {
    setIsLoading(true);
    setError(null);
    try {
      const data = await locationService.getCities();
      setCities(data);
      return data;
    } catch (e) {
      setError(e as Error);
      // Fallback para lista estática quando offline ou API indisponível
      const fallback = locationService.getFallbackCities();
      setCities(fallback);
      return fallback;
    } finally {
      setIsLoading(false);
    }
  }

  /** Nomes das cidades para uso em pickers simples */
  const cityNames = cities.map(c => c.nome);

  return {cities, cityNames, fetch, isLoading, error};
}
