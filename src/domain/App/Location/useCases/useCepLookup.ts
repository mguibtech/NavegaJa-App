import {useState} from 'react';

import {locationService} from '../locationService';
import {CepResult} from '../locationTypes';

export function useCepLookup() {
  const [result, setResult] = useState<CepResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function lookup(cep: string): Promise<CepResult | null> {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) {
      return null;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await locationService.getCep(clean);
      setResult(data);
      return data;
    } catch (e) {
      setError(e as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function clear() {
    setResult(null);
    setError(null);
  }

  return {result, lookup, clear, isLoading, error};
}
