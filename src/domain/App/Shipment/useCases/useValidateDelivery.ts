import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '../../../../infra/queryKeys';
import {shipmentService} from '../shipmentService';
import {ValidateDeliveryResponse} from '../shipmentTypes';

type ValidateDeliveryParams = {
  trackingCode: string;
  validationCode: string;
  deliveryPhotoUri?: string;
};

export function useValidateDelivery() {
  const queryClient = useQueryClient();

  const mutation = useMutation<ValidateDeliveryResponse, Error, ValidateDeliveryParams>({
    mutationFn: async ({trackingCode, validationCode, deliveryPhotoUri}) => {
      let deliveryPhoto: string | undefined;
      if (deliveryPhotoUri) {
        const photoData = {
          uri: deliveryPhotoUri,
          type: 'image/jpeg',
          name: `delivery-${Date.now()}.jpg`,
        };
        const urls = await shipmentService.uploadPhotosToS3([photoData]);
        deliveryPhoto = urls[0];
      }
      return shipmentService.validateDelivery(trackingCode, {validationCode, deliveryPhoto});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.shipments.my()});
    },
  });

  return {
    validate: (trackingCode: string, validationCode: string, deliveryPhotoUri?: string) =>
      mutation.mutateAsync({trackingCode, validationCode, deliveryPhotoUri}),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
