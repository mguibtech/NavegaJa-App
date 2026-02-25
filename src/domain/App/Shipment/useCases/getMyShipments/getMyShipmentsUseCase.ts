import {shipmentService} from '../../shipmentService';
import {Shipment} from '../../shipmentTypes';

export async function getMyShipmentsUseCase(): Promise<Shipment[]> {
  return shipmentService.getMyShipments();
}
