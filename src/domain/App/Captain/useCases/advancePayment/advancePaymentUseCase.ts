import {captainAPI} from '../../captainAPI';
import {AdvancePaymentResponse} from '../../captainTypes';

export async function advancePaymentUseCase(
  amount: number,
): Promise<AdvancePaymentResponse> {
  return captainAPI.advancePayment(amount);
}
