import {api} from '@api';

import {
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './resetPasswordTypes';

async function execute(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const response = await api.post<ResetPasswordResponse>(
    '/auth/reset-password',
    data,
  );
  return response;
}

export const resetPasswordAPI = {
  execute,
};
