import {resetPasswordAPI} from './resetPasswordAPI';
import {ResetPasswordRequest, ResetPasswordResponse} from './resetPasswordTypes';

async function execute(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return resetPasswordAPI.execute(data);
}

export const resetPasswordService = {
  execute,
};
