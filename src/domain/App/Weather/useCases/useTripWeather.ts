import {useState} from 'react';

import {weatherService} from '../weatherService';
import {TripWeather} from '../weatherTypes';

export function useTripWeather() {
  const [tripWeather, setTripWeather] = useState<TripWeather | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetch(tripId: string): Promise<TripWeather> {
    setIsLoading(true);
    setError(null);
    try {
      const data = await weatherService.getTripWeather(tripId);
      setTripWeather(data);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  function clear() {
    setTripWeather(null);
    setError(null);
  }

  return {tripWeather, fetch, clear, isLoading, error};
}
