import {useState} from 'react';

import {Route} from '../../routeTypes';
import {getPopularRoutesUseCase} from './getPopularRoutesUseCase';

export function usePopularRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetch(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getPopularRoutesUseCase();
      setRoutes(result);
      setIsLoading(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  return {
    routes,
    fetch,
    isLoading,
    error,
  };
}
