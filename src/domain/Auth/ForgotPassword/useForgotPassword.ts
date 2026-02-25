import {useMutation} from '@tanstack/react-query';

import {forgotPasswordService} from './forgotPasswordService';

export function useForgotPassword() {
  const mutation = useMutation<unknown, Error, string>({
    mutationFn: (email: string) => forgotPasswordService.execute(email),
  });

  return {
    forgotPassword: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
