import {useState} from 'react';

import {forgotPasswordAPI} from './forgotPasswordAPI';

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function forgotPassword(phone: string): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      await forgotPasswordAPI.execute({phone});
      setIsLoading(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  return {
    forgotPassword,
    isLoading,
    error,
  };
}
