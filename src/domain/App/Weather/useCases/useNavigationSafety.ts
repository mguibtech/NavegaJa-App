import {useMutation} from '@tanstack/react-query';

import {weatherService} from '../weatherService';
import {NavigationSafetyAssessment, Region} from '../weatherTypes';

export function useNavigationSafety() {
  const coordsMutation = useMutation<NavigationSafetyAssessment, Error, {lat: number; lng: number}>({
    mutationFn: ({lat, lng}) => weatherService.getNavigationSafety(lat, lng),
  });

  const regionMutation = useMutation<NavigationSafetyAssessment, Error, Region>({
    mutationFn: (region: Region) => weatherService.getRegionNavigationSafety(region),
  });

  const safety = coordsMutation.data ?? regionMutation.data ?? null;
  const isLoading = coordsMutation.isPending || regionMutation.isPending;
  const error = coordsMutation.error ?? regionMutation.error;

  return {
    safety,
    assess: (lat: number, lng: number) => coordsMutation.mutateAsync({lat, lng}),
    assessRegion: regionMutation.mutateAsync,
    clearSafety: () => { coordsMutation.reset(); regionMutation.reset(); },
    isLoading,
    error,
  };
}
