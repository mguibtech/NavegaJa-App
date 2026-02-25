import {shipmentService} from '../../shipmentService';
import {TrackShipmentResponse} from '../../shipmentTypes';

export async function trackShipmentUseCase(
  trackingCode: string,
): Promise<TrackShipmentResponse> {
  return shipmentService.trackShipment(trackingCode);
}
