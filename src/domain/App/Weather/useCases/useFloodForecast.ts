import {useState} from 'react';

import {floodHubAPI} from '../floodHubAPI';
import {FloodForecastData} from '../floodHubTypes';

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
