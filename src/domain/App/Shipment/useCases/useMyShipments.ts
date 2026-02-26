import {useState} from 'react';

import {shipmentService} from '../shipmentService';
import {Shipment} from '../shipmentTypes';

export function useMyShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async () => {
    setIsLoading(true);
    try {
      const data = await shipmentService.getMyShipments();
      setShipments(data);
      setError(null);
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {shipments, isLoading, error, fetch};
}
