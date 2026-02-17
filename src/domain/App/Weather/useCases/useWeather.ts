import {useState} from 'react';

import {weatherService} from '../weatherService';
import {CurrentWeather, Region} from '../weatherTypes';

export function useWeather() {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Busca clima de uma região
   */
  async function fetchRegionWeather(region: Region): Promise<CurrentWeather> {
    setIsLoading(true);
    setError(null);

    try {
      const data = await weatherService.getRegionWeather(region);
      setWeather(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  /**
   * Busca clima por coordenadas
   */
  async function fetchCurrentWeather(
    lat: number,
    lng: number,
  ): Promise<CurrentWeather> {
    setIsLoading(true);
    setError(null);

    try {
      const data = await weatherService.getCurrentWeather(lat, lng);
      setWeather(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  /**
   * Limpa dados do clima
   */
  function clearWeather() {
    setWeather(null);
    setError(null);
  }

  return {
    weather,
    fetchRegionWeather,
    fetchCurrentWeather,
    clearWeather,
    isLoading,
    error,
  };
}
