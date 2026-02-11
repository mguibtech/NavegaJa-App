import {useState} from 'react';

import {authStorage} from '@services';

import {registerAPI} from './registerAPI';
import {registerAdapter} from './registerAdapter';
import {RegisterRequest} from './registerTypes';
import {User} from '../User/userTypes';

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function register(data: RegisterRequest): Promise<User> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerAPI.execute(data);

      const user = registerAdapter.toUser(response);
      const {token, refreshToken} = registerAdapter.toTokens(response);

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
    register,
    isLoading,
    error,
  };
}
