import {useState} from 'react';

import {resetPasswordAPI} from './resetPasswordAPI';
import {ResetPasswordRequest} from './resetPasswordTypes';

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function resetPassword(data: ResetPasswordRequest): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      await resetPasswordAPI.execute(data);
      setIsLoading(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  return {
    resetPassword,
    isLoading,
    error,
  };
}
