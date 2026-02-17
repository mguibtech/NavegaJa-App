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
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  return {
    markOutForDelivery,
    isLoading,
    error,
  };
}
