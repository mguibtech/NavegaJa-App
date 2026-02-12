import {api} from '@api';

import {LoginRequest, LoginResponse} from './loginTypes';

class LoginAPI {
  async execute(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response;
  }
}

export const loginAPI = new LoginAPI();
