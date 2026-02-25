import {gamificationAPI} from './gamificationAPI';
import {GamificationStats, GamificationTransaction, LeaderboardEntry} from './gamificationTypes';

async function getStats(): Promise<GamificationStats> {
  return gamificationAPI.getStats();
}

async function getHistory(page = 1, limit = 20): Promise<GamificationTransaction[]> {
  return gamificationAPI.getHistory(page, limit);
}

async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  return gamificationAPI.getLeaderboard(limit);
}

export const gamificationService = {
  getStats,
  getHistory,
  getLeaderboard,
};
