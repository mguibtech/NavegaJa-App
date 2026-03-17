import {gamificationAPI} from './gamificationAPI';
import {
  GamificationStats,
  GamificationTransaction,
  KmStats,
  LeaderboardEntry,
  PaginatedGamificationHistory,
} from './gamificationTypes';

async function getStats(): Promise<GamificationStats> {
  return gamificationAPI.getStats();
}

async function getHistory(page = 1, limit = 20): Promise<PaginatedGamificationHistory> {
  const response = await gamificationAPI.getHistory(page, limit);
  return {
    ...response,
    data: response.data.map<GamificationTransaction>(item => ({
      id: item.id,
      userId: item.userId,
      action: item.action,
      points: Math.abs(item.points),
      description: item.description,
      referenceId: item.referenceId,
      createdAt: item.createdAt,
      type: item.points >= 0 ? 'earned' : 'spent',
    })),
  };
}

async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const raw = await gamificationAPI.getLeaderboard(limit);
  return raw.map(item => ({
    rank: item.position,
    userId: item.id,
    name: item.name,
    avatarUrl: item.avatarUrl,
    level: item.level,
    totalPoints: item.totalPoints,
  }));
}

async function getKmStats(): Promise<KmStats> {
  return gamificationAPI.getKmStats();
}

export const gamificationService = {
  getStats,
  getHistory,
  getLeaderboard,
  getKmStats,
};
