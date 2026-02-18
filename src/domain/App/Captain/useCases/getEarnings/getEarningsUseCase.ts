import {captainAPI} from '../../captainAPI';
import {EarningsResponse} from '../../captainTypes';

export async function getEarningsUseCase(): Promise<EarningsResponse> {
  return captainAPI.getEarnings();
}
