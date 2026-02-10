import React, {createContext, useContext, useEffect, useState} from 'react';

import {authApi} from '@api';
import {authStorage} from '@services';
import {AuthResponse, LoginRequest, RegisterRequest, User} from '@types';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const token = await authStorage.getToken();
      if (token) {
        const me = await authApi.getMe();
        setUser(me);
      }
    } catch {
      await authStorage.clear();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAuthResponse(response: AuthResponse) {
    await authStorage.saveToken(response.token);
    await authStorage.saveUser(response.user);
    setUser(response.user);
  }

  async function login(data: LoginRequest) {
    const response = await authApi.login(data);
    await handleAuthResponse(response);
  }

  async function register(data: RegisterRequest) {
    const response = await authApi.register(data);
    await handleAuthResponse(response);
  }

  async function logout() {
    await authStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
