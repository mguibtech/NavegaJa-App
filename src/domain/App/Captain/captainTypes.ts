export interface Payment {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export interface EarningsResponse {
  totalPending: number;
  totalReceived: number;
  payments: Payment[];
}

export interface AdvancePaymentResponse {
  success: boolean;
}

// ─── Safety Checklist ─────────────────────────────────────────────────────

export interface CaptainChecklist {
  id: string;
  tripId: string;
  lifeJacketsAvailable: boolean;
  lifeJacketsCount: number;
  fireExtinguisherCheck: boolean;
  weatherConditionsOk: boolean;
  weatherCondition: string;
  boatConditionGood: boolean;
  emergencyEquipmentCheck: boolean;
  navigationLightsWorking: boolean;
  maxCapacityRespected: boolean;
  passengersOnBoard: number;
  maxCapacity: number;
  observations?: string;
  allItemsChecked: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface UpdateChecklistData {
  lifeJacketsAvailable?: boolean;
  lifeJacketsCount?: number;
  fireExtinguisherCheck?: boolean;
  weatherConditionsOk?: boolean;
  weatherCondition?: string;
  boatConditionGood?: boolean;
  emergencyEquipmentCheck?: boolean;
  navigationLightsWorking?: boolean;
  maxCapacityRespected?: boolean;
  passengersOnBoard?: number;
  maxCapacity?: number;
  observations?: string;
}

export interface CaptainChecklistStatusResponse {
  tripId: string;
  checklistComplete: boolean;
}

// ─── Weather Safety ───────────────────────────────────────────────────────

export interface WeatherSafetyResponse {
  isSafe: boolean;
  safetyScore: number;
  recommendation: string;
  conditions: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    condition?: string;
  };
}
