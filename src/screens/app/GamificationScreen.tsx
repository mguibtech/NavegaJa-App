import React, {useState, useCallback} from 'react';
import {FlatList, ActivityIndicator, Clipboard, Share, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox, UserAvatar} from '@components';
import {
  useGamificationStats,
  useGamificationHistory,
  useLeaderboard,
  GamificationTransaction,
  LeaderboardEntry,
} from '@domain';
import {useAuthStore} from '@store';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'Gamification'>;

type ActiveTab = 'history' | 'leaderboard';

// Limiares de pontos por nível (conforme backend)
const LEVEL_THRESHOLDS: Record<string, number> = {
  Marinheiro: 0,
  Navegador: 100,
  Capitão: 500,
  Almirante: 1500,
};

function getLevelColor(level: string): 'textSecondary' | 'primary' | 'secondary' | 'warning' {
  if (level === 'Navegador') return 'primary';
  if (level === 'Capitão') return 'secondary';
  if (level === 'Almirante') return 'warning';
  return 'textSecondary';
}

function getTransactionIcon(action: string): string {
  if (action.includes('trip') || action.includes('viagem')) return 'directions-boat';
  if (action.includes('review') || action.includes('avali')) return 'star';
  if (action.includes('shipment') || action.includes('entrega')) return 'local-shipping';
  if (action.includes('referral') || action.includes('indica')) return 'person-add';
  if (action.includes('bonus') || action.includes('promo')) return 'card-giftcard';
  if (action.includes('spent') || action.includes('usado')) return 'remove-circle';
  return 'monetization-on';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function calcProgressPercent(totalPoints: number, level: string, pointsNeeded: number): number {
  const currentThreshold = LEVEL_THRESHOLDS[level] ?? 0;
  const nextThreshold = totalPoints + pointsNeeded;
  const range = nextThreshold - currentThreshold;
  if (range <= 0) return 100;
  return Math.min(((totalPoints - currentThreshold) / range) * 100, 100);
}

export function GamificationScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const {user} = useAuthStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('history');
  const [copiedCode, setCopiedCode] = useState(false);

  const {stats, isLoading: statsLoading, fetchStats} = useGamificationStats();
  const {history, isLoading: historyLoading, fetchHistory} = useGamificationHistory();
  const {leaderboard, isLoading: leaderboardLoading, fetchLeaderboard} = useLeaderboard();

  useFocusEffect(
    useCallback(() => {
      fetchStats().catch(() => {});
      fetchHistory().catch(() => {});
      fetchLeaderboard().catch(() => {});
    }, []),
  );

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

  function renderTransaction({item}: {item: GamificationTransaction}) {
    const isEarned = item.type === 'earned';
    return (
      <Box
        backgroundColor="surface"
        flexDirection="row"
        alignItems="center"
        paddingHorizontal="s16"
        paddingVertical="s14"
        style={{borderBottomWidth: 1, borderBottomColor: '#F0F0F0'}}>
        <Box
          width={40}
          height={40}
          borderRadius="s20"
          backgroundColor={isEarned ? 'successBg' : 'dangerBg'}
          alignItems="center"
          justifyContent="center"
          mr="s12"
          style={{flexShrink: 0}}>
          <Icon
            name={getTransactionIcon(item.action)}
            size={20}
            color={isEarned ? 'success' : 'danger'}
          />
        </Box>

        <Box flex={1}>
          <Text preset="paragraphMedium" color="text" bold numberOfLines={1}>
            {item.description}
          </Text>
          <Text preset="paragraphSmall" color="textSecondary" mt="s4">
            {formatDate(item.createdAt)}
          </Text>
        </Box>

        <Text
          preset="paragraphMedium"
          bold
          style={{color: isEarned ? '#22C55E' : '#EF4444'}}>
          {isEarned ? '+' : '-'}{item.points} pts
        </Text>
      </Box>
    );
  }

  function renderLeaderboardItem({item}: {item: LeaderboardEntry}) {
    const isCurrentUser = item.userId === user?.id;
    const levelColor = getLevelColor(item.level);
    const medalIcons: Record<number, string> = {1: 'emoji-events', 2: 'workspace-premium', 3: 'military-tech'};
    const medalColors: Record<number, 'warning' | 'textSecondary' | 'secondary'> = {
      1: 'warning',
      2: 'textSecondary',
      3: 'secondary',
    };

    return (
      <Box
        flexDirection="row"
        alignItems="center"
        paddingHorizontal="s16"
        paddingVertical="s14"
        backgroundColor={isCurrentUser ? 'primaryBg' : 'surface'}
        style={{borderBottomWidth: 1, borderBottomColor: '#F0F0F0'}}>
        {/* Rank */}
        <Box width={36} alignItems="center" mr="s12">
          {item.rank <= 3 ? (
            <Icon
              name={medalIcons[item.rank]}
              size={24}
              color={medalColors[item.rank] ?? 'textSecondary'}
            />
          ) : (
            <Text preset="paragraphMedium" color="textSecondary" bold>
              #{item.rank}
            </Text>
          )}
        </Box>

        {/* Avatar */}
        <Box mr="s12" style={{flexShrink: 0}}>
          <UserAvatar
            userId={item.userId}
            avatarUrl={item.avatarUrl}
            name={item.name}
            size="sm"
          />
        </Box>

        {/* Info */}
        <Box flex={1}>
          <Text
            preset="paragraphMedium"
            color={isCurrentUser ? 'primary' : 'text'}
            bold
            numberOfLines={1}>
            {item.name} {isCurrentUser ? '(você)' : ''}
          </Text>
          <Text preset="paragraphSmall" color={levelColor}>
            {item.level}
          </Text>
        </Box>

        {/* Points */}
        <Box alignItems="flex-end">
          <Text preset="paragraphMedium" color="text" bold>
            {item.totalPoints.toLocaleString('pt-BR')}
          </Text>
          <Text preset="paragraphSmall" color="textSecondary">
            NavegaCoins
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingBottom="s16"
        style={{
          paddingTop: top + 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Box flexDirection="row" alignItems="center" mb="s16">
          <TouchableOpacityBox
            width={40}
            height={40}
            borderRadius="s20"
            alignItems="center"
            justifyContent="center"
            onPress={() => navigation.goBack()}
            mr="s12">
            <Icon name="arrow-back" size={24} color="text" />
          </TouchableOpacityBox>
          <Text preset="headingSmall" color="text" bold>
            NavegaCoins
          </Text>
        </Box>

        {/* Stats Card */}
        <Box
          backgroundColor="primary"
          borderRadius="s16"
          padding="s20"
          style={{elevation: 2}}>
          {statsLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {/* Points + Level */}
              <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s12">
                <Box>
                  <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.7)'}}>
                    Seus NavegaCoins
                  </Text>
                  <Box flexDirection="row" alignItems="center" mt="s4">
                    <Icon name="stars" size={28} color="surface" />
                    <Text
                      preset="headingMedium"
                      bold
                      style={{color: '#fff', marginLeft: 8, fontSize: 28}}>
                      {points.toLocaleString('pt-BR')}
                    </Text>
                  </Box>
                </Box>

                <Box alignItems="flex-end" g="s6">
                  <Box
                    backgroundColor="surface"
                    paddingHorizontal="s12"
                    paddingVertical="s6"
                    borderRadius="s8">
                    <Text preset="paragraphSmall" color="primary" bold>
                      {level}
                    </Text>
                  </Box>
                  {discount > 0 && (
                    <Box
                      borderRadius="s8"
                      paddingHorizontal="s8"
                      paddingVertical="s4"
                      style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                      <Text preset="paragraphSmall" style={{color: '#fff'}}>
                        {discount}% desconto
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Progress bar */}
              {nextLevel && (
                <Box mb="s12">
                  <Box flexDirection="row" justifyContent="space-between" mb="s6">
                    <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.8)'}}>
                      Próximo: {nextLevel.level}
                    </Text>
                    <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.8)'}}>
                      {nextLevel.pointsNeeded} pts restantes
                    </Text>
                  </Box>
                  <Box
                    height={6}
                    borderRadius="s8"
                    style={{backgroundColor: 'rgba(255,255,255,0.25)'}}>
                    <Box
                      height={6}
                      borderRadius="s8"
                      style={{
                        backgroundColor: '#fff',
                        width: `${Math.round(progressPercent)}%`,
                      }}
                    />
                  </Box>
                  <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.6)', marginTop: 4}}>
                    {Math.round(progressPercent)}% completo • {nextLevel.discount}% desconto ao atingir
                  </Text>
                </Box>
              )}

              {!nextLevel && (
                <Box flexDirection="row" alignItems="center" mb="s12">
                  <Icon name="emoji-events" size={16} color="surface" />
                  <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.9)', marginLeft: 6}}>
                    Nível máximo atingido!
                  </Text>
                </Box>
              )}

              {/* Referral code */}
              {referralCode && (
                <Box flexDirection="row" g="s8">
                  <TouchableOpacity
                    onPress={handleCopyCode}
                    activeOpacity={0.7}
                    style={{flex: 1}}>
                    <Box
                      flex={1}
                      flexDirection="row"
                      alignItems="center"
                      borderRadius="s8"
                      paddingHorizontal="s12"
                      paddingVertical="s8"
                      style={{backgroundColor: 'rgba(255,255,255,0.15)'}}>
                      <Box flex={1}>
                        <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.7)'}}>
                          Código de indicação
                        </Text>
                        <Text preset="paragraphMedium" bold style={{color: '#fff', letterSpacing: 1}}>
                          {referralCode}
                        </Text>
                      </Box>
                      <Icon
                        name={copiedCode ? 'check' : 'content-copy'}
                        size={16}
                        color="surface"
                      />
                    </Box>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleShareCode} activeOpacity={0.7}>
                    <Box
                      width={44}
                      height={44}
                      borderRadius="s8"
                      alignItems="center"
                      justifyContent="center"
                      style={{backgroundColor: 'rgba(255,255,255,0.15)'}}>
                      <Icon name="share" size={20} color="surface" />
                    </Box>
                  </TouchableOpacity>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box
        flexDirection="row"
        backgroundColor="surface"
        paddingHorizontal="s16"
        paddingVertical="s8"
        style={{borderBottomWidth: 1, borderBottomColor: '#F0F0F0'}}>
        <TouchableOpacityBox
          flex={1}
          paddingVertical="s10"
          borderRadius="s8"
          backgroundColor={activeTab === 'history' ? 'primaryBg' : 'surface'}
          alignItems="center"
          mr="s8"
          onPress={() => setActiveTab('history')}>
          <Text
            preset="paragraphMedium"
            color={activeTab === 'history' ? 'primary' : 'textSecondary'}
            bold>
            Histórico
          </Text>
        </TouchableOpacityBox>

        <TouchableOpacityBox
          flex={1}
          paddingVertical="s10"
          borderRadius="s8"
          backgroundColor={activeTab === 'leaderboard' ? 'primaryBg' : 'surface'}
          alignItems="center"
          onPress={() => setActiveTab('leaderboard')}>
          <Text
            preset="paragraphMedium"
            color={activeTab === 'leaderboard' ? 'primary' : 'textSecondary'}
            bold>
            Ranking
          </Text>
        </TouchableOpacityBox>
      </Box>

      {/* Content */}
      {activeTab === 'history' ? (
        historyLoading ? (
          <Box flex={1} alignItems="center" justifyContent="center">
            <ActivityIndicator color="#0E7AFE" />
          </Box>
        ) : history.length === 0 ? (
          <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="s40">
            <Icon name="monetization-on" size={64} color="border" />
            <Text preset="headingSmall" color="textSecondary" mt="s16" style={{textAlign: 'center'}}>
              Nenhuma transação ainda
            </Text>
            <Text
              preset="paragraphSmall"
              color="textSecondary"
              mt="s8"
              style={{textAlign: 'center'}}>
              Complete viagens e avaliações para ganhar NavegaCoins.
            </Text>
          </Box>
        ) : (
          <FlatList
            data={history}
            keyExtractor={item => item.id}
            renderItem={renderTransaction}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 24}}
          />
        )
      ) : leaderboardLoading ? (
        <Box flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator color="#0E7AFE" />
        </Box>
      ) : leaderboard.length === 0 ? (
        <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="s40">
          <Icon name="leaderboard" size={64} color="border" />
          <Text preset="headingSmall" color="textSecondary" mt="s16" style={{textAlign: 'center'}}>
            Ranking indisponível
          </Text>
        </Box>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={item => item.userId}
          renderItem={renderLeaderboardItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 24}}
        />
      )}
    </Box>
  );
}
