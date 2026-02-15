import {useState} from 'react';

import {shipmentService} from '../shipmentService';
import {TrackShipmentResponse} from '../shipmentTypes';

export function useTrackShipment() {
  const [trackingData, setTrackingData] = useState<TrackShipmentResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function track(trackingCode: string): Promise<TrackShipmentResponse> {
    setIsLoading(true);
    setError(null);

    try {
      const data = await shipmentService.trackShipment(trackingCode);
      setTrackingData(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  function reset() {
    setTrackingData(null);
    setError(null);
  }

  return {
    trackingData,
    track,
    reset,
    isLoading,
    error,
  };
}
