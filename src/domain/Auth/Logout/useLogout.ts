import {useState} from 'react';

import {authStorage} from '@services';

import {logoutAPI} from './logoutAPI';

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);

  async function logout(): Promise<void> {
    setIsLoading(true);

    try {
      await logoutAPI.execute();
    } catch {
      // Ignore API error
    } finally {
      // Always clear local storage
      await authStorage.clear();
      setIsLoading(false);
    }
  }

  return {
    logout,
    isLoading,
  };
}
