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

  // Upload
  UPLOAD_IMAGE: '/upload/image',
};

// Timeouts
export const API_TIMEOUT = ENV_API_TIMEOUT ? parseInt(ENV_API_TIMEOUT, 10) : 30000; // 30 segundos

// Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
