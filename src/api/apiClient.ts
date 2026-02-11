import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import {Platform} from 'react-native';

import {authStorage} from '@services';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor: adiciona token JWT
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response Interceptor: trata 401 e refresh token
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Se não for 401 ou não tiver config, rejeita
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Não tentar refresh em rotas de autenticação
    const isAuthRoute = originalRequest.url?.includes('/auth/login') ||
                        originalRequest.url?.includes('/auth/register');
    if (isAuthRoute) {
      return Promise.reject(error);
    }

    // Se já tentou refresh, logout
    if (originalRequest._retry) {
      await authStorage.clear();
      return Promise.reject(error);
    }

    // Se já está fazendo refresh, adiciona na fila
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({resolve, reject});
      })
        .then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await authStorage.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      // Chamada para refresh token
      const response = await axios.post<{token: string; refreshToken: string}>(
        `${BASE_URL}/auth/refresh`,
        {refreshToken},
      );

      const {token: newToken, refreshToken: newRefreshToken} = response.data;

      // Salva novos tokens
      await authStorage.saveToken(newToken);
      await authStorage.saveRefreshToken(newRefreshToken);

      // Atualiza header da requisição original
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      // Processa fila de requisições pendentes
      processQueue(null, newToken);

      isRefreshing = false;

      // Retenta a requisição original
      return api(originalRequest);
    } catch (refreshError) {
      // Se refresh falhar, faz logout
      processQueue(refreshError, null);
      await authStorage.clear();
      isRefreshing = false;
      return Promise.reject(refreshError);
    }
  },
);
