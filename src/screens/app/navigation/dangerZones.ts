/**
 * Static danger zones for Amazon river navigation.
 * In production, these would come from the backend API.
 */

export interface DangerZone {
  id: string;
  name: string;
  description: string;
  center: {latitude: number; longitude: number};
  radiusM: number;
  severity: 'low' | 'medium' | 'high';
  type: 'sandbank' | 'rapids' | 'restricted' | 'shallow' | 'current';
}

export const AMAZON_DANGER_ZONES: DangerZone[] = [
  {
    id: 'dz-encontro-aguas',
    name: 'Encontro das Águas',
    description:
      'Turbulência onde Rio Negro e Rio Solimões se encontram. Atenção às correntes cruzadas.',
    center: {latitude: -3.1656, longitude: -59.8961},
    radiusM: 8000,
    severity: 'medium',
    type: 'current',
  },
  {
    id: 'dz-parintins-areia',
    name: 'Banco de Areia — Parintins',
    description:
      'Banco de areia na entrada de Parintins em período de seca. Prefira o canal norte.',
    center: {latitude: -2.62, longitude: -56.75},
    radiusM: 4000,
    severity: 'medium',
    type: 'sandbank',
  },
  {
    id: 'dz-itacoatiara-raso',
    name: 'Área Rasa — Itacoatiara',
    description:
      'Trecho raso próximo a Itacoatiara. Embarcações de grande calado devem evitar.',
    center: {latitude: -3.14, longitude: -58.43},
    radiusM: 3000,
    severity: 'low',
    type: 'shallow',
  },
  {
    id: 'dz-coari-corrente',
    name: 'Correnteza Forte — Coari',
    description:
      'Corrente forte na altura de Coari durante cheia. Reduza velocidade e mantenha o canal.',
    center: {latitude: -4.09, longitude: -63.15},
    radiusM: 5000,
    severity: 'high',
    type: 'current',
  },
  {
    id: 'dz-tefe-lago',
    name: 'Entrada Lago de Tefé',
    description:
      'Trecho raso na entrada do lago de Tefé. Navegue pelo canal sinalizado.',
    center: {latitude: -3.36, longitude: -64.72},
    radiusM: 3500,
    severity: 'medium',
    type: 'shallow',
  },
  {
    id: 'dz-manaus-porto',
    name: 'Área Portuária — Manaus',
    description:
      'Tráfego intenso de embarcações de grande porte. Reduza velocidade e sinalize.',
    center: {latitude: -3.135, longitude: -60.013},
    radiusM: 2500,
    severity: 'medium',
    type: 'restricted',
  },
  {
    id: 'dz-borba-raso',
    name: 'Canal Raso — Borba',
    description:
      'Canal estreito e raso próximo a Borba em período de seca. Aguarde maré favorável.',
    center: {latitude: -4.39, longitude: -59.59},
    radiusM: 2000,
    severity: 'low',
    type: 'shallow',
  },
  {
    id: 'dz-beruri-corrente',
    name: 'Correnteza — Beruri',
    description:
      'Correnteza moderada no trecho próximo a Beruri. Navegue pelo canal central.',
    center: {latitude: -3.878, longitude: -61.37},
    radiusM: 3000,
    severity: 'low',
    type: 'current',
  },
];

export const DANGER_ZONE_FILL: Record<DangerZone['severity'], string> = {
  low: 'rgba(251,191,36,0.12)',
  medium: 'rgba(239,68,68,0.12)',
  high: 'rgba(127,29,29,0.18)',
};

export const DANGER_ZONE_STROKE: Record<DangerZone['severity'], string> = {
  low: 'rgba(251,191,36,0.55)',
  medium: 'rgba(239,68,68,0.55)',
  high: 'rgba(127,29,29,0.75)',
};

export const DANGER_ZONE_COLOR: Record<DangerZone['severity'], string> = {
  low: '#FBBF24',
  medium: '#EF4444',
  high: '#7F1D1D',
};

export const DANGER_ZONE_ICON: Record<DangerZone['type'], string> = {
  sandbank: 'terrain',
  rapids: 'waves',
  restricted: 'block',
  shallow: 'water',
  current: 'air',
};
