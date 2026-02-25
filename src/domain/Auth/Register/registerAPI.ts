import {api} from '@api';

import {RegisterRequest, RegisterResponse} from './registerTypes';

async function execute(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>('/auth/register', data);
  return response;
}

export const registerAPI = {
  execute,
};
