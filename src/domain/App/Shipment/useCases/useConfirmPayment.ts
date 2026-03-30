import {useMutation, useQueryClient} from '@tanstack/react-query';

import {
  enqueueConfirmShipmentPayment,
  isLikelyOfflineError,
  OfflineQueuedError,
  queryKeys,
  refreshOnlineState,
} from '@infra';
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
      const buildQueuedError = (jobId: string) =>
        new OfflineQueuedError(
          'Sem internet. A confirmação de pagamento foi salva e sera sincronizada automaticamente quando a conexao voltar.',
          jobId,
        );

      const isOnline = await refreshOnlineState();
      if (!isOnline) {
        const queuedJob = await enqueueConfirmShipmentPayment(
          shipmentId,
          paymentProofUri,
        );
        throw buildQueuedError(queuedJob.id);
      }

      let paymentProof: string | undefined;
      try {
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
      } catch (error) {
        if (isLikelyOfflineError(error)) {
          const queuedJob = await enqueueConfirmShipmentPayment(
            shipmentId,
            paymentProofUri,
          );
          throw buildQueuedError(queuedJob.id);
        }

        throw error;
      }
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
