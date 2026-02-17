import {useState} from 'react';

import {shipmentService} from '../shipmentService';
import {ConfirmPaymentResponse} from '../shipmentTypes';

export function useConfirmPayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function confirm(
    shipmentId: string,
    paymentProofUri?: string,
  ): Promise<ConfirmPaymentResponse> {
    setIsLoading(true);
    setError(null);

    try {
      // Upload foto do comprovante se fornecida
      let paymentProof: string | undefined;
      if (paymentProofUri) {
        const photoData = {
          uri: paymentProofUri,
          type: 'image/jpeg',
          name: `payment-proof-${Date.now()}.jpg`,
        };
        const urls = await shipmentService.uploadPhotosToS3([photoData]);
        paymentProof = urls[0];
      }

      const result = await shipmentService.confirmPayment(shipmentId, {
        paymentProof,
      });

      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  return {
    confirm,
    isLoading,
    error,
  };
}
