import {useMutation} from '@tanstack/react-query';

import {shipmentService} from '../shipmentService';
import {ShipmentReview, CreateShipmentReviewData} from '../shipmentTypes';

export function useShipmentReview() {
  const createMutation = useMutation<ShipmentReview, Error, CreateShipmentReviewData>({
    mutationFn: (data) => shipmentService.createReview(data),
  });

  const getReviewMutation = useMutation<ShipmentReview | null, Error, string>({
    mutationFn: (shipmentId) => shipmentService.getReviewByShipmentId(shipmentId),
  });

  return {
    createReview: (data: CreateShipmentReviewData) => createMutation.mutateAsync(data),
    getReview: (shipmentId: string) => getReviewMutation.mutateAsync(shipmentId),
    isLoading: createMutation.isPending || getReviewMutation.isPending,
    error: createMutation.error ?? getReviewMutation.error,
  };
}
