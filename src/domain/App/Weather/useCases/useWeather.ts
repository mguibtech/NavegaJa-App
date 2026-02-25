import {useMutation} from '@tanstack/react-query';

import {weatherService} from '../weatherService';
import {CurrentWeather, Region} from '../weatherTypes';

export function useWeather() {
  const regionMutation = useMutation<CurrentWeather, Error, Region>({
    mutationFn: (region: Region) => weatherService.getRegionWeather(region),
  });

  const coordsMutation = useMutation<CurrentWeather, Error, {lat: number; lng: number}>({
    mutationFn: ({lat, lng}) => weatherService.getCurrentWeather(lat, lng),
  });

  const weather = regionMutation.data ?? coordsMutation.data ?? null;
  const isLoading = regionMutation.isPending || coordsMutation.isPending;
  const error = regionMutation.error ?? coordsMutation.error;

  return {
    weather,
    fetchRegionWeather: regionMutation.mutateAsync,
    fetchCurrentWeather: (lat: number, lng: number) => coordsMutation.mutateAsync({lat, lng}),
    clearWeather: () => { regionMutation.reset(); coordsMutation.reset(); },
    isLoading,
    error,
  };
}
