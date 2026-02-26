import React from 'react';
import {FlatList, ActivityIndicator, TouchableOpacity, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '@shopify/restyle';

import {Box, Icon, Text, TouchableOpacityBox, UserAvatar} from '@components';
import {GamificationTransaction, LeaderboardEntry, useKmStats} from '@domain';
import {Theme} from '@theme';

import {
  useGamificationScreen,
  getLevelColor,
  getTransactionIcon,
  formatDate,
  HistoryFilter,
  HISTORY_FILTER_CONFIG,
  LEVEL_INFO,
} from './useGamificationScreen';

export function GamificationScreen() {
  const {top} = useSafeAreaInsets();
  const {colors} = useTheme<Theme>();
  const {
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
    leaderboardLoading,
    history,
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
  } = useGamificationScreen();

  const {kmStats} = useKmStats();

  function renderTransaction({item}: {item: GamificationTransaction}) {
    const isEarned = item.type === 'earned';
    return (
      <Box
        backgroundColor="surface"
        flexDirection="row"
        alignItems="center"
        paddingHorizontal="s16"
        paddingVertical="s14"
        style={{borderBottomWidth: 1, borderBottomColor: colors.border}}>
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
          color={isEarned ? 'success' : 'danger'}>
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
        style={{borderBottomWidth: 1, borderBottomColor: colors.border}}>
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

                <Box alignItems="flex-end" style={{gap: 6}}>
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

              {/* Braças */}
              <Box
                mt="s12"
                pt="s12"
                mb="s12"
                style={{borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)'}}>
                <Box flexDirection="row" alignItems="center" mb="s8">
                  <Icon name="waves" size={14} color={'rgba(255,255,255,0.7)' as any} />
                  <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.7)', marginLeft: 4}}>
                    Braças
                  </Text>
                </Box>
                <Box flexDirection="row">
                  <Box flex={1} alignItems="center">
                    <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.6)'}}>
                      Km percorridos
                    </Text>
                    <Text preset="paragraphMedium" bold style={{color: '#fff'}}>
                      {(kmStats?.totalKmTraveled ?? 0).toLocaleString('pt-BR')} km
                    </Text>
                  </Box>
                  <Box width={1} style={{backgroundColor: 'rgba(255,255,255,0.2)'}} />
                  <Box flex={1} alignItems="center">
                    <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.6)'}}>
                      Disponíveis
                    </Text>
                    <Text preset="paragraphMedium" bold style={{color: '#fff'}}>
                      {(kmStats?.redeemableKm ?? 0).toLocaleString('pt-BR')} braças
                    </Text>
                  </Box>
                </Box>
              </Box>

              {/* Referral code */}
              {referralCode && (
                <Box flexDirection="row" style={{gap: 8}}>
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
        backgroundColor="surface"
        paddingHorizontal="s16"
        paddingTop="s8"
        style={{borderBottomWidth: 1, borderBottomColor: colors.border}}>
        {/* Tab principal */}
        <Box flexDirection="row" mb="s8">
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

        {/* Filtro do histórico por categoria de ação */}
        {activeTab === 'history' && (
          <Box pb="s8">
            <FlatList
              data={Object.keys(HISTORY_FILTER_CONFIG) as HistoryFilter[]}
              keyExtractor={f => f}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{gap: 8}}
              renderItem={({item: f}) => {
                const cfg = HISTORY_FILTER_CONFIG[f];
                const active = historyFilter === f;
                return (
                  <TouchableOpacityBox
                    paddingHorizontal="s12"
                    paddingVertical="s6"
                    borderRadius="s20"
                    backgroundColor={active ? 'primaryBg' : 'background'}
                    flexDirection="row"
                    alignItems="center"
                    onPress={() => setHistoryFilter(f)}
                    style={{gap: 4}}>
                    <Icon name={cfg.icon as any} size={13} color={active ? 'primary' : 'textSecondary'} />
                    <Text
                      preset="paragraphSmall"
                      bold
                      color={active ? 'primary' : 'textSecondary'}>
                      {cfg.label}
                    </Text>
                  </TouchableOpacityBox>
                );
              }}
            />
          </Box>
        )}
      </Box>

      {/* Content */}
      {activeTab === 'history' ? (
        historyLoading ? (
          <Box flex={1} alignItems="center" justifyContent="center">
            <ActivityIndicator color={colors.primary} />
          </Box>
        ) : (
          <FlatList
            data={history}
            keyExtractor={item => item.id}
            renderItem={renderTransaction}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 24, flexGrow: 1}}
            onEndReached={() => fetchMoreHistory()}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
            ListHeaderComponent={
              historyFilter === 'all' ? (
                <Box
                  backgroundColor="surface"
                  margin="s16"
                  borderRadius="s12"
                  padding="s16"
                  style={{
                    borderLeftWidth: 3,
                    borderLeftColor: colors.primary,
                    shadowColor: '#000', shadowOffset: {width: 0, height: 1},
                    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
                  }}>
                  <Box flexDirection="row" alignItems="center" mb="s12">
                    <Icon name="stars" size={16} color="primary" />
                    <Text preset="paragraphSmall" color="primary" bold ml="s8">
                      Como ganhar NavegaCoins
                    </Text>
                  </Box>
                  {([
                    {icon: 'directions-boat', label: 'Viagem concluída', pts: '+10'},
                    {icon: 'local-shipping', label: 'Encomenda entregue', pts: '+15'},
                    {icon: 'star', label: 'Avaliação enviada', pts: '+5'},
                    {icon: 'emoji-events', label: '1ª viagem do mês', pts: '+20'},
                    {icon: 'person-add', label: 'Indicação de amigo', pts: '+50'},
                  ] as const).map((row, idx) => (
                    <Box
                      key={row.label}
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      pt={idx > 0 ? 's8' : undefined}
                      mt={idx > 0 ? 's8' : undefined}
                      style={{borderTopWidth: idx > 0 ? 1 : 0, borderTopColor: colors.border}}>
                      <Box flexDirection="row" alignItems="center">
                        <Icon name={row.icon as any} size={14} color="textSecondary" />
                        <Text preset="paragraphSmall" color="textSecondary" ml="s8">{row.label}</Text>
                      </Box>
                      <Text preset="paragraphSmall" color="success" bold>{row.pts} pts</Text>
                    </Box>
                  ))}
                </Box>
              ) : null
            }
            ListEmptyComponent={
              historyError ? (
                <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="s40" style={{paddingTop: 80}}>
                  <Icon name="wifi-off" size={48} color="border" />
                  <Text preset="headingSmall" color="textSecondary" mt="s16" style={{textAlign: 'center'}}>
                    Sem conexão
                  </Text>
                  <TouchableOpacityBox
                    mt="s16" paddingHorizontal="s24" paddingVertical="s12"
                    backgroundColor="primaryBg" borderRadius="s12"
                    onPress={() => fetchHistory().catch(() => {})}>
                    <Text preset="paragraphMedium" color="primary" bold>Tentar novamente</Text>
                  </TouchableOpacityBox>
                </Box>
              ) : (
                <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="s40" style={{paddingTop: 80}}>
                  <Icon name="monetization-on" size={64} color="border" />
                  <Text preset="headingSmall" color="textSecondary" mt="s16" style={{textAlign: 'center'}}>
                    Nenhuma transação ainda
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary" mt="s8" style={{textAlign: 'center'}}>
                    Complete viagens e avaliações para ganhar NavegaCoins.
                  </Text>
                </Box>
              )
            }
            ListFooterComponent={
              isLoadingMore ? (
                <Box paddingVertical="s16" alignItems="center">
                  <ActivityIndicator color={colors.primary} size="small" />
                </Box>
              ) : null
            }
          />
        )
      ) : leaderboardLoading ? (
        <Box flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator color={colors.primary} />
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListHeaderComponent={
            <Box margin="s16" style={{gap: 12}}>
              {/* Tabela de níveis */}
              <Box
                backgroundColor="surface"
                borderRadius="s12"
                padding="s16"
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: colors.warning,
                  shadowColor: '#000', shadowOffset: {width: 0, height: 1},
                  shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
                }}>
                <Box flexDirection="row" alignItems="center" mb="s12">
                  <Icon name="military-tech" size={16} color="warning" />
                  <Text preset="paragraphSmall" color="warning" bold ml="s8">
                    Níveis e Descontos
                  </Text>
                </Box>
                {LEVEL_INFO.map((info, idx) => {
                  const isCurrentLevel = info.level === level;
                  return (
                    <Box
                      key={info.level}
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      pt={idx > 0 ? 's8' : undefined}
                      mt={idx > 0 ? 's8' : undefined}
                      style={{borderTopWidth: idx > 0 ? 1 : 0, borderTopColor: colors.border}}>
                      <Box flexDirection="row" alignItems="center" style={{gap: 8}}>
                        <Icon name={info.icon as any} size={14} color={getLevelColor(info.level)} />
                        <Text
                          preset="paragraphSmall"
                          color={getLevelColor(info.level)}
                          bold={isCurrentLevel}>
                          {info.level}
                        </Text>
                        {isCurrentLevel && (
                          <Box
                            paddingHorizontal="s6"
                            paddingVertical="s4"
                            borderRadius="s8"
                            backgroundColor="primaryBg">
                            <Text preset="paragraphCaptionSmall" color="primary" bold>
                              você
                            </Text>
                          </Box>
                        )}
                      </Box>
                      <Box flexDirection="row" alignItems="center" style={{gap: 16}}>
                        <Text preset="paragraphCaptionSmall" color="textSecondary">
                          {info.points}+ pts
                        </Text>
                        <Text
                          preset="paragraphSmall"
                          color={info.discount > 0 ? 'success' : 'textSecondary'}
                          bold={info.discount > 0}>
                          {info.discount > 0 ? `${info.discount}% off` : '—'}
                        </Text>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Posição do utilizador se estiver no ranking */}
              {myLeaderboardPosition && (
                <Box
                  backgroundColor="primaryBg"
                  borderRadius="s12"
                  paddingHorizontal="s16"
                  paddingVertical="s12"
                  flexDirection="row"
                  alignItems="center"
                  style={{gap: 12}}>
                  <Icon name="location-on" size={18} color="primary" />
                  <Box flex={1}>
                    <Text preset="paragraphSmall" color="primary" bold>
                      A sua posição no ranking
                    </Text>
                    <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                      #{myLeaderboardPosition.rank} · {myLeaderboardPosition.totalPoints.toLocaleString('pt-BR')} NavegaCoins
                    </Text>
                  </Box>
                  <Icon name="chevron-right" size={18} color="primary" />
                </Box>
              )}
            </Box>
          }
        />
      )}
    </Box>
  );
}
