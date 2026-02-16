import {create} from 'zustand';

import {authStorage} from '@services';
import {loginAPI, loginAdapter, RegisterDto} from '@domain';
import {registerAPI, registerAdapter} from '@domain';
import {userAPI} from '@domain';
import type {User} from '@domain';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;

  // Actions
  login: (credentials: {phone: string; password: string}) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  updateUser: (user: User) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  // Initial State
  user: null,
  isLoading: true,
  isLoggedIn: false,

  // Actions
  loadStoredUser: async () => {
    try {
      const token = await authStorage.getToken();
      if (token) {
        const me = await userAPI.getMe();
        set({user: me, isLoggedIn: true, isLoading: false});
      } else {
        set({user: null, isLoggedIn: false, isLoading: false});
      }
    } catch {
      await authStorage.clear();
      set({user: null, isLoggedIn: false, isLoading: false});
    }
  },

  login: async (credentials) => {
    set({isLoading: true});
    try {
      // Chama API
      const response = await loginAPI.execute(credentials);

      // Adapta resposta
      const user = loginAdapter.toUser(response);
      const {token, refreshToken} = loginAdapter.toTokens(response);

      // Salva no storage
      await authStorage.saveToken(token);
      await authStorage.saveRefreshToken(refreshToken);
      await authStorage.saveUser(user);

      // Atualiza estado global
      set({user, isLoggedIn: true, isLoading: false});
    } catch (_error) {
      set({isLoading: false});
      throw _error;
    }
  },

  register: async (data) => {
    set({isLoading: true});
    try {
      // Chama API
      const response = await registerAPI.execute(data);

      // Adapta resposta
      const user = registerAdapter.toUser(response);
      const {token, refreshToken} = registerAdapter.toTokens(response);

      // Salva no storage
      await authStorage.saveToken(token);
      await authStorage.saveRefreshToken(refreshToken);
      await authStorage.saveUser(user);

      // Atualiza estado global
      set({user, isLoggedIn: true, isLoading: false});
    } catch (_error) {
      set({isLoading: false});
      throw _error;
    }
  },

  logout: async () => {
    await authStorage.clear();
    set({user: null, isLoggedIn: false});
  },

  setUser: (user: User | null) => {
    set({user, isLoggedIn: !!user});
  },

  setLoading: (isLoading: boolean) => {
    set({isLoading});
  },

  updateUser: async (user: User) => {
    // Salva no storage
    await authStorage.saveUser(user);
    // Atualiza estado global
    set({user});
  },
}));
