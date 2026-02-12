import {api} from '@api';

import {EarningsResponse} from '../../captainTypes';

export async function getEarningsUseCase(): Promise<EarningsResponse> {
  const response = await api.get<EarningsResponse>('/captain/earnings');
  return response;
}
