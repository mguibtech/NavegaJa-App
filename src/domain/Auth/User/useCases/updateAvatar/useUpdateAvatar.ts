import {useMutation} from '@tanstack/react-query';

import {User} from '../../userTypes';
import {userService} from '../../userService';

export function useUpdateAvatar() {
  const mutation = useMutation<User, Error, string>({
    mutationFn: (avatarUrl: string) => userService.updateAvatar(avatarUrl),
  });

  return {
    updateAvatar: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
