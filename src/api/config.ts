/**
 * API Configuration
 *
 * IMPORTANTE: Configure as variáveis no arquivo .env
 *
 * Como descobrir seu IP:
 * - Windows: ipconfig (procure por "Endereço IPv4")
 * - Mac/Linux: ifconfig ou ip addr
 *
 * Exemplos de API_BASE_URL no .env:
 * - Desenvolvimento local: http://192.168.0.10:3000
 * - Emulador Android: http://10.0.2.2:3000
 * - Produção: https://api.navegaja.com.br
 */

import {API_BASE_URL as ENV_API_URL, API_TIMEOUT as ENV_API_TIMEOUT} from '@env';

// Usa variável de ambiente ou fallback para desenvolvimento
export const API_BASE_URL = ENV_API_URL || 'http://10.0.2.2:3000';

if (!__DEV__ && API_BASE_URL.startsWith('http://')) {
  console.warn('[Security] API_BASE_URL should use HTTPS in production');
}

// Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // Users
  PROFILE: '/users/profile',
  USER_BY_ID: (id: string) => `/users/${id}`,

  // Trips
  TRIPS: '/trips',
  TRIP_BY_ID: (id: string) => `/trips/${id}`,
  TRIPS_SEARCH: '/trips/search',
  TRIP_STATUS: (id: string) => `/trips/${id}/status`,
  TRIP_LOCATION: (id: string) => `/trips/${id}/location`,

  // Bookings
  BOOKINGS: '/bookings',
  BOOKING_BY_ID: (id: string) => `/bookings/${id}`,
  MY_BOOKINGS: '/bookings/my-bookings',
  BOOKING_TRACKING: (id: string) => `/bookings/${id}/tracking`,
  BOOKING_CHECKIN: (id: string) => `/bookings/${id}/checkin`,
  BOOKING_CANCEL: (id: string) => `/bookings/${id}/cancel`,
  BOOKING_COMPLETE: (id: string) => `/bookings/${id}/complete`,

  // Routes
  ROUTES: '/routes',
  ROUTE_BY_ID: (id: string) => `/routes/${id}`,
  ROUTES_SEARCH: '/routes/search',

  // Boats
  BOATS: '/boats',
  BOAT_BY_ID: (id: string) => `/boats/${id}`,
  MY_BOATS: '/boats/my-boats',

  // Reviews
  REVIEWS: '/reviews',
  CAPTAIN_REVIEWS: (id: string) => `/reviews/captain/${id}`,

  // Gamification
  GAMIFICATION_STATS: '/gamification/stats',
  GAMIFICATION_HISTORY: '/gamification/history',
  GAMIFICATION_LEADERBOARD: '/gamification/leaderboard',
  GAMIFICATION_REFERRALS: '/gamification/referrals',
  GAMIFICATION_KM_STATS: '/gamification/km-stats',

  // Upload
  UPLOAD_IMAGE: '/upload/image',

  // KYC
  KYC_SUBMIT: '/users/kyc/submit',
  KYC_STATUS: '/users/kyc/status',

  // PDFs
  BOOKING_TICKET: (id: string) => `/bookings/${id}/ticket`,
  TRIP_CARGO_MANIFEST: (id: string) => `/trips/${id}/cargo-manifest`,

  // Captain Analytics
  CAPTAIN_ANALYTICS: '/captain/analytics',
  CAPTAIN_ANALYTICS_REVENUE: '/captain/analytics/revenue',
  CAPTAIN_ANALYTICS_ROUTES: '/captain/analytics/routes',
  CAPTAIN_ANALYTICS_PASSENGERS: '/captain/analytics/passengers',

  // Stop Reviews
  STOP_REVIEWS: '/stop-reviews',
  STOP_REVIEWS_TOP: '/stop-reviews/top',
  STOP_REVIEWS_MY: '/stop-reviews/my',

  // Chat
  CHAT_CONVERSATIONS: '/chat/conversations',
  CHAT_MESSAGES: (bookingId: string) => `/chat/${bookingId}/messages`,
  CHAT_READ: (bookingId: string) => `/chat/${bookingId}/read`,
};

// Timeouts
export const API_TIMEOUT = ENV_API_TIMEOUT ? parseInt(ENV_API_TIMEOUT, 10) : 30000; // 30 segundos

// Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  ...(__DEV__ && {'ngrok-skip-browser-warning': 'true'}),
};

/**
 * Normaliza uma URL de arquivo retornada pelo backend.
 * Problema: o servidor pode retornar `http://localhost:3000/uploads/...`
 * Em devices físicos `localhost` aponta pro próprio celular → imagem falha.
 * Fix: substituir o host localhost/127.0.0.1 pelo API_BASE_URL configurado.
 */
export function normalizeFileUrl(url: string | null | undefined): string {
  if (!url) {return '';}
  // Se a URL começa com http mas contém localhost/127.0.0.1, substitui pelo host real
  const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//;
  if (localhostPattern.test(url)) {
    return url.replace(localhostPattern, `${API_BASE_URL}/`);
  }
  // URL relativa → prefixar com base
  if (!url.startsWith('http')) {
    return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  }
  return url;
}

/**
 * Wrapper para <Image source={...}> que:
 * - Normaliza URLs localhost → API_BASE_URL
 * - Inclui header ngrok (inofensivo em produção)
 *
 * Uso: <Image source={apiImageSource(url)} />
 */
export const apiImageSource = (uri: string | null | undefined) => ({
  uri: normalizeFileUrl(uri),
  headers: {
    ...(__DEV__ && {'ngrok-skip-browser-warning': 'true'}),
  },
});
