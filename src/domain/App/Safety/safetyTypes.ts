/**
 * Safety System Types
 * Sistema de segurança para navegação fluvial
 */

// ========== EMERGENCY CONTACTS ==========

export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  description?: string;
  icon: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// ========== SAFETY CHECKLIST ==========

export enum ChecklistStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  INCOMPLETE = 'incomplete',
}

export interface SafetyChecklistItem {
  id: string;
  description: string;
  checked: boolean;
  required: boolean;
}

export interface SafetyChecklist {
  id: string;
  tripId: string;
  captainId: string;
  status: ChecklistStatus;
  items: SafetyChecklistItem[];
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSafetyChecklistData {
  tripId: string;
  items: Array<{description: string; checked: boolean; required: boolean}>;
  notes?: string;
}

export interface UpdateSafetyChecklistData {
  items?: Array<{id?: string; description: string; checked: boolean; required: boolean}>;
  notes?: string;
  status?: ChecklistStatus;
}

export interface ChecklistStatusResponse {
  canDepart: boolean;
  checklist: SafetyChecklist | null;
  reason?: string;
}

// ========== SOS ALERTS ==========

export enum SosType {
  GENERAL = 'general',
  MEDICAL = 'medical',
  FIRE = 'fire',
  SINKING = 'sinking',
  MECHANICAL = 'mechanical',
  WEATHER = 'weather',
  ACCIDENT = 'accident',
}

export enum SosStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

export interface SosLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface SosAlert {
  id: string;
  userId: string;
  tripId?: string;
  type: SosType;
  status: SosStatus;
  location: SosLocation;
  description?: string;
  contactNumber?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    phone?: string;
  };
  trip?: {
    id: string;
    origin: string;
    destination: string;
    boatName?: string;
  };
}

export interface CreateSosAlertData {
  type: SosType;
  tripId?: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  description?: string;
  contactNumber?: string;
}

export interface ResolveSosAlertData {
  notes?: string;
}

// ========== SOS TYPE CONFIGS ==========

export interface SosTypeConfig {
  type: SosType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  priority: 'critical' | 'high' | 'medium';
}

export const SOS_TYPE_CONFIGS: Record<SosType, SosTypeConfig> = {
  [SosType.GENERAL]: {
    type: SosType.GENERAL,
    label: 'Emergência Geral',
    description: 'Situação de emergência não especificada',
    icon: 'error',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    priority: 'high',
  },
  [SosType.MEDICAL]: {
    type: SosType.MEDICAL,
    label: 'Emergência Médica',
    description: 'Pessoa ferida ou doente que precisa de atendimento urgente',
    icon: 'local-hospital',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    priority: 'critical',
  },
  [SosType.FIRE]: {
    type: SosType.FIRE,
    label: 'Incêndio',
    description: 'Fogo a bordo da embarcação',
    icon: 'local-fire-department',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    priority: 'critical',
  },
  [SosType.SINKING]: {
    type: SosType.SINKING,
    label: 'Vazamento/Naufrágio',
    description: 'Embarcação com entrada de água ou afundando',
    icon: 'water-damage',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    priority: 'critical',
  },
  [SosType.MECHANICAL]: {
    type: SosType.MECHANICAL,
    label: 'Problema Mecânico',
    description: 'Falha no motor ou sistemas da embarcação',
    icon: 'build',
    color: '#D97706',
    bgColor: '#FEF3C7',
    priority: 'medium',
  },
  [SosType.WEATHER]: {
    type: SosType.WEATHER,
    label: 'Condições Climáticas',
    description: 'Tempo perigoso (tempestade, ventos fortes)',
    icon: 'thunderstorm',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    priority: 'high',
  },
  [SosType.ACCIDENT]: {
    type: SosType.ACCIDENT,
    label: 'Acidente',
    description: 'Colisão ou outro tipo de acidente',
    icon: 'warning',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    priority: 'critical',
  },
};

// ========== DEFAULT CHECKLIST ITEMS ==========

export const DEFAULT_CHECKLIST_ITEMS: Array<{
  description: string;
  required: boolean;
}> = [
  {
    description: 'Coletes salva-vidas em quantidade suficiente para todos os passageiros',
    required: true,
  },
  {
    description: 'Extintor de incêndio verificado e dentro do prazo de validade',
    required: true,
  },
  {
    description: 'Condições climáticas favoráveis para a viagem',
    required: true,
  },
  {
    description: 'Embarcação em boas condições estruturais',
    required: true,
  },
  {
    description: 'Equipamentos de emergência funcionando (rádio, sinalizadores)',
    required: true,
  },
  {
    description: 'Luzes de navegação funcionando',
    required: true,
  },
  {
    description: 'Capacidade máxima de passageiros e carga respeitada',
    required: true,
  },
  {
    description: 'Documentação da embarcação em dia',
    required: false,
  },
  {
    description: 'Kit de primeiros socorros completo',
    required: false,
  },
  {
    description: 'Combustível suficiente para a viagem',
    required: true,
  },
];
