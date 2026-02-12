import {api} from '@api';

import {AdvancePaymentResponse} from '../../captainTypes';

export async function advancePaymentUseCase(
  amount: number,
): Promise<AdvancePaymentResponse> {
  const response = await api.post<AdvancePaymentResponse>(
    '/captain/advance-payment',
    {amount},
  );
  return response;
}
