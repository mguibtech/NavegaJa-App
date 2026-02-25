import {captainService} from '../../captainService';
import {AdvancePaymentResponse} from '../../captainTypes';

export async function advancePaymentUseCase(
  amount: number,
): Promise<AdvancePaymentResponse> {
  return captainService.advancePayment(amount);
}
