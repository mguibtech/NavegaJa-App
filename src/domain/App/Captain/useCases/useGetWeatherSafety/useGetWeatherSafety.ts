import {useMutation} from '@tanstack/react-query';

import {captainService} from '../../captainService';
import {WeatherSafetyResponse} from '../../captainTypes';

export function useGetWeatherSafety() {
  const mutation = useMutation<WeatherSafetyResponse, Error, {lat: number; lng: number}>({
    mutationFn: ({lat, lng}) => captainService.getWeatherSafety(lat, lng),
  });

  return {
    fetch: (lat: number, lng: number) => mutation.mutateAsync({lat, lng}),
    weather: mutation.data ?? null,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
