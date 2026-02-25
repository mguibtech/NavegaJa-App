import {useMutation} from '@tanstack/react-query';

import {shipmentService} from '../shipmentService';
import {CalculateShipmentPriceResponse} from '../shipmentTypes';

type CalculatePriceParams = {
  tripId: string;
  weight: number;
  dimensions?: {length: number; width: number; height: number};
  couponCode?: string;
};

export function useCalculateShipmentPrice() {
  const mutation = useMutation<CalculateShipmentPriceResponse, Error, CalculatePriceParams>({
    mutationFn: (params) => shipmentService.calculatePrice(params),
  });

  return {
    priceData: mutation.data ?? null,
    calculate: (
      tripId: string,
      weight: number,
      dimensions?: {length: number; width: number; height: number},
      couponCode?: string,
    ) => mutation.mutateAsync({tripId, weight, dimensions, couponCode}),
    reset: mutation.reset,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
