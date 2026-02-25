import {api} from '@api';
import {API_ENDPOINTS} from '../../../api/config';

import {GamificationStats, GamificationTransaction, LeaderboardEntry} from './gamificationTypes';

async function getStats(): Promise<GamificationStats> {
  return api.get<GamificationStats>(API_ENDPOINTS.GAMIFICATION_STATS);
}

async function getHistory(page = 1, limit = 20): Promise<GamificationTransaction[]> {
  return api.get<GamificationTransaction[]>(
    `${API_ENDPOINTS.GAMIFICATION_HISTORY}?page=${page}&limit=${limit}`,
  );
}

async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  return api.get<LeaderboardEntry[]>(
    `${API_ENDPOINTS.GAMIFICATION_LEADERBOARD}?limit=${limit}`,
  );
}

export const gamificationAPI = {
  getStats,
  getHistory,
  getLeaderboard,
};
