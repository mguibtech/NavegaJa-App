import {shipmentService} from '../../shipmentService';
import {Shipment} from '../../shipmentTypes';

export async function createShipmentUseCase(data: FormData): Promise<Shipment> {
  return shipmentService.createFromFormData(data);
}
