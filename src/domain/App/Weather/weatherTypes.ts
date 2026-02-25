/**
 * Weather Types
 * Sistema de clima em tempo real usando OpenWeatherMap
 */

// ========== CURRENT WEATHER ==========

export interface CurrentWeather {
  temperature: number; // Celsius
  feelsLike: number; // Sensação térmica
  condition: string; // "Ensolarado", "Nublado", "Chuva", etc.
  conditionCode: string; // Código OpenWeather (ex: "01d")
  description: string; // Descrição detalhada
  humidity: number; // % umidade
  pressure: number; // hPa pressão atmosférica
  windSpeed: number; // m/s velocidade do vento
  windDirection: number; // graus (0-360)
  cloudiness: number; // % cobertura de nuvens
  visibility: number; // metros
  sunrise: string; // ISO timestamp
  sunset: string; // ISO timestamp
  timestamp: string; // ISO timestamp da leitura
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  isSafeForNavigation: boolean;
  safetyWarnings: string[];
  icon: string; // Código do ícone (ex: "01d")
}

// ========== WEATHER FORECAST ==========

export interface WeatherForecastDay {
  date: string; // ISO date
  tempMin: number;
  tempMax: number;
  tempAvg: number;
  condition: string;
  conditionCode: string;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number; // mm de chuva
  precipitationProbability: number; // % probabilidade
  cloudiness: number;
  icon: string;
  isSafeForNavigation: boolean;
  safetyWarnings: string[];
}

export interface WeatherForecast {
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  forecast: WeatherForecastDay[];
  generatedAt: string;
}

// ========== NAVIGATION SAFETY ==========

export enum SafetyLevel {
  SAFE = 'safe',
  CAUTION = 'caution',
  WARNING = 'warning',
  DANGER = 'danger',
}

export interface NavigationSafetyAssessment {
  level: SafetyLevel;
  score: number; // 0-100 (100 = muito seguro)
  isSafe: boolean;
  canDepart: boolean;
  warnings: string[];
  recommendations: string[];
  weather: CurrentWeather;
  assessedAt: string;
}

// ========== WEATHER ALERTS ==========

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  SEVERE = 'severe',
  EXTREME = 'extreme',
}

export interface WeatherAlert {
  id: string;
  severity: AlertSeverity;
  event: string; // "Tempestade", "Ventos Fortes", etc.
  headline: string;
  description: string;
  start: string; // ISO timestamp
  end: string; // ISO timestamp
  regions: string[];
}

// ========== REGION WEATHER ==========

export type Region =
  | 'manaus'
  | 'parintins'
  | 'tefe'
  | 'coari'
  | 'tabatinga'
  | 'benjamin-constant'
  | 'fonte-boa'
  | 'humaita'
  | 'manicore'
  | 'borba'
  | 'nova-olinda-do-norte'
  | 'beruri';

export const REGION_COORDINATES: Record<
  Region,
  {name: string; lat: number; lng: number}
> = {
  manaus: {name: 'Manaus', lat: -3.119, lng: -60.0217},
  parintins: {name: 'Parintins', lat: -2.6289, lng: -56.7358},
  tefe: {name: 'Tefé', lat: -3.3528, lng: -64.7103},
  coari: {name: 'Coari', lat: -4.085, lng: -63.1414},
  tabatinga: {name: 'Tabatinga', lat: -4.2408, lng: -69.9358},
  'benjamin-constant': {
    name: 'Benjamin Constant',
    lat: -4.3831,
    lng: -70.0317,
  },
  'fonte-boa': {name: 'Fonte Boa', lat: -2.5142, lng: -66.0833},
  humaita: {name: 'Humaitá', lat: -7.5028, lng: -63.0219},
  manicore: {name: 'Manicoré', lat: -5.8092, lng: -61.3003},
  borba: {name: 'Borba', lat: -4.3886, lng: -59.5939},
  'nova-olinda-do-norte': {
    name: 'Nova Olinda do Norte',
    lat: -3.9028,
    lng: -59.0989,
  },
  beruri: {name: 'Beruri', lat: -3.8783, lng: -61.3706},
};

// ========== WEATHER ICON MAPPING ==========

export const WEATHER_ICON_MAP: Record<string, {emoji: string; name: string}> = {
  // Dia
  '01d': {emoji: '☀️', name: 'Ensolarado'},
  '02d': {emoji: '⛅', name: 'Parcialmente Nublado'},
  '03d': {emoji: '☁️', name: 'Nublado'},
  '04d': {emoji: '☁️', name: 'Muito Nublado'},
  '09d': {emoji: '🌧️', name: 'Chuva'},
  '10d': {emoji: '🌦️', name: 'Chuva com Sol'},
  '11d': {emoji: '⛈️', name: 'Tempestade'},
  '13d': {emoji: '❄️', name: 'Neve'},
  '50d': {emoji: '🌫️', name: 'Neblina'},

  // Noite
  '01n': {emoji: '🌙', name: 'Céu Limpo'},
  '02n': {emoji: '☁️', name: 'Parcialmente Nublado'},
  '03n': {emoji: '☁️', name: 'Nublado'},
  '04n': {emoji: '☁️', name: 'Muito Nublado'},
  '09n': {emoji: '🌧️', name: 'Chuva'},
  '10n': {emoji: '🌧️', name: 'Chuva'},
  '11n': {emoji: '⛈️', name: 'Tempestade'},
  '13n': {emoji: '❄️', name: 'Neve'},
  '50n': {emoji: '🌫️', name: 'Neblina'},
};

// ========== SAFETY LEVEL CONFIGS ==========

export interface SafetyLevelConfig {
  level: SafetyLevel;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

export const SAFETY_LEVEL_CONFIGS: Record<SafetyLevel, SafetyLevelConfig> = {
  [SafetyLevel.SAFE]: {
    level: SafetyLevel.SAFE,
    label: 'Seguro',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: 'check-circle',
    description: 'Condições ideais para navegação',
  },
  [SafetyLevel.CAUTION]: {
    level: SafetyLevel.CAUTION,
    label: 'Atenção',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'warning',
    description: 'Navegação possível com cautela',
  },
  [SafetyLevel.WARNING]: {
    level: SafetyLevel.WARNING,
    label: 'Alerta',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    icon: 'error',
    description: 'Condições adversas - evite se possível',
  },
  [SafetyLevel.DANGER]: {
    level: SafetyLevel.DANGER,
    label: 'Perigo',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: 'dangerous',
    description: 'Navegação extremamente perigosa',
  },
};

// ========== RIVER LEVELS ==========

export type RiverLevelStatus =
  | 'low'
  | 'normal'
  | 'attention'
  | 'alert'
  | 'emergency'
  | 'unknown';

export interface RiverLevel {
  station: string;       // "Manaus"
  stationCode: string;   // "14100000"
  river: string;         // "Rio Negro"
  levelCm: number | null;
  levelStatus: RiverLevelStatus;
  recordedAt: string;    // "25/02/2026 06:00:00"
  source: string;        // "ANA"
}

export interface RiverLevelStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

export const RIVER_LEVEL_STATUS_CONFIGS: Record<RiverLevelStatus, RiverLevelStatusConfig> = {
  low:       {label: 'Baixo',      color: '#B45309', bgColor: '#FEF3C7', description: 'Rio baixo — risco de encalhe'},
  normal:    {label: 'Normal',     color: '#059669', bgColor: '#D1FAE5', description: 'Navegação normal'},
  attention: {label: 'Atenção',    color: '#D97706', bgColor: '#FEF3C7', description: 'Nível de atenção'},
  alert:     {label: 'Alerta',     color: '#EA580C', bgColor: '#FFEDD5', description: 'Alerta — obstáculos submersos'},
  emergency: {label: 'Emergência', color: '#DC2626', bgColor: '#FEE2E2', description: 'Emergência — navegação restrita'},
  unknown:   {label: 'Desconhecido', color: '#6B7280', bgColor: '#F3F4F6', description: 'Dado indisponível'},
};

// ========== TRIP WEATHER ==========

export interface TripWeather {
  tripId: string;
  origin: string;
  destination: string;
  departureAt: string;
  weather: CurrentWeather;
  isSafeForNavigation: boolean;
  safetyScore: number; // 0-100
  warnings: string[];
  recommendations: string[];
}

// ========== HELPER FUNCTIONS ==========

export function getWeatherIcon(iconCode: string): {emoji: string; name: string} {
  return (
    WEATHER_ICON_MAP[iconCode] || {emoji: '🌤️', name: 'Clima Desconhecido'}
  );
}

export function getSafetyLevelConfig(
  level: SafetyLevel,
): SafetyLevelConfig {
  return SAFETY_LEVEL_CONFIGS[level];
}

export function getRegionCoordinates(
  region: Region,
): {name: string; lat: number; lng: number} {
  return REGION_COORDINATES[region];
}

export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`;
}

export function formatWindSpeed(speed: number): string {
  const kmh = (speed * 3.6).toFixed(1);
  return `${kmh} km/h`;
}

export function formatWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function formatVisibility(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}
