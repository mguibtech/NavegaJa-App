import {useMutation} from '@tanstack/react-query';

import {registerService} from './registerService';
import {RegisterRequest} from './registerTypes';
import {User} from '../User/userTypes';

export function useRegister() {
  const mutation = useMutation<User, Error, RegisterRequest>({
    mutationFn: (data: RegisterRequest) => registerService.execute(data),
  });

  return {
    register: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
