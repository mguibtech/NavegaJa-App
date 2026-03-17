import {useState, useCallback} from 'react';
import {Clipboard, Share} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  getGamificationHistoryCategory,
  getGamificationTransactionIcon,
  useGamificationStats,
  useGamificationHistory,
  useLeaderboard,
} from '@domain';
import {useAuthStore} from '@store';

import {AppStackParamList} from '@routes';

export type ActiveTab = 'history' | 'leaderboard';
export type HistoryFilter = 'all' | 'trip' | 'delivery' | 'review' | 'referral' | 'bonus';

export const HISTORY_FILTER_CONFIG: Record<HistoryFilter, {label: string; icon: string}> = {
  all: {label: 'Todos', icon: 'list'},
  trip: {label: 'Viagens', icon: 'directions-boat'},
  delivery: {label: 'Entregas', icon: 'local-shipping'},
  review: {label: 'Avaliações', icon: 'star'},
  referral: {label: 'Indicações', icon: 'person-add'},
  bonus: {label: 'Bônus', icon: 'card-giftcard'},
};

export const LEVEL_THRESHOLDS: Record<string, number> = {
  Marinheiro: 0,
  Navegador: 100,
  'Capitão': 500,
  Capitao: 500,
  Almirante: 1500,
};

export const LEVEL_INFO = [
  {level: 'Marinheiro', points: 0, discount: 0, icon: 'anchor'},
  {level: 'Navegador', points: 100, discount: 5, icon: 'explore'},
  {level: 'Capitão', points: 500, discount: 10, icon: 'directions-boat'},
  {level: 'Almirante', points: 1500, discount: 15, icon: 'military-tech'},
] as const;

export function getLevelColor(level: string | undefined | null): 'textSecondary' | 'primary' | 'secondary' | 'warning' {
  if (level === 'Navegador') return 'primary';
  if (level === 'Capitao' || level === 'Capitão') return 'secondary';
  if (level === 'Almirante') return 'warning';
  return 'textSecondary';
}

export const getTransactionIcon = getGamificationTransactionIcon;

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function calcProgressPercent(totalPoints: number, level: string, pointsNeeded: number): number {
  const currentThreshold = LEVEL_THRESHOLDS[level] ?? 0;
  const nextThreshold = totalPoints + pointsNeeded;
  const range = nextThreshold - currentThreshold;
  if (range <= 0) return 100;
  return Math.min(((totalPoints - currentThreshold) / range) * 100, 100);
}

export function useGamificationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {user} = useAuthStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('history');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [copiedCode, setCopiedCode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {stats, isLoading: statsLoading, fetchStats} = useGamificationStats();
  const {
    history,
    isLoading: historyLoading,
    isLoadingMore,
    error: historyError,
    hasMore,
    fetchHistory,
    fetchMoreHistory,
  } = useGamificationHistory();
  const {leaderboard, isLoading: leaderboardLoading, fetchLeaderboard} = useLeaderboard();

  useFocusEffect(
    useCallback(() => {
      fetchStats().catch(() => {});
      fetchHistory().catch(() => {});
      fetchLeaderboard().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([
      fetchStats().catch(() => {}),
      fetchHistory().catch(() => {}),
      fetchLeaderboard().catch(() => {}),
    ]);
    setRefreshing(false);
  }

  const points = stats?.totalPoints ?? user?.totalPoints ?? 0;
  const level = stats?.level ?? user?.level ?? 'Marinheiro';
  const discount = stats?.discount ?? 0;
  const referralCode = stats?.referralCode ?? null;
  const nextLevel = stats?.nextLevel ?? null;

  const progressPercent = nextLevel
    ? calcProgressPercent(points, level, nextLevel.pointsNeeded)
    : 100;

  const filteredHistory = historyFilter === 'all'
    ? history
    : history.filter(item => getGamificationHistoryCategory(item.action) === historyFilter);

  const myLeaderboardPosition = leaderboard.find(entry => entry.userId === user?.id);

  function handleCopyCode() {
    if (referralCode) {
      Clipboard.setString(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  }

  async function handleShareCode() {
    if (!referralCode) return;
    try {
      await Share.share({
        message: `Use meu código de indicação no NavegaJá e ganhe pontos! Código: ${referralCode}`,
        title: 'Indicação NavegaJá',
      });
    } catch {
      // User cancelled or share failed.
    }
  }

  return {
    navigation,
    user,
    activeTab,
    setActiveTab,
    historyFilter,
    setHistoryFilter,
    copiedCode,
    refreshing,
    statsLoading,
    historyLoading,
    isLoadingMore,
    historyError,
    hasMore,
    leaderboardLoading,
    history: filteredHistory,
    leaderboard,
    myLeaderboardPosition,
    points,
    level,
    discount,
    referralCode,
    nextLevel,
    progressPercent,
    onRefresh,
    handleCopyCode,
    handleShareCode,
    fetchHistory,
    fetchMoreHistory,
  };
}
