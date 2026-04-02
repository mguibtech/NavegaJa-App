import {TrackingStatus} from '@domain';

export const FALLBACK_COORDS = {latitude: -3.119, longitude: -60.0217};
export const TRACKING_POLL_INTERVAL_MS = 15_000;

const CITY_COORDS: Record<string, {latitude: number; longitude: number}> = {
  manaus: {latitude: -3.119, longitude: -60.0217},
  parintins: {latitude: -2.6277, longitude: -56.736},
  itacoatiara: {latitude: -3.1439, longitude: -58.4442},
  tefe: {latitude: -3.3684, longitude: -64.7124},
  barreirinha: {latitude: -2.7869, longitude: -57.0501},
  coari: {latitude: -4.0856, longitude: -63.1416},
  maues: {latitude: -3.3714, longitude: -57.7189},
  tabatinga: {latitude: -4.255, longitude: -69.9327},
  labrea: {latitude: -7.2592, longitude: -64.7986},
  humaita: {latitude: -7.5057, longitude: -63.0173},
  'benjamin constant': {latitude: -4.3759, longitude: -70.0339},
  'sao gabriel da cachoeira': {latitude: -0.1303, longitude: -67.0892},
  borba: {latitude: -4.384, longitude: -59.5875},
  autazes: {latitude: -3.5777, longitude: -59.1301},
  'nova olinda do norte': {latitude: -3.8847, longitude: -59.0906},
  'presidente figueiredo': {latitude: -2.0227, longitude: -60.0249},
  iranduba: {latitude: -3.2819, longitude: -60.1879},
  manacapuru: {latitude: -3.2998, longitude: -60.6217},
  careiro: {latitude: -3.3521, longitude: -59.7445},
  anori: {latitude: -3.7697, longitude: -61.6447},
  'fonte boa': {latitude: -2.5233, longitude: -66.0928},
  manicore: {latitude: -5.8105, longitude: -61.3024},
  alvaraes: {latitude: -3.2136, longitude: -64.8067},
  beruri: {latitude: -3.9005, longitude: -61.3527},
};

export function getCityCoords(city?: string | null): {
  latitude: number;
  longitude: number;
} {
  if (!city) {
    return FALLBACK_COORDS;
  }

  const key = city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s*[-–]\s*(am|pa)\.?\s*$/i, '')
    .trim();

  return CITY_COORDS[key] ?? FALLBACK_COORDS;
}

export function parseCoord(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.').trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function normalizeCoords(
  lat: unknown,
  lng: unknown,
  fallback: {latitude: number; longitude: number},
) {
  return {
    latitude: parseCoord(lat, fallback.latitude),
    longitude: parseCoord(lng, fallback.longitude),
  };
}

export function getTrackingStatusLabel(status: TrackingStatus): string {
  switch (status) {
    case 'scheduled':
      return 'Aguardando Partida';
    case 'boarding':
      return 'Embarque em Andamento';
    case 'in_transit':
      return 'Em Transito';
    case 'approaching':
      return 'Chegando ao Destino';
    case 'arrived':
      return 'Chegou ao Destino';
    case 'cancelled':
      return 'Viagem Cancelada';
  }
}

export function getTrackingStatusColor(
  status: TrackingStatus,
): 'success' | 'warning' | 'danger' | 'primary' {
  switch (status) {
    case 'scheduled':
      return 'primary';
    case 'boarding':
      return 'warning';
    case 'in_transit':
    case 'approaching':
    case 'arrived':
      return 'success';
    case 'cancelled':
      return 'danger';
  }
}

export function getTrackingStatusBgColor(
  status: TrackingStatus,
): 'primaryBg' | 'warningBg' | 'dangerBg' | 'successBg' {
  switch (status) {
    case 'scheduled':
      return 'primaryBg';
    case 'boarding':
      return 'warningBg';
    case 'in_transit':
    case 'approaching':
    case 'arrived':
      return 'successBg';
    case 'cancelled':
      return 'dangerBg';
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
