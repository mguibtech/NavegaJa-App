import {useMutation} from '@tanstack/react-query';

import {discountService} from '../discountService';
import {CalculatePriceRequest, CalculatePriceResponse} from '../discountTypes';

export function useCalculatePrice() {
  const mutation = useMutation<CalculatePriceResponse, Error, CalculatePriceRequest>({
    mutationFn: (request: CalculatePriceRequest) => discountService.calculatePrice(request),
  });

  return {
    priceData: mutation.data ?? null,
    calculate: mutation.mutateAsync,
    reset: mutation.reset,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
