import {useState} from 'react';

import {shipmentService} from '../shipmentService';
import {Shipment, CreateShipmentData} from '../shipmentTypes';

export function useCreateShipment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (
    data: CreateShipmentData,
    photos: Array<{uri: string; type: string; name: string}>,
  ): Promise<Shipment> => {
    setIsLoading(true);
    try {
      const shipment = await shipmentService.createShipment(data, photos);
      setError(null);
      return shipment;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {create, isLoading, error};
}
