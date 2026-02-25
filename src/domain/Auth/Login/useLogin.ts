import {useMutation} from '@tanstack/react-query';

import {loginService} from './loginService';
import {LoginRequest} from './loginTypes';
import {User} from '../User/userTypes';

export function useLogin() {
  const mutation = useMutation<User, Error, LoginRequest>({
    mutationFn: (credentials: LoginRequest) => loginService.execute(credentials),
  });

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
