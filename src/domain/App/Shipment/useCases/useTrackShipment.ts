import {useMutation} from '@tanstack/react-query';

import {shipmentService} from '../shipmentService';
import {TrackShipmentResponse} from '../shipmentTypes';

export function useTrackShipment() {
  const mutation = useMutation<TrackShipmentResponse, Error, string>({
    mutationFn: (trackingCode) => shipmentService.trackShipment(trackingCode),
  });

  return {
    trackingData: mutation.data ?? null,
    track: (trackingCode: string) => mutation.mutateAsync(trackingCode),
    reset: mutation.reset,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
