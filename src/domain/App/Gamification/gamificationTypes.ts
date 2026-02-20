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

export interface GamificationTransaction {
  id: string;
  type: 'earned' | 'spent';
  points: number;
  description: string;
  action: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string | null;
  level: string;
  totalPoints: number;
}
