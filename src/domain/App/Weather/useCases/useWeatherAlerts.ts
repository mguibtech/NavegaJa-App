import {useState} from 'react';

import {weatherService} from '../weatherService';
import {WeatherAlert, Region} from '../weatherTypes';

export function useWeatherAlerts() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetchAlerts(lat: number, lng: number): Promise<WeatherAlert[]> {
    setIsLoading(true);
    setError(null);
    try {
      const data = await weatherService.getAlerts(lat, lng);
      setAlerts(data);
      return data;
    } catch (e) {
      setError(e as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRegionAlerts(region: Region): Promise<WeatherAlert[]> {
    setIsLoading(true);
    setError(null);
    try {
      const data = await weatherService.getRegionAlerts(region);
      setAlerts(data);
      return data;
    } catch (e) {
      setError(e as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  return {alerts, fetchAlerts, fetchRegionAlerts, isLoading, error};
}
