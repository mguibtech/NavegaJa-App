import {useState} from 'react';

import {shipmentAPI} from '../shipmentAPI';
import {ShipmentReview, CreateShipmentReviewData} from '../shipmentTypes';

export function useShipmentReview() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function createReview(
    data: CreateShipmentReviewData,
  ): Promise<ShipmentReview> {
    setIsLoading(true);
    setError(null);

    try {
      const review = await shipmentAPI.createReview(data);
      setIsLoading(false);
      return review;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  async function getReview(
    shipmentId: string,
  ): Promise<ShipmentReview | null> {
    setIsLoading(true);
    setError(null);

    try {
      const review = await shipmentAPI.getReviewByShipmentId(shipmentId);
      setIsLoading(false);
      return review;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  return {
    createReview,
    getReview,
    isLoading,
    error,
  };
}
