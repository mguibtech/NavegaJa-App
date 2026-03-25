import {useState} from 'react';

import {floodHubAPI} from '../floodHubAPI';
import {FloodForecastData, FloodGaugeForecast} from '../floodHubTypes';

export function useFloodForecast() {
  const [data, setData] = useState<FloodForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async (lat: number, lng: number, radiusKm = 50) => {
    setIsLoading(true);
    try {
      const result = await floodHubAPI.getFloodStatus(lat, lng, radiusKm);
      setData(result);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {data, isLoading, error, fetch};
}

export function useGaugeForecast() {
  const [data, setData] = useState<FloodGaugeForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async (gaugeId: string, days = 7) => {
    setIsLoading(true);
    try {
      const result = await floodHubAPI.getGaugeForecast(gaugeId, days);
      setData(result);
      setError(null);
      return result;
    } catch (e) {
      setError(e as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {data, isLoading, error, fetch};
}
