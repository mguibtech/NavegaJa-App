import {useMutation} from '@tanstack/react-query';

import {UpdateProfileData, User} from '../../userTypes';
import {updateProfileUseCase} from './updateProfileUseCase';

export function useUpdateProfile() {
  const mutation = useMutation<User, Error, UpdateProfileData>({
    mutationFn: (data: UpdateProfileData) => updateProfileUseCase(data),
  });

  return {
    updateProfile: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
