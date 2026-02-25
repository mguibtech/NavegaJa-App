import {useMutation} from '@tanstack/react-query';

import {weatherService} from '../weatherService';
import {WeatherAlert} from '../weatherTypes';

type AlertParams = {lat: number; lng: number};

export function useWeatherAlerts() {
  const mutation = useMutation<WeatherAlert[], Error, AlertParams>({
    mutationFn: ({lat, lng}) => weatherService.getAlerts(lat, lng),
  });

  return {
    fetchAlerts: (lat: number, lng: number) => mutation.mutateAsync({lat, lng}),
    alerts: mutation.data ?? [],
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
