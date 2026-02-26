export interface NextLevelInfo {
  level: string;
  pointsNeeded: number;
  discount: number;
}

export interface GamificationStats {
  totalPoints: number;
  level: string;
  discount: number;
  referralCode: string;
  nextLevel: NextLevelInfo | null;
}

// Raw shape returned by the API
export interface GamificationTransactionRaw {
  id: string;
  action: string;
  points: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface HistoryApiResponse {
  data: GamificationTransactionRaw[];
  total: number;
  page: number;
  lastPage: number;
}

// Normalized shape used by the UI (type derived from points sign)
export interface GamificationTransaction {
  id: string;
  type: 'earned' | 'spent';
  points: number;
  description: string;
  action: string;
  createdAt: string;
}

// Raw shape returned by the API
export interface LeaderboardEntryRaw {
  position: number;
  id: string;
  name: string;
  avatarUrl?: string | null;
  level: string;
  totalPoints: number;
}

export interface KmStats {
  totalKmTraveled: number;
  redeemableKm: number;
  kmValue: number; // R$ por km (ex: 0.05 → 1 km = R$0,05)
}

// Normalized shape used by the UI
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string | null;
  level: string;
  totalPoints: number;
}
