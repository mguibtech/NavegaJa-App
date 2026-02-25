import {api} from '@api';

import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from './forgotPasswordTypes';

async function execute(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const response = await api.post<ForgotPasswordResponse>(
    '/auth/forgot-password',
    data,
  );
  return response;
}

export const forgotPasswordAPI = {
  execute,
};
