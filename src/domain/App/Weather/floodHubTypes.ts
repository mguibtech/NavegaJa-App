// Google Flood Forecasting API — Types
// https://developers.google.com/flood-forecasting/rest
//
// Severity values retornados pelo backend (normalizados do Google):
//   NO_FLOODING  → sem risco
//   ABOVE_NORMAL → atenção
//   SEVERE       → alerta
//   EXTREME      → perigo extremo

export type FloodSeverity = 'NO_FLOODING' | 'ABOVE_NORMAL' | 'SEVERE' | 'EXTREME';
export type FloodTrend = 'RISING' | 'FALLING' | 'STEADY';
export type FloodSource = 'flood_hub' | 'mock';

export interface FloodGauge {
  gaugeId: string;
  siteName: string;
  river: string;
  countryCode: string;
  location: {latitude: number; longitude: number};
  qualityVerified: boolean;
  hasModel: boolean;
  source: string;
}

export interface FloodStatus {
  gaugeId: string;
  gaugeLocation: {latitude: number; longitude: number};
  issuedTime: string;        // ISO 8601
  severity: FloodSeverity;
  forecastTrend: FloodTrend;
  forecastChange: number;    // variação em metros prevista
  qualityVerified: boolean;
  // campos enriquecidos (join com gauge)
  siteName?: string;
  river?: string;
}

export interface FloodGaugeThresholds {
  warningLevel: number | null;      // metros
  dangerLevel: number | null;       // metros
  extremeDangerLevel: number | null; // metros
  valueUnit: 'METERS' | 'CUBIC_METERS_PER_SECOND';
}

export interface FloodGaugeModel {
  gaugeId: string;
  modelId: string;
  thresholds: FloodGaugeThresholds;
  qualityVerified: boolean;
  source: FloodSource;
}

export interface FloodForecastData {
  statuses: FloodStatus[];   // estações COM algum nível (inclusive NO_FLOODING)
  gauges: FloodGauge[];      // todas as estações da região
  lastUpdated: string;
  source: FloodSource;       // 'flood_hub' | 'mock'
}

// ─── Config de UI por severity ────────────────────────────────────────────────

export const FLOOD_SEVERITY_CONFIG: Record<
  FloodSeverity,
  {label: string; color: string; bgColor: string; iconName: string; description: string}
> = {
  NO_FLOODING: {
    label: 'Normal',
    color: '#16A34A',
    bgColor: '#DCFCE7',
    iconName: 'check-circle',
    description: 'Nível normal. Navegação sem riscos de cheia.',
  },
  ABOVE_NORMAL: {
    label: 'Atenção',
    color: '#D97706',
    bgColor: '#FEF3C7',
    iconName: 'visibility',
    description: 'Nível acima do normal. Acompanhe as condições antes de partir.',
  },
  SEVERE: {
    label: 'Alerta de Cheia',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    iconName: 'warning',
    description: 'Cheia significativa. Tome precauções e evite áreas de risco.',
  },
  EXTREME: {
    label: 'Emergência',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    iconName: 'crisis-alt',
    description: 'Cheia extrema. Navegação de alto risco — verifique com autoridades.',
  },
};

export const FLOOD_TREND_CONFIG: Record<
  FloodTrend,
  {label: string; color: string; iconName: string}
> = {
  RISING:  {label: 'Subindo',  color: '#DC2626', iconName: 'trending-up'},
  FALLING: {label: 'Descendo', color: '#16A34A', iconName: 'trending-down'},
  STEADY:  {label: 'Estável',  color: '#6B7280', iconName: 'trending-flat'},
};

// Ordena: EXTREME > SEVERE > ABOVE_NORMAL > NO_FLOODING
export const FLOOD_SEVERITY_ORDER: Record<FloodSeverity, number> = {
  EXTREME: 0,
  SEVERE: 1,
  ABOVE_NORMAL: 2,
  NO_FLOODING: 3,
};

// Severities que indicam risco real (usados para banners/alertas)
export const FLOOD_RISK_SEVERITIES: FloodSeverity[] = ['ABOVE_NORMAL', 'SEVERE', 'EXTREME'];

// ─── Inundation Polygons ───────────────────────────────────────────────────────

export type FloodRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface FloodInundationPolygon {
  id: string;
  risk: FloodRiskLevel;
  coordinates: {latitude: number; longitude: number}[];
}

export interface FloodInundationData {
  polygons: FloodInundationPolygon[];
  source: FloodSource;
  lastUpdated: string;
}

export const RISK_FILL: Record<FloodRiskLevel, string> = {
  HIGH:   'rgba(220, 38, 38, 0.25)',
  MEDIUM: 'rgba(245, 158, 11, 0.20)',
  LOW:    'rgba(234, 179,  8, 0.15)',
};

export const RISK_STROKE: Record<FloodRiskLevel, string> = {
  HIGH:   'rgba(220, 38, 38, 0.70)',
  MEDIUM: 'rgba(245, 158, 11, 0.65)',
  LOW:    'rgba(234, 179,  8, 0.60)',
};
