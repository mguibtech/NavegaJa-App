import {useMutation} from '@tanstack/react-query';

import {UpdatePasswordData} from '../../userTypes';
import {userService} from '../../userService';

export function useUpdatePassword() {
  const mutation = useMutation<void, Error, UpdatePasswordData>({
    mutationFn: (data: UpdatePasswordData) => userService.updatePassword(data),
  });

  return {
    updatePassword: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
