import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '../../../../infra/queryKeys';
import {shipmentService} from '../shipmentService';
import {CollectShipmentResponse} from '../shipmentTypes';

type CollectParams = {
  shipmentId: string;
  validationCode?: string;
  collectionPhotoUri?: string;
};

export function useCollectShipment() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CollectShipmentResponse, Error, CollectParams>({
    mutationFn: async ({shipmentId, validationCode, collectionPhotoUri}) => {
      let collectionPhoto: string | undefined;
      if (collectionPhotoUri) {
        const photoData = {
          uri: collectionPhotoUri,
          type: 'image/jpeg',
          name: `collection-${Date.now()}.jpg`,
        };
        const urls = await shipmentService.uploadPhotosToS3([photoData]);
        collectionPhoto = urls[0];
      }
      return shipmentService.collectShipment(shipmentId, {validationCode, collectionPhoto});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.shipments.my()});
    },
  });

  return {
    collect: (shipmentId: string, validationCode?: string, collectionPhotoUri?: string) =>
      mutation.mutateAsync({shipmentId, validationCode, collectionPhotoUri}),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
