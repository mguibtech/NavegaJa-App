import React from 'react';
import { ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, Icon, InfoModal, Text, TouchableOpacityBox } from '@components';

import { useCaptainDashboard } from './useCaptainDashboard';
import { TripCard } from './TripCard';

export function CaptainDashboardScreen() {
  const { top } = useSafeAreaInsets();
  const {
    navigation,
    user,
    trips,
    boats,
    isLoading,
    isBoatsLoading,
    isRefreshingStatus,
    showBlockedModal,
    setShowBlockedModal,
    unreadNotifications,
    isBoatManager,
    canOperate,
    isBlocked,
    isRejected,
    isPending,
    currentTrips,
    completedToday,
    pendingBoats,
    rejectedBoats,
    handleRefresh,
    handleCheckStatus,
    handleBlockedAction,
  } = useCaptainDashboard();

  const statusBackgroundColor = isRejected
    ? 'rgba(239,68,68,0.25)'
    : isPending
      ? 'rgba(59,130,246,0.25)'
      : 'rgba(245,158,11,0.25)';
  const statusIconName = isRejected ? 'cancel' : isPending ? 'hourglass-top' : 'lock';
  const statusIconColor = isRejected ? '#FCA5A5' : isPending ? '#93C5FD' : '#FCD34D';
  const statusTextColor = statusIconColor;
  const statusMessage = isRejected
    ? 'Documentação rejeitada'
    : isPending
      ? 'Documentação em análise'
      : 'Verificação pendente';

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s20"
        paddingBottom="s16"
        backgroundColor="secondary"
        style={[styles.header, {paddingTop: top + 16}]}>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Text preset="paragraphSmall" style={styles.headerCaption}>
              {isBoatManager ? 'Bem-vindo, Gestor' : 'Bem-vindo, Capitão'}
            </Text>
            <Text preset="headingMedium" bold style={styles.headerTitle}>
              {user?.name || (isBoatManager ? 'Gestor' : 'Capitão')}
            </Text>
          </Box>

          {/* Botão de notificações */}
          <TouchableOpacityBox
            onPress={() => navigation.navigate('Notifications')}
            width={44}
            height={44}
            borderRadius="s24"
            alignItems="center"
            justifyContent="center"
            style={styles.notificationsButton}>
            <Icon name="notifications" size={24} color={'#FFFFFF' as any} />
            {unreadNotifications > 0 && (
              <Box
                style={styles.notificationsBadge}>
                <Text
                  preset="paragraphCaptionSmall"
                  bold
                  style={styles.notificationsBadgeText}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </Text>
              </Box>
            )}
          </TouchableOpacityBox>
        </Box>

        {/* Status chip no header */}
        {isBlocked && (
          <Box
            mt="s12"
            alignSelf="flex-start"
            flexDirection="row"
            alignItems="center"
            paddingHorizontal="s12"
            paddingVertical="s6"
            borderRadius="s20"
            style={[styles.statusChip, {backgroundColor: statusBackgroundColor}]}>
            <Icon name={statusIconName} size={14} color={statusIconColor as any} />
            <Text
              preset="paragraphCaptionSmall"
              bold
              ml="s6"
              style={[styles.statusText, {color: statusTextColor}]}>
              {statusMessage}
            </Text>
          </Box>
        )}
      </Box>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }>

        {/* Banner: conta não pode operar */}
        {isBlocked && (
          <>
            {/* Documentação rejeitada — mostra motivo + CTA reenviar */}
            {isRejected && (
              <TouchableOpacityBox
                margin="s16"
                marginBottom="s4"
                backgroundColor="dangerBg"
                borderRadius="s12"
                padding="s16"
                flexDirection="row"
                alignItems="center"
                borderLeftWidth={4}
                borderLeftColor="danger"
                onPress={() => navigation.navigate('KycSubmit', { rejected: true, reason: user?.rejectionReason ?? undefined })}>
                <Box
                  width={40}
                  height={40}
                  borderRadius="s20"
                  backgroundColor="danger"
                  alignItems="center"
                  justifyContent="center"
                  mr="s12"
                  style={styles.iconCircle}>
                  <Icon name="cancel" size={20} color="surface" />
                </Box>
                <Box flex={1}>
                  <Text preset="paragraphMedium" color="text" bold>
                    Documentação rejeitada
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                    {user?.rejectionReason || 'Seus documentos foram reprovados.'}
                  </Text>
                  <Text
                    preset="paragraphSmall"
                    color="danger"
                    bold
                    mt="s8">
                    Toque para reenviar os documentos →
                  </Text>
                </Box>
              </TouchableOpacityBox>
            )}

            {/* Sem documentos — solicita envio */}
            {!isPending && !isRejected && (
              <TouchableOpacityBox
                margin="s16"
                marginBottom="s4"
                backgroundColor="warningBg"
                borderRadius="s12"
                padding="s16"
                flexDirection="row"
                alignItems="center"
                borderLeftWidth={4}
                borderLeftColor="warning"
                onPress={() => navigation.navigate('KycSubmit')}>
                <Box
                  width={40}
                  height={40}
                  borderRadius="s20"
                  backgroundColor="warning"
                  alignItems="center"
                  justifyContent="center"
                  mr="s12"
                  style={styles.iconCircle}>
                  <Icon name="upload-file" size={20} color="surface" />
                </Box>
                <Box flex={1}>
                  <Text preset="paragraphMedium" color="text" bold>
                    Envie sua habilitação náutica
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                    Envie sua licença de arrais e certificado para começar a operar.
                  </Text>
                </Box>
                <Icon name="chevron-right" size={20} color="textSecondary" />
              </TouchableOpacityBox>
            )}

            {/* Conta pendente de verificação */}
            {isPending && (
              <Box
                margin="s16"
                marginBottom="s4"
                backgroundColor="infoBg"
                borderRadius="s12"
                padding="s16"
                borderLeftWidth={4}
                borderLeftColor="info">
                <Box flexDirection="row" alignItems="center">
                  <Box
                    width={40}
                    height={40}
                    borderRadius="s20"
                    backgroundColor="info"
                    alignItems="center"
                    justifyContent="center"
                    mr="s12"
                    style={styles.iconCircle}>
                    <Icon name="hourglass-top" size={20} color="surface" />
                  </Box>
                  <Box flex={1}>
                    <Text preset="paragraphMedium" color="text" bold>
                      Conta aguardando aprovação
                    </Text>
                    <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                      Envie sua habilitação náutica e documentos no seu perfil. Após o envio, nossa equipe irá analisar e você será notificado.
                    </Text>
                  </Box>
                </Box>
                <Box flexDirection="row" gap="s8" mt="s12">
                  <TouchableOpacityBox
                    flex={1}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    paddingVertical="s8"
                    borderRadius="s8"
                    style={styles.uploadButton}
                    onPress={() => navigation.navigate('KycSubmit')}>
                    <Icon name="upload-file" size={16} color={'#3B82F6' as any} />
                    <Text preset="paragraphSmall" bold ml="s6" style={styles.uploadText}>
                      Enviar docs
                    </Text>
                  </TouchableOpacityBox>
                  <TouchableOpacityBox
                    flex={1}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    paddingVertical="s8"
                    borderRadius="s8"
                    backgroundColor="info"
                    onPress={handleCheckStatus}
                    disabled={isRefreshingStatus}>
                    <Icon
                      name={isRefreshingStatus ? 'hourglass-top' : 'refresh'}
                      size={16}
                      color={'#FFFFFF' as any}
                    />
                    <Text preset="paragraphSmall" bold ml="s6" style={styles.whiteText}>
                      {isRefreshingStatus ? 'Verificando...' : 'Verificar status'}
                    </Text>
                  </TouchableOpacityBox>
                </Box>
              </Box>
            )}
          </>
        )}

        {/* Stats Row */}
        <Box flexDirection="row" padding="s20" gap="s12">
          <Box
            flex={1}
            backgroundColor="surface"
            padding="s16"
            borderRadius="s16"
            alignItems="center"
            style={styles.statCard}>
            <Text preset="headingMedium" color="secondary" bold>
              {trips.length}
            </Text>
            <Text preset="paragraphCaptionSmall" color="textSecondary" textAlign="center">
              Total de viagens
            </Text>
          </Box>
          <Box
            flex={1}
            backgroundColor="surface"
            padding="s16"
            borderRadius="s16"
            alignItems="center"
            style={styles.statCard}>
            <Text preset="headingMedium" color="success" bold>
              {completedToday}
            </Text>
            <Text preset="paragraphCaptionSmall" color="textSecondary" textAlign="center">
              Concluídas hoje
            </Text>
          </Box>
        </Box>

        {/* Boat Status Banners — visível apenas quando captain pode operar */}
        {canOperate && (
          <>
            {/* Nenhuma embarcação cadastrada — apenas para capitões (gestor não cria barcos) */}
            {boats.length === 0 && !isBoatManager && !isBoatsLoading && (
              <TouchableOpacityBox
                marginHorizontal="s20"
                mb="s12"
                backgroundColor="warningBg"
                borderRadius="s12"
                padding="s16"
                flexDirection="row"
                alignItems="center"
                borderLeftWidth={4}
                borderLeftColor="warning"
                onPress={() => navigation.navigate('CaptainCreateBoat')}>
                <Box
                  width={40}
                  height={40}
                  borderRadius="s20"
                  backgroundColor="warning"
                  alignItems="center"
                  justifyContent="center"
                  mr="s12"
                  style={styles.iconCircle}>
                  <Icon name="sailing" size={20} color="surface" />
                </Box>
                <Box flex={1}>
                  <Text preset="paragraphMedium" color="text" bold>
                    Nenhuma embarcação cadastrada
                  </Text>
                  <Text preset="paragraphSmall" color="secondary" bold mt="s4">
                    Cadastrar agora →
                  </Text>
                </Box>
              </TouchableOpacityBox>
            )}

            {/* Embarcações com documentação rejeitada */}
            {rejectedBoats.length > 0 && (
              <TouchableOpacityBox
                marginHorizontal="s20"
                mb="s12"
                backgroundColor="dangerBg"
                borderRadius="s12"
                padding="s16"
                flexDirection="row"
                alignItems="center"
                borderLeftWidth={4}
                borderLeftColor="danger"
                onPress={() => navigation.navigate('CaptainMyBoats')}>
                <Box
                  width={40}
                  height={40}
                  borderRadius="s20"
                  backgroundColor="danger"
                  alignItems="center"
                  justifyContent="center"
                  mr="s12"
                  style={styles.iconCircle}>
                  <Icon name="error" size={20} color="surface" />
                </Box>
                <Box flex={1}>
                  <Text preset="paragraphMedium" color="text" bold>
                    {rejectedBoats.length === 1
                      ? '1 embarcação rejeitada'
                      : `${rejectedBoats.length} embarcações rejeitadas`}
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                    Corrija os documentos para poder criar viagens.
                  </Text>
                  <Text preset="paragraphSmall" color="danger" bold mt="s6">
                    Ver embarcações →
                  </Text>
                </Box>
              </TouchableOpacityBox>
            )}

            {/* Embarcações em análise */}
            {pendingBoats.length > 0 && (
              <TouchableOpacityBox
                marginHorizontal="s20"
                mb="s12"
                backgroundColor="infoBg"
                borderRadius="s12"
                padding="s16"
                flexDirection="row"
                alignItems="center"
                borderLeftWidth={4}
                borderLeftColor="info"
                onPress={() => navigation.navigate('CaptainMyBoats')}>
                <Box
                  width={40}
                  height={40}
                  borderRadius="s20"
                  backgroundColor="info"
                  alignItems="center"
                  justifyContent="center"
                  mr="s12"
                  style={styles.iconCircle}>
                  <Icon name="hourglass-top" size={20} color="surface" />
                </Box>
                <Box flex={1}>
                  <Text preset="paragraphMedium" color="text" bold>
                    {pendingBoats.length === 1
                      ? '1 embarcação em análise'
                      : `${pendingBoats.length} embarcações em análise`}
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                    Aguarde a aprovação para criar viagens com {pendingBoats.length === 1 ? 'essa embarcação' : 'essas embarcações'}.
                  </Text>
                </Box>
                <Icon name="chevron-right" size={20} color="textSecondary" />
              </TouchableOpacityBox>
            )}
          </>
        )}

        {/* Current Trip/W trips */}
        <Box paddingHorizontal="s20" mb="s20">
          <Text preset="paragraphMedium" color="text" bold mb="s12">
            {currentTrips.length > 1 ? 'Viagens atuais' : 'Viagem atual'}
          </Text>
          {currentTrips.length === 0 ? (
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              alignItems="center"
              style={styles.currentTripCard}>
              <Icon name="directions-boat" size={48} color="textSecondary" />
              <Text preset="paragraphMedium" color="textSecondary" mt="s12" textAlign="center">
                Nenhuma viagem atual no momento
              </Text>
              <TouchableOpacityBox
                marginTop="s12"
                paddingHorizontal="s16"
                paddingVertical="s10"
                borderRadius="s12"
                backgroundColor="secondaryBg"
                onPress={() => navigation.navigate('CaptainCreateTrip')}>
                <Text preset="paragraphSmall" color="secondary" bold>
                  Criar viagem
                </Text>
              </TouchableOpacityBox>
            </Box>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 4 }}>
              {currentTrips.map((trip, index) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  index={index}
                  isMultiple={currentTrips.length > 1}
                  onPress={() =>
                    navigation.navigate('CaptainTripManage', { tripId: trip.id })
                  }
                />
              ))}
            </ScrollView>
          )}
        </Box>

        {/* Quick Actions */}
        <Box paddingHorizontal="s20">
          <Text preset="paragraphMedium" color="text" bold mb="s12">
            Ações rápidas
          </Text>
          <Box flexDirection="row" gap="s12">
            {/* Criar Viagem — bloqueado se !canOperate */}
            <TouchableOpacityBox
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              alignItems="center"
              onPress={() => (canOperate ? navigation.navigate('CaptainCreateTrip') : handleBlockedAction())}
              style={[styles.quickActionCard, !canOperate && styles.quickActionDisabled]}>
              <Box style={styles.relativeContainer}>
                <Box
                  width={48}
                  height={48}
                  borderRadius="s24"
                  backgroundColor={canOperate ? 'secondaryBg' : 'border'}
                  alignItems="center"
                  justifyContent="center"
                  mb="s12"
                  style={styles.largeIconCircle}>
                  <Icon name="add" size={28} color={canOperate ? 'secondary' : 'textSecondary'} />
                </Box>
                {!canOperate && (
                  <Box style={styles.lockBadge}>
                    <Icon name="lock" size={12} color={'#FFFFFF' as any} />
                  </Box>
                )}
              </Box>
              <Text preset="paragraphSmall" color={canOperate ? 'text' : 'textSecondary'} bold textAlign="center">
                Criar Viagem
              </Text>
            </TouchableOpacityBox>

            <TouchableOpacityBox
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              alignItems="center"
              onPress={() => navigation.navigate('CaptainMyTrips')}
              style={styles.quickActionCard}>
              <Box
                width={48}
                height={48}
                borderRadius="s24"
                backgroundColor="secondaryBg"
                alignItems="center"
                justifyContent="center"
                mb="s12">
                <Icon name="list" size={28} color="secondary" />
              </Box>
              <Text preset="paragraphSmall" color="text" bold textAlign="center">
                Minhas Viagens
              </Text>
            </TouchableOpacityBox>
          </Box>

          <Box flexDirection="row" gap="s12" mt="s12">
            {/* Embarcações — apenas para capitões (gestor não gere barcos próprios) */}
            {!isBoatManager && (
              <TouchableOpacityBox
                flex={1}
                backgroundColor="surface"
                borderRadius="s16"
                padding="s20"
                alignItems="center"
                onPress={() => (canOperate ? navigation.navigate('CaptainMyBoats') : handleBlockedAction())}
                style={[styles.quickActionCard, !canOperate && styles.quickActionDisabled]}>
                <Box style={styles.relativeContainer}>
                  <Box
                    width={48}
                    height={48}
                    borderRadius="s24"
                    backgroundColor={canOperate ? 'secondaryBg' : 'border'}
                    alignItems="center"
                    justifyContent="center"
                    mb="s12"
                    style={styles.largeIconCircle}>
                    <Icon name="sailing" size={28} color={canOperate ? 'secondary' : 'textSecondary'} />
                  </Box>
                  {!canOperate && (
                    <Box style={styles.lockBadge}>
                      <Icon name="lock" size={12} color={'#FFFFFF' as any} />
                    </Box>
                  )}
                </Box>
                <Text preset="paragraphSmall" color={canOperate ? 'text' : 'textSecondary'} bold textAlign="center">
                  Embarcações
                </Text>
              </TouchableOpacityBox>
            )}

            <TouchableOpacityBox
              flex={1}
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              alignItems="center"
              onPress={() => navigation.navigate('SosAlert', {})}
              style={styles.quickActionCard}>
              <Box
                width={48}
                height={48}
                borderRadius="s24"
                backgroundColor="dangerBg"
                alignItems="center"
                justifyContent="center"
                mb="s12"
                style={styles.largeIconCircle}>
                <Icon name="sos" size={28} color="danger" />
              </Box>
              <Text preset="paragraphSmall" color="text" bold textAlign="center">
                SOS
              </Text>
            </TouchableOpacityBox>
          </Box>
        </Box>
      </ScrollView>

      <InfoModal
        visible={showBlockedModal}
        title={
          isRejected
            ? 'Documentação rejeitada'
            : isPending
              ? 'Documentação em análise'
              : 'Verificação pendente'
        }
        message={
          isRejected
            ? `Sua documentação foi reprovada: "${user?.rejectionReason || 'verifique seu perfil'}". Corrija os documentos e reenvie para continuar operando.`
            : isPending
              ? 'Seus documentos estão sendo analisados pelo NavegaJá. Você será notificado assim que a conta for aprovada e poderá criar viagens e cadastrar embarcações.'
              : 'Envie sua licença de navegação e certificado de habilitação para que sua conta seja verificada e você possa criar viagens e embarcações.'
        }
        icon={isRejected ? 'cancel' : isPending ? 'hourglass-top' : 'lock'}
        iconColor={isRejected ? 'danger' : isPending ? 'info' : 'warning'}
        buttonText={isRejected ? 'Reenviar documentos' : isPending ? 'Entendido' : 'Enviar documentos'}
        onClose={() => {
          setShowBlockedModal(false);
          if (!isPending) {
            navigation.navigate('KycSubmit');
          }
        }}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 0,
  },
  headerCaption: {
    color: 'rgba(255,255,255,0.7)',
  },
  headerTitle: {
    color: '#FFFFFF',
  },
  notificationsButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  notificationsBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0B5D8A',
  },
  notificationsBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 14,
  },
  statusChip: {
    borderRadius: 20,
  },
  statusText: {
    fontWeight: '700',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  largeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: 'rgba(37,99,235,0.15)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  uploadText: {
    color: '#3B82F6',
  },
  whiteText: {
    color: '#FFFFFF',
  },
  statCard: {
    elevation: 2,
  },
  quickActionCard: {
    elevation: 2,
  },
  quickActionDisabled: {
    opacity: 0.5,
  },
  relativeContainer: {
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  currentTripCard: {
    elevation: 2,
  },
});
