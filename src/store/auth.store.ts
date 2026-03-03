import {create} from 'zustand';

import {authStorage, registerPushToken, unregisterPushToken, clearNotificationHistory} from '@services';
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
  /** skipTokenRemoval=true quando chamado por token inválido — evita ciclo extra de 401 */
  logout: (skipTokenRemoval?: boolean) => Promise<void>;
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
    } catch (error: any) {
      // Só faz logout se o token é genuinamente inválido (401).
      // Erros de rede ou servidor transitórios NÃO devem deslogar o usuário.
      if (error?.statusCode === 401) {
        await authStorage.clear();
        set({user: null, isLoggedIn: false, isLoading: false});
      } else {
        set({isLoading: false});
      }
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

      // Limpa histórico de notificações do utilizador anterior
      await clearNotificationHistory();

      // Atualiza estado global
      set({user, isLoggedIn: true, isLoading: false});

      // Registra token FCM (não bloqueia o login se falhar)
      registerPushToken();
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

      // Limpa histórico de notificações de sessões anteriores
      await clearNotificationHistory();

      // Atualiza estado global
      set({user, isLoggedIn: true, isLoading: false});

      // Registra token FCM (não bloqueia o registro se falhar)
      registerPushToken();
    } catch (_error) {
      set({isLoading: false});
      throw _error;
    }
  },

  logout: async (skipTokenRemoval = false) => {
    // Quando chamado por token inválido (401), NÃO tenta desregistrar o FCM
    // pois a chamada de rede geraria outro 401 e criaria um ciclo infinito.
    if (!skipTokenRemoval) {
      await unregisterPushToken();
    }
    await authStorage.clear();
    await clearNotificationHistory();
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
