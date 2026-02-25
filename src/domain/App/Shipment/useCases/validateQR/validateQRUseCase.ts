import {shipmentService} from '../../shipmentService';
import {ValidateQRResponse} from '../../shipmentTypes';

export async function validateQRUseCase(
  qrCode: string,
): Promise<ValidateQRResponse> {
  return shipmentService.validateQR(qrCode);
}
