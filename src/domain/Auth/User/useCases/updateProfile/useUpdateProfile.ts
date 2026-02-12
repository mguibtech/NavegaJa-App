import {useState} from 'react';

import {UpdateProfileData, User} from '../../userTypes';
import {updateProfileUseCase} from './updateProfileUseCase';

export function useUpdateProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function updateProfile(data: UpdateProfileData): Promise<User> {
    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await updateProfileUseCase(data);
      setIsLoading(false);
      return updatedUser;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  return {
    updateProfile,
    isLoading,
    error,
  };
}
