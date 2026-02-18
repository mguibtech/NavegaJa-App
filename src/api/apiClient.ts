import axios, {AxiosInstance, AxiosError, InternalAxiosRequestConfig} from 'axios';
import {API_BASE_URL, API_TIMEOUT, DEFAULT_HEADERS} from './config';
import {authStorage} from '@services';
import type {ApiError} from './types';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];
  private onUnauthorized: (() => void) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: DEFAULT_HEADERS,
    });

    this.setupInterceptors();
  }

  private processQueue(error: any = null, token: string | null = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await authStorage.getToken();

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (__DEV__) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.client.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log(`[API] Response: ${response.status}`, response.data);
        }
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        // Não loga erros 401 no console (são tratados automaticamente pelo refresh token)
        if (__DEV__ && error.response?.status !== 401) {
          const status = error.response?.status ?? 500;
          // 4xx: log como warn (evita LogBox overlay — erros tratados no componente)
          // 5xx: log como error (erros reais do servidor)
          if (status >= 500) {
            console.error('[API] Error:', error.response?.data || error.message);
          } else {
            console.warn('[API] 4xx:', error.response?.data || error.message);
          }
        }

        const originalRequest = error.config as InternalAxiosRequestConfig & {_retry?: boolean};

        // Se for 401 e não for a rota de refresh/login/register
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/refresh') &&
          !originalRequest.url?.includes('/auth/login') &&
          !originalRequest.url?.includes('/auth/register')
        ) {
          if (this.isRefreshing) {
            // Se já está fazendo refresh, adiciona na fila
            return new Promise((resolve, reject) => {
              this.failedQueue.push({resolve, reject});
            })
              .then(token => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await authStorage.getRefreshToken();

            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Faz o refresh do token
            const response = await this.client.post('/auth/refresh', {
              refreshToken,
            });

            const {accessToken, refreshToken: newRefreshToken} = response.data;

            // Salva os novos tokens
            await authStorage.saveToken(accessToken);
            await authStorage.saveRefreshToken(newRefreshToken);

            // Atualiza o header padrão
            this.setAuthToken(accessToken);

            // Processa a fila de requisições que falharam
            this.processQueue(null, accessToken);

            // Retenta a requisição original
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // Se o refresh falhar, limpa tudo e faz logout
            this.processQueue(refreshError, null);
            await authStorage.clear();

            // Chama callback de logout se estiver registrado
            if (this.onUnauthorized) {
              this.onUnauthorized();
            }

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        const apiError: ApiError = {
          statusCode: error.response?.status || 500,
          message: error.response?.data?.message || 'Erro ao se comunicar com o servidor',
          error: error.response?.data?.error || 'Internal Server Error',
        };

        return Promise.reject(apiError);
      },
    );
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async upload<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.common.Authorization;
  }

  setUnauthorizedHandler(callback: () => void) {
    this.onUnauthorized = callback;
  }
}

export const apiClient = new ApiClient();
export const api = apiClient;