import {useState} from 'react';

import {shipmentService} from '../shipmentService';
import {Shipment} from '../shipmentTypes';

export function useMyShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetch() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await shipmentService.getMyShipments();
      setShipments(data);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  return {
    shipments,
    fetch,
    isLoading,
    error,
  };
}
