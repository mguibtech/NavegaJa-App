import {api} from '@api';

import {RegisterRequest, RegisterResponse} from './registerTypes';

class RegisterAPI {
  async execute(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }
}

export const registerAPI = new RegisterAPI();
