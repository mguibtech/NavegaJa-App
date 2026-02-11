import {api} from '@api';

import {
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './resetPasswordTypes';

class ResetPasswordAPI {
  async execute(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await api.post<ResetPasswordResponse>(
      '/auth/reset-password',
      data,
    );
    return response.data;
  }
}

export const resetPasswordAPI = new ResetPasswordAPI();
