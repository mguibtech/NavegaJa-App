import {useMutation} from '@tanstack/react-query';

import {resetPasswordService} from './resetPasswordService';
import {ResetPasswordRequest} from './resetPasswordTypes';

export function useResetPassword() {
  const mutation = useMutation<unknown, Error, ResetPasswordRequest>({
    mutationFn: (data: ResetPasswordRequest) => resetPasswordService.execute(data),
  });

  return {
    resetPassword: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
