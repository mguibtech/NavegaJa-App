import {useState, useEffect} from 'react';

import {authStorage} from '@services';

import {userAPI} from './userAPI';
import {User} from './userTypes';

/**
 * Hook para gerenciar o estado do usuário autenticado
 * Carrega automaticamente do storage ao iniciar
 */
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const token = await authStorage.getToken();

      if (!token) {
        setUser(null);
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      // Try to get user from API
      const currentUser = await userAPI.getMe();
      setUser(currentUser);
      setIsLoggedIn(true);
    } catch {
      // If API fails, clear storage
      await authStorage.clear();
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }

  function updateUser(newUser: User | null) {
    setUser(newUser);
    setIsLoggedIn(!!newUser);
  }

  return {
    user,
    isLoading,
    isLoggedIn,
    updateUser,
    reloadUser: loadUser,
  };
}
