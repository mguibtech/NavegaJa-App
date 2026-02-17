import {useState} from 'react';

import {shipmentService} from '../shipmentService';
import {CalculateShipmentPriceResponse} from '../shipmentTypes';

export function useCalculateShipmentPrice() {
  const [priceData, setPriceData] = useState<CalculateShipmentPriceResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function calculate(
    tripId: string,
    weight: number,
    dimensions?: {length: number; width: number; height: number},
    couponCode?: string,
  ): Promise<CalculateShipmentPriceResponse> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await shipmentService.calculatePrice({
        tripId,
        weight,
        dimensions,
        couponCode,
      });
      setPriceData(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  function reset() {
    setPriceData(null);
    setError(null);
  }

  return {
    priceData,
    calculate,
    reset,
    isLoading,
    error,
  };
}
