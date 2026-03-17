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

import {Platform} from 'react-native';

import {API_BASE_URL as ENV_API_URL, API_TIMEOUT as ENV_API_TIMEOUT} from '@env';

type FilePreviewLike =
  | string
  | null
  | undefined
  | {
      id?: string | number | null;
      url?: string | null;
      uri?: string | null;
      path?: string | null;
      photoUrl?: string | null;
      imageUrl?: string | null;
      fileUrl?: string | null;
      src?: string | null;
    };

type FilePreviewOptions = {
  folder?: string;
};

// Usa variável de ambiente ou fallback para desenvolvimento
export const API_BASE_URL = ENV_API_URL || 'http://10.0.2.2:3000';

if (!__DEV__ && API_BASE_URL.startsWith('http://')) {
  console.warn('[Security] API_BASE_URL should use HTTPS in production');
}

// Endpoints
export const API_ENDPOINTS = {

  // ── Auth ──────────────────────────────────────────────────────────────────
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // ── Upload ────────────────────────────────────────────────────────────────
  UPLOAD_IMAGE: '/upload/image',

  // ── Users ─────────────────────────────────────────────────────────────────
  PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/password',
  USER_BY_ID: (id: string) => `/users/${id}`,
  KYC_STATUS: '/users/kyc/status',
  KYC_SUBMIT: '/users/kyc/submit',
  DOCUMENT_CHANGE_REQUESTS: '/document-change-request',
  DOCUMENT_CHANGE_REQUEST_BY_ID: (id: string) => `/document-change-request/${id}`,
  DOCUMENT_CHANGE_REQUEST_APPROVE: (id: string) => `/document-change-request/${id}/approve`,
  DOCUMENT_CHANGE_REQUEST_REJECT: (id: string) => `/document-change-request/${id}/reject`,

  // ── Trips ─────────────────────────────────────────────────────────────────
  TRIPS: '/trips',
  TRIP_BY_ID: (id: string) => `/trips/${id}`,
  TRIPS_POPULAR: '/trips/popular',
  TRIPS_CAPTAIN_MY: '/trips/captain/my-trips',
  TRIP_STATUS: (id: string) => `/trips/${id}/status`,
  TRIP_LOCATION: (id: string) => `/trips/${id}/location`,
  TRIP_MANAGE: (id: string) => `/trips/${id}/manage`,
  TRIP_CARGO_MANIFEST: (id: string) => `/trips/${id}/cargo-manifest`,

  // ── Routes ────────────────────────────────────────────────────────────────
  ROUTES: '/routes',
  ROUTE_BY_ID: (id: string) => `/routes/${id}`,
  ROUTES_SEARCH: '/routes/search',

  // ── Bookings ──────────────────────────────────────────────────────────────
  BOOKINGS: '/bookings',
  BOOKING_BY_ID: (id: string) => `/bookings/${id}`,
  MY_BOOKINGS: '/bookings/my-bookings',
  BOOKING_CHECKIN: (id: string) => `/bookings/${id}/checkin`,
  BOOKING_CANCEL: (id: string) => `/bookings/${id}/cancel`,
  BOOKING_PAYMENT_STATUS: (id: string) => `/bookings/${id}/payment-status`,
  BOOKING_CALCULATE_PRICE: '/bookings/calculate-price',
  BOOKING_TICKET: (id: string) => `/bookings/${id}/ticket`,

  // ── Boats ─────────────────────────────────────────────────────────────────
  BOATS: '/boats',
  BOAT_BY_ID: (id: string) => `/boats/${id}`,
  MY_BOATS: '/boats/my-boats',

  // ── Shipments ─────────────────────────────────────────────────────────────
  SHIPMENTS: '/shipments',
  SHIPMENT_BY_ID: (id: string) => `/shipments/${id}`,
  MY_SHIPMENTS: '/shipments/my-shipments',
  SHIPMENT_TRACK: (code: string) => `/shipments/track/${code}`,
  SHIPMENT_VALIDATE_DELIVERY: (code: string) => `/shipments/track/${code}/validate-delivery`,
  SHIPMENT_TIMELINE: (id: string) => `/shipments/${id}/timeline`,
  SHIPMENT_CANCEL: (id: string) => `/shipments/${id}/cancel`,
  SHIPMENT_STATUS: (id: string) => `/shipments/${id}/status`,
  SHIPMENT_COLLECT: (id: string) => `/shipments/${id}/collect`,
  SHIPMENT_DELIVER: (id: string) => `/shipments/${id}/deliver`,
  SHIPMENT_OUT_FOR_DELIVERY: (id: string) => `/shipments/${id}/out-for-delivery`,
  SHIPMENT_CONFIRM_PAYMENT: (id: string) => `/shipments/${id}/confirm-payment`,
  SHIPMENT_INCIDENT: (id: string) => `/shipments/${id}/incident`,
  SHIPMENT_REVIEW: (id: string) => `/shipments/${id}/review`,
  SHIPMENT_REVIEWS: '/shipments/reviews',
  SHIPMENT_CALCULATE_PRICE: '/shipments/calculate-price',
  SHIPMENT_VALIDATE_QR: '/shipments/validate-qr',

  // ── Reviews ───────────────────────────────────────────────────────────────
  REVIEWS: '/reviews',
  REVIEW_CAPTAIN: '/reviews/captain-review',
  REVIEW_CAN_REVIEW: (tripId: string) => `/reviews/can-review/${tripId}`,
  REVIEWS_MY: '/reviews/my',
  REVIEWS_BY_BOAT: (boatId: string) => `/reviews/boat/${boatId}`,
  REVIEWS_BY_CAPTAIN: (captainId: string) => `/reviews/captain/${captainId}`,
  REVIEWS_BY_TRIP: (tripId: string) => `/reviews/trip/${tripId}`,

  // ── Safety ────────────────────────────────────────────────────────────────
  EMERGENCY_CONTACTS: '/safety/emergency-contacts',
  CHECKLISTS: '/safety/checklists',
  CHECKLIST_BY_ID: (id: string) => `/safety/checklists/${id}`,
  CHECKLIST_BY_TRIP: (tripId: string) => `/safety/checklists/trip/${tripId}`,
  CHECKLIST_TRIP_STATUS: (tripId: string) => `/safety/checklists/trip/${tripId}/status`,
  SOS: '/safety/sos',
  SOS_ACTIVE: '/safety/sos/active',
  SOS_MY: '/safety/sos/my-alerts',
  SOS_BY_ID: (id: string) => `/safety/sos/${id}`,
  SOS_RESOLVE: (id: string) => `/safety/sos/${id}/resolve`,
  SOS_CANCEL: (id: string) => `/safety/sos/${id}/cancel`,

  // ── Gamification ──────────────────────────────────────────────────────────
  GAMIFICATION_STATS: '/gamification/stats',
  GAMIFICATION_HISTORY: '/gamification/history',
  GAMIFICATION_LEADERBOARD: '/gamification/leaderboard',
  GAMIFICATION_REFERRALS: '/gamification/referrals',
  GAMIFICATION_KM_STATS: '/gamification/km-stats',

  // ── Captain ───────────────────────────────────────────────────────────────
  CAPTAIN_EARNINGS: '/captain/earnings',
  CAPTAIN_ADVANCE_PAYMENT: '/captain/advance-payment',
  CAPTAIN_ANALYTICS: '/captain/analytics',
  CAPTAIN_ANALYTICS_REVENUE: '/captain/analytics/revenue',
  CAPTAIN_ANALYTICS_ROUTES: '/captain/analytics/routes',
  CAPTAIN_ANALYTICS_PASSENGERS: '/captain/analytics/passengers',

  // ── Stop Reviews ──────────────────────────────────────────────────────────
  STOP_REVIEWS: '/stop-reviews',
  STOP_REVIEWS_TOP: '/stop-reviews/top',
  STOP_REVIEWS_MY: '/stop-reviews/my',

  // ── Chat ──────────────────────────────────────────────────────────────────
  CHAT_CONVERSATIONS: '/chat/conversations',
  CHAT_MESSAGES: (bookingId: string) => `/chat/${bookingId}/messages`,
  CHAT_READ: (bookingId: string) => `/chat/${bookingId}/read`,

  // ── Promotions ────────────────────────────────────────────────────────────
  PROMOTIONS_ACTIVE: '/promotions/active',

  // ── Coupons / Descontos ───────────────────────────────────────────────────
  COUPON_BY_CODE: (code: string) => `/coupons/${code}`,
  COUPON_VALIDATE: '/coupons/validate',

  // ── Favoritos ─────────────────────────────────────────────────────────────
  FAVORITES: '/favorites',
  FAVORITE_BY_ID: (id: string) => `/favorites/${id}`,
  FAVORITE_CHECK: '/favorites/check',
  FAVORITE_TOGGLE: '/favorites/toggle',

  // ── Métodos de Pagamento ──────────────────────────────────────────────────
  PAYMENT_METHODS: '/payment-methods',
  PAYMENT_METHOD_BY_ID: (id: string) => `/payment-methods/${id}`,
  PAYMENT_METHOD_DEFAULT: (id: string) => `/payment-methods/${id}/default`,

  // ── Location ──────────────────────────────────────────────────────────────
  LOCATION_CEP: (cep: string) => `/locations/cep/${cep}`,
  LOCATION_CITIES: '/locations/cities',
  LOCATION_CITIES_BY_UF: (uf: string) => `/locations/cities/${uf}`,
  LOCATION_LABEL: '/locations/location-label',
  LOCATION_REVERSE_GEOCODE: '/locations/reverse-geocode',
  LOCATION_GEOCODE: '/trips/geocode',
  LOCATION_SUGGEST: '/locations/suggest',

  // ── Weather ───────────────────────────────────────────────────────────────
  WEATHER_CURRENT: '/weather/current',
  WEATHER_REGION: (region: string) => `/weather/region/${region}`,
  WEATHER_FORECAST: '/weather/forecast',
  WEATHER_REGION_FORECAST: (region: string) => `/weather/region/${region}/forecast`,
  WEATHER_NAV_SAFETY: '/weather/navigation-safety',
  WEATHER_REGION_NAV_SAFETY: (region: string) => `/weather/region/${region}/navigation-safety`,
  WEATHER_ALERTS: '/weather/alerts',
  WEATHER_REGION_ALERTS: (region: string) => `/weather/region/${region}/alerts`,
  WEATHER_TRIP: (tripId: string) => `/weather/trip/${tripId}`,
  WEATHER_RIVER_LEVELS: '/weather/river-levels',
  WEATHER_RIVER_LEVEL: (code: string) => `/weather/river-level/${code}`,
  WEATHER_HISTORY: '/weather/history',

  // ── Flood Hub ─────────────────────────────────────────────────────────────
  FLOOD_STATUS: '/weather/flood/status',
  FLOOD_GAUGE_MODEL: (gaugeId: string) => `/weather/flood/gauge/${gaugeId}/model`,
  FLOOD_INUNDATION: '/weather/flood/inundation',
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
function extractFilePreviewPath(file: FilePreviewLike): string {
  if (typeof file === 'string') {
    return file;
  }

  if (!file || typeof file !== 'object') {
    return '';
  }

  return (
    file.url ||
    file.uri ||
    file.path ||
    file.photoUrl ||
    file.imageUrl ||
    file.fileUrl ||
    file.src ||
    ''
  );
}

function makeFileUrlWebSafe(url: string): string {
  return url.replace(/ /g, '%20');
}

function stripTrailingSlashFromFileUrl(url: string): string {
  return url.replace(/(\.[a-z0-9]{2,8})\/+(?=($|[?#]))/i, '$1');
}

function isDirectDeviceFileUri(url: string): boolean {
  return /^(file|content|ph|assets-library|asset|data|blob):/i.test(url);
}

function isLocalOrPrivateHost(hostname: string): boolean {
  return (
    /^(localhost|127\.0\.0\.1|10\.0\.2\.2)$/i.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}

type ParsedHttpUrl = {
  origin: string;
  hostname: string;
  pathname: string;
  search: string;
  hash: string;
};

function parseHttpUrl(url: string): ParsedHttpUrl | null {
  const match = url.match(/^(https?:\/\/[^/?#]+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i);
  if (!match) {
    return null;
  }

  const hostMatch = match[1].match(/^https?:\/\/([^/:?#]+)/i);
  return {
    origin: match[1],
    hostname: hostMatch?.[1] ?? '',
    pathname: match[2] ?? '/',
    search: match[3] ?? '',
    hash: match[4] ?? '',
  };
}

function getApiBaseOrigin(): string {
  return parseHttpUrl(API_BASE_URL)?.origin ?? API_BASE_URL.replace(/\/+$/, '');
}

function shouldReplaceFileUrlOrigin(parsedUrl: ParsedHttpUrl): boolean {
  const normalizedPath = parsedUrl.pathname.replace(/\\/g, '/');
  const apiBaseOrigin = getApiBaseOrigin();

  if (!apiBaseOrigin || parsedUrl.origin === apiBaseOrigin) {
    return false;
  }

  if (!/^\/uploads(?:\/|$)/i.test(normalizedPath)) {
    return false;
  }

  return isLocalOrPrivateHost(parsedUrl.hostname);
}

export function normalizeFileUrl(file: FilePreviewLike): string {
  const rawPath = extractFilePreviewPath(file);
  if (!rawPath) {return '';}
  const sanitizedUrl = stripTrailingSlashFromFileUrl(
    String(rawPath).trim().replace(/\\/g, '/'),
  );
  if (!sanitizedUrl) {return '';}
  if (isDirectDeviceFileUri(sanitizedUrl)) {
    return sanitizedUrl;
  }

  if (/^https?:\/\//i.test(sanitizedUrl)) {
    const parsedUrl = parseHttpUrl(sanitizedUrl);
    if (!parsedUrl) {
      return makeFileUrlWebSafe(sanitizedUrl);
    }

    if (shouldReplaceFileUrlOrigin(parsedUrl)) {
      return makeFileUrlWebSafe(
        `${getApiBaseOrigin()}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
      );
    }

    return makeFileUrlWebSafe(sanitizedUrl);
  }

  // URL relativa → prefixar com base
  return makeFileUrlWebSafe(
    `${API_BASE_URL}${sanitizedUrl.startsWith('/') ? sanitizedUrl : `/${sanitizedUrl}`}`,
  );
}

export function getFilePreviewUri(file: FilePreviewLike): string {
  return normalizeFileUrl(file);
}

export function getFilePreviewCandidates(
  file: FilePreviewLike,
  options?: FilePreviewOptions,
): string[] {
  const rawPath = extractFilePreviewPath(file).trim().replace(/\\/g, '/');

  if (!rawPath) {return [];}
  if (isDirectDeviceFileUri(rawPath)) {
    return [rawPath];
  }

  const folder = options?.folder?.replace(/^\/+|\/+$/g, '') ?? '';
  const strippedPath = rawPath.replace(/^\/+/, '');
  const candidates = new Set<string>();

  const addCandidate = (value: string | null | undefined) => {
    const normalized = normalizeFileUrl(value);
    if (normalized) {
      candidates.add(normalized);
    }
  };

  addCandidate(rawPath);

  if (!/^https?:\/\//i.test(rawPath)) {
    if (!/^uploads\//i.test(strippedPath)) {
      addCandidate(`/uploads/${strippedPath}`);
    }

    if (folder && !new RegExp(`(?:^|/)${folder}(?:/|$)`, 'i').test(strippedPath)) {
      const fileName = strippedPath.split('/').pop() || strippedPath;
      addCandidate(`/uploads/${folder}/${fileName}`);
    }
  }

  return Array.from(candidates);
}

function getImageRequestHeaders(uri: string) {
  if (Platform.OS === 'web' || !__DEV__) {
    return undefined;
  }

  // O header abaixo só é necessário para túneis ngrok em desenvolvimento.
  // Em assets públicos normais ele não agrega valor e pode atrapalhar o carregamento.
  if (!/ngrok/i.test(uri)) {
    return undefined;
  }

  return {'ngrok-skip-browser-warning': 'true'};
}

/**
 * Wrapper para <Image source={...}> que:
 * - Normaliza URLs localhost → API_BASE_URL
 * - Inclui header ngrok (inofensivo em produção)
 *
 * Uso: <Image source={apiImageSource(url)} />
 */
export const apiImageSource = (file: FilePreviewLike) => ({
  uri: getFilePreviewUri(file),
  ...(getImageRequestHeaders(getFilePreviewUri(file))
    ? {
        headers: getImageRequestHeaders(getFilePreviewUri(file)),
      }
    : {}),
});
