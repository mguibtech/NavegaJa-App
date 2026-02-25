import {useState, useCallback} from 'react';
import {Clipboard, Share} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  useGamificationStats,
  useGamificationHistory,
  useLeaderboard,
} from '@domain';
import {useAuthStore} from '@store';

import {AppStackParamList} from '@routes';

export type ActiveTab = 'history' | 'leaderboard';

export const LEVEL_THRESHOLDS: Record<string, number> = {
  Marinheiro: 0,
  Navegador: 100,
  Capitão: 500,
  Almirante: 1500,
};

export function getLevelColor(level: string | undefined | null): 'textSecondary' | 'primary' | 'secondary' | 'warning' {
  if (level === 'Navegador') return 'primary';
  if (level === 'Capitão') return 'secondary';
  if (level === 'Almirante') return 'warning';
  return 'textSecondary';
}

export function getTransactionIcon(action: string | undefined | null): string {
  if (!action) return 'monetization-on';
  if (action.includes('trip') || action.includes('viagem')) return 'directions-boat';
  if (action.includes('review') || action.includes('avali')) return 'star';
  if (action.includes('shipment') || action.includes('entrega')) return 'local-shipping';
  if (action.includes('referral') || action.includes('indica')) return 'person-add';
  if (action.includes('bonus') || action.includes('promo')) return 'card-giftcard';
  if (action.includes('spent') || action.includes('usado')) return 'remove-circle';
  return 'monetization-on';
}

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
      // user cancelled or error — ignore
    }
  }

  return {
    navigation,
    user,
    activeTab,
    setActiveTab,
    copiedCode,
    refreshing,
    statsLoading,
    historyLoading,
    isLoadingMore,
    historyError,
    hasMore,
    leaderboardLoading,
    history,
    leaderboard,
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
