import {useState} from 'react';

import {shipmentService} from '../shipmentService';
import {Shipment, CreateShipmentData} from '../shipmentTypes';

export function useCreateShipment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function create(
    data: CreateShipmentData,
    photos: Array<{uri: string; type: string; name: string}>,
  ): Promise<Shipment> {
    setIsLoading(true);
    setError(null);

    try {
      const shipment = await shipmentService.createShipment(data, photos);
      setIsLoading(false);
      return shipment;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  return {
    create,
    isLoading,
    error,
  };
}
