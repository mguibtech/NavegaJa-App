import {useState} from 'react';

import {shipmentService} from '../shipmentService';
import {CollectShipmentResponse} from '../shipmentTypes';

export function useCollectShipment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function collect(
    shipmentId: string,
    validationCode?: string,
    collectionPhotoUri?: string,
  ): Promise<CollectShipmentResponse> {
    setIsLoading(true);
    setError(null);

    try {
      // Upload foto da coleta se fornecida
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

      const result = await shipmentService.collectShipment(shipmentId, {
        validationCode,
        collectionPhoto,
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
    collect,
    isLoading,
    error,
  };
}
