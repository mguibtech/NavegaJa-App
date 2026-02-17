import {useState} from 'react';

import {shipmentService} from '../shipmentService';
import {ValidateDeliveryResponse} from '../shipmentTypes';

export function useValidateDelivery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function validate(
    trackingCode: string,
    validationCode: string,
    deliveryPhotoUri?: string,
  ): Promise<ValidateDeliveryResponse> {
    setIsLoading(true);
    setError(null);

    try {
      // Upload foto da entrega se fornecida
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

      const result = await shipmentService.validateDelivery(trackingCode, {
        validationCode,
        deliveryPhoto,
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
    validate,
    isLoading,
    error,
  };
}
