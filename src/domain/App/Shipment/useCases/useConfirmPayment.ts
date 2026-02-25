import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '../../../../infra/queryKeys';
import {shipmentService} from '../shipmentService';
import {ConfirmPaymentResponse} from '../shipmentTypes';

type ConfirmPaymentParams = {
  shipmentId: string;
  paymentProofUri?: string;
};

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  const mutation = useMutation<ConfirmPaymentResponse, Error, ConfirmPaymentParams>({
    mutationFn: async ({shipmentId, paymentProofUri}) => {
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
      return shipmentService.confirmPayment(shipmentId, {paymentProof});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.shipments.my()});
    },
  });

  return {
    confirm: (shipmentId: string, paymentProofUri?: string) =>
      mutation.mutateAsync({shipmentId, paymentProofUri}),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
