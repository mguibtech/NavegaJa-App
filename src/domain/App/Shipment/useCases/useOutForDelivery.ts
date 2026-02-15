import {useState} from 'react';

import {shipmentService} from '../shipmentService';
import {OutForDeliveryResponse} from '../shipmentTypes';

export function useOutForDelivery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function markOutForDelivery(
    shipmentId: string,
  ): Promise<OutForDeliveryResponse> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await shipmentService.outForDelivery(shipmentId);
      setIsLoading(false);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  return {
    markOutForDelivery,
    isLoading,
    error,
  };
}
