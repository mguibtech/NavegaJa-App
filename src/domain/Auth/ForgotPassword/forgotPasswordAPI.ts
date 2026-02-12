import {api} from '@api';

import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from './forgotPasswordTypes';

class ForgotPasswordAPI {
  async execute(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await api.post<ForgotPasswordResponse>(
      '/auth/forgot-password',
      data,
    );
    return response;
  }
}

export const forgotPasswordAPI = new ForgotPasswordAPI();
