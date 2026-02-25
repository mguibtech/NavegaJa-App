import {useMutation} from '@tanstack/react-query';

import {bookingService} from '../bookingService';
import {PaymentStatusResponse} from '../bookingTypes';

export function usePaymentStatus() {
  const mutation = useMutation<PaymentStatusResponse, Error, string>({
    mutationFn: (bookingId: string) => bookingService.getPaymentStatus(bookingId),
  });

  return {
    checkStatus: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
