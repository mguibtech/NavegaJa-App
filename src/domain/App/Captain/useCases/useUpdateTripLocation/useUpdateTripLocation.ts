import {useMutation} from '@tanstack/react-query';

import {captainService} from '../../captainService';

type LocationParams = {tripId: string; latitude: number; longitude: number};

export function useUpdateTripLocation() {
  const mutation = useMutation<void, Error, LocationParams>({
    mutationFn: ({tripId, latitude, longitude}) =>
      captainService.updateTripLocation(tripId, latitude, longitude).then(() => {}),
  });

  return {
    updateLocation: (tripId: string, latitude: number, longitude: number) =>
      mutation.mutateAsync({tripId, latitude, longitude}),
    isLoading: mutation.isPending,
  };
}
