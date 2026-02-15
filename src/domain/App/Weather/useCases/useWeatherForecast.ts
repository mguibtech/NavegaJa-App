import {useState} from 'react';

import {weatherService} from '../weatherService';
import {WeatherForecast, Region} from '../weatherTypes';

export function useWeatherForecast() {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Busca previsão por coordenadas
   */
  async function fetch(
    lat: number,
    lng: number,
    days: number = 5,
  ): Promise<WeatherForecast> {
    setIsLoading(true);
    setError(null);

    try {
      const data = await weatherService.getForecast(lat, lng, days);
      setForecast(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  /**
   * Busca previsão de uma região
   */
  async function fetchRegion(
    region: Region,
    days: number = 5,
  ): Promise<WeatherForecast> {
    setIsLoading(true);
    setError(null);

    try {
      const data = await weatherService.getRegionForecast(region, days);
      setForecast(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  /**
   * Limpa previsão
   */
  function clearForecast() {
    setForecast(null);
    setError(null);
  }

  return {
    forecast,
    fetch,
    fetchRegion,
    clearForecast,
    isLoading,
    error,
  };
}
