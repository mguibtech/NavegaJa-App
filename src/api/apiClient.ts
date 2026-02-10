import axios from 'axios';
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
});

// Interceptor: adiciona token JWT em toda request
api.interceptors.request.use(async config => {
  const token = await authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: trata 401 (token expirado/inválido)
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await authStorage.clear();
      // O AuthContext vai detectar a remoção do token e redirecionar pro login
    }
    return Promise.reject(error);
  },
);
