import {useState} from 'react';

import {tripService} from '../tripService';
import {PopularDestinationsResponse} from '../popularRoutesTypes';

export function usePopularRoutes() {
  const [data, setData] = useState<PopularDestinationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetch(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tripService.getPopular();
      setData(result);
      setIsLoading(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      setData(null);
      setIsLoading(false);
      throw error;
    }
  }

  function clear() {
    setData(null);
    setError(null);
  }

  return {
    data,
    fetch,
    clear,
    isLoading,
    error,
  };
}
