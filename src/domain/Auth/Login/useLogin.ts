import {useState} from 'react';

import {authStorage} from '@services';

import {loginAPI} from './loginAPI';
import {loginAdapter} from './loginAdapter';
import {LoginRequest} from './loginTypes';
import {User} from '../User/userTypes';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function login(credentials: LoginRequest): Promise<User> {
    setIsLoading(true);
    setError(null);

    try {
      // Call API
      const response = await loginAPI.execute(credentials);

      // Adapt response
      const user = loginAdapter.toUser(response);
      const {token, refreshToken} = loginAdapter.toTokens(response);

      // Save to storage
      await authStorage.saveToken(token);
      await authStorage.saveRefreshToken(refreshToken);
      await authStorage.saveUser(user);

      setIsLoading(false);
      return user;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  return {
    login,
    isLoading,
    error,
  };
}
