import {gamificationAPI} from './gamificationAPI';
import {GamificationStats, GamificationTransaction, LeaderboardEntry} from './gamificationTypes';

async function getStats(): Promise<GamificationStats> {
  return gamificationAPI.getStats();
}

async function getHistory(page = 1, limit = 20): Promise<GamificationTransaction[]> {
  const response = await gamificationAPI.getHistory(page, limit);
  return response.data.map(item => ({
    id: item.id,
    action: item.action,
    points: Math.abs(item.points),
    description: item.description,
    createdAt: item.createdAt,
    type: item.points >= 0 ? 'earned' : 'spent',
  }));
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

export const gamificationService = {
  getStats,
  getHistory,
  getLeaderboard,
};
