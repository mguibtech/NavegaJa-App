import {api} from '@api';

import {ValidateQRResponse} from '../../shipmentTypes';

export async function validateQRUseCase(
  qrCode: string,
): Promise<ValidateQRResponse> {
  const response = await api.post<ValidateQRResponse>(
    '/shipments/validate-qr',
    {qrCode},
  );
  return response;
}
