import {useMutation} from '@tanstack/react-query';

import {weatherService} from '../weatherService';
import {WeatherForecast, Region} from '../weatherTypes';

export function useWeatherForecast() {
  const coordsMutation = useMutation<WeatherForecast, Error, {lat: number; lng: number; days?: number}>({
    mutationFn: ({lat, lng, days = 5}) => weatherService.getForecast(lat, lng, days),
  });

  const regionMutation = useMutation<WeatherForecast, Error, {region: Region; days?: number}>({
    mutationFn: ({region, days = 5}) => weatherService.getRegionForecast(region, days),
  });

  const forecast = coordsMutation.data ?? regionMutation.data ?? null;
  const isLoading = coordsMutation.isPending || regionMutation.isPending;
  const error = coordsMutation.error ?? regionMutation.error;

  return {
    forecast,
    fetch: (lat: number, lng: number, days?: number) => coordsMutation.mutateAsync({lat, lng, days}),
    fetchRegion: (region: Region, days?: number) => regionMutation.mutateAsync({region, days}),
    clearForecast: () => { coordsMutation.reset(); regionMutation.reset(); },
    isLoading,
    error,
  };
}
