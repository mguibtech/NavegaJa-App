import {useState} from 'react';

import {weatherService} from '../weatherService';
import {NavigationSafetyAssessment, Region} from '../weatherTypes';

export function useNavigationSafety() {
  const [safety, setSafety] = useState<NavigationSafetyAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Avalia segurança por coordenadas
   */
  async function assess(
    lat: number,
    lng: number,
  ): Promise<NavigationSafetyAssessment> {
    setIsLoading(true);
    setError(null);

    try {
      const data = await weatherService.getNavigationSafety(lat, lng);
      setSafety(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  /**
   * Avalia segurança de uma região
   */
  async function assessRegion(
    region: Region,
  ): Promise<NavigationSafetyAssessment> {
    setIsLoading(true);
    setError(null);

    try {
      const data = await weatherService.getRegionNavigationSafety(region);
      setSafety(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  /**
   * Limpa avaliação de segurança
   */
  function clearSafety() {
    setSafety(null);
    setError(null);
  }

  return {
    safety,
    assess,
    assessRegion,
    clearSafety,
    isLoading,
    error,
  };
}
