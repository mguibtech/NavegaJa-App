import {captainService} from '../../captainService';
import {EarningsResponse} from '../../captainTypes';

export async function getEarningsUseCase(): Promise<EarningsResponse> {
  return captainService.getEarnings();
}
