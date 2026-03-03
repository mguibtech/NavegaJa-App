import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, AppState, AppStateStatus} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

import {NavigationContainer} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';

import {Box} from '@components';
import {useToast} from '@hooks';
import {useAuthStore} from '@store';
import {queryKeys} from '@infra';
import {OnboardingScreen} from '../screens/onboarding/OnboardingScreen';
import {SplashScreen} from '../screens/splash/SplashScreen';
import {apiClient} from '../api/apiClient';
import {saveNotificationToHistory, authStorage} from '@services';

import {AppStack} from './AppStack';
import {AuthStack} from './AuthStack';
import {navigationRef} from './navigationRef';

const ONBOARDED_KEY = '@navegaja:onboarded';

// Tipos de notificação do backend → tela de destino
function handleNotificationNavigation(data: Record<string, string>) {
  if (!navigationRef.isReady()) {
    return;
  }

  const {type, bookingId, tripId, shipmentId, boatId} = data;

  switch (type) {
    case 'booking_confirmed':
    case 'payment_confirmed':
      if (bookingId) {
        navigationRef.navigate('Ticket', {bookingId});
      }
      break;

    case 'booking_cancelled':
      navigationRef.navigate('HomeTabs', undefined);
      break;

    case 'trip_started':
    case 'trip_cancelled':
      if (bookingId) {
        navigationRef.navigate('Tracking', {bookingId});
      }
      break;

    case 'trip_completed':
      // Abre tela de avaliação para o passageiro
      if (tripId) {
        navigationRef.navigate('TripReview', {tripId});
      }
      break;

    case 'shipment_incoming':
      // Destinatário recebe aviso que uma encomenda foi criada para ele
      if (shipmentId) {
        navigationRef.navigate('ShipmentDetails', {shipmentId});
      }
      break;

    case 'shipment_collected':
    case 'shipment_in_transit':
    case 'shipment_arrived':
    case 'shipment_out_for_delivery':
    case 'shipment_delivered':
      if (shipmentId) {
        navigationRef.navigate('ShipmentDetails', {shipmentId});
      }
      break;

    case 'new_booking': // capitão recebe nova reserva
      if (tripId) {
        navigationRef.navigate('CaptainTripManage', {tripId});
      }
      break;

    case 'weather_alert':
      // Alerta de clima — passageiro vai para a reserva, capitão vai para a viagem
      if (bookingId) {
        navigationRef.navigate('Ticket', {bookingId});
      } else if (tripId) {
        navigationRef.navigate('TripDetails', {tripId});
      }
      break;

    case 'captain_verified':
      // Documentação aprovada — exibe dashboard já atualizado
      navigationRef.navigate('HomeTabs', undefined);
      break;

    case 'captain_rejected':
      // Documentação rejeitada — direciona para reenvio
      navigationRef.navigate('EditProfile');
      break;

    case 'boat_verified':
      // Embarcação aprovada — exibe lista de embarcações atualizada
      navigationRef.navigate('CaptainMyBoats');
      break;

    case 'boat_rejected':
      // Embarcação rejeitada — abre tela de edição da embarcação específica
      if (boatId) {
        navigationRef.navigate('CaptainEditBoat', {boatId});
      } else {
        navigationRef.navigate('CaptainMyBoats');
      }
      break;

    case 'chat':
      // Nova mensagem no chat — abre a conversa específica
      if (data.bookingId) {
        navigationRef.navigate('Chat', {
          bookingId: data.bookingId,
          otherName: data.senderName,
        });
      }
      break;

    case 'kyc_approved':
      // KYC aprovado — abre tela de status KYC
      navigationRef.navigate('KycStatus');
      break;

    case 'kyc_rejected':
      // KYC rejeitado — abre tela de envio com motivo preenchido
      navigationRef.navigate('KycSubmit', {
        rejected: true,
        reason: data.rejectionReason,
      });
      break;

    case 'referral_converted':
      // Indicação convertida — abre tela de indicações
      navigationRef.navigate('Referrals');
      break;

    case 'sos_personal_contact':
      // Recebemos SOS de um contacto pessoal — abre mapa com localização
      if (data.lat && data.lng) {
        navigationRef.navigate('Tracking', {bookingId: data.bookingId ?? ''});
      } else {
        navigationRef.navigate('HomeTabs', undefined);
      }
      break;

    case 'boat_manager_assigned':
      // Utilizador foi adicionado como gestor — abre dashboard (role já actualizado)
      navigationRef.navigate('HomeTabs', undefined);
      break;

    case 'boat_manager_removed':
      // Utilizador foi removido como gestor — volta ao início
      navigationRef.navigate('HomeTabs', undefined);
      break;

    default:
      break;
  }
}

async function refreshTokensIfNeeded(data: Record<string, string>): Promise<void> {
  if (data.requiresTokenRefresh !== 'true') { return; }
  try {
    const storedRefreshToken = await authStorage.getRefreshToken();
    if (!storedRefreshToken) { return; }
    const response = await apiClient.post<{accessToken: string; refreshToken: string}>(
      '/auth/refresh',
      {refreshToken: storedRefreshToken},
    );
    await authStorage.saveToken(response.accessToken);
    await authStorage.saveRefreshToken(response.refreshToken);
  } catch {
    // Silencioso — loadStoredUser atualiza o perfil mesmo sem novo token
  }
}

export function Router() {
  const {isLoggedIn, isLoading, loadStoredUser, logout} = useAuthStore();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const {showSuccess, showError} = useToast();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const queryClient = useQueryClient();
  // Dados de notificação pendentes — executados quando o NavigationContainer ficar ready
  const pendingNavigationRef = useRef<Record<string, string> | null>(null);

  // Atualiza perfil ao voltar ao foreground (garante estados de verificação atualizados sem FCM)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appStateRef.current !== 'active' && nextState === 'active' && isLoggedIn) {
        useAuthStore.getState().loadStoredUser();
      }
      appStateRef.current = nextState;
    });
    return () => subscription.remove();
  }, [isLoggedIn]);

  useEffect(() => {
    checkOnboarding();
    loadStoredUser();

    // Registra callback para fazer logout quando token expirar.
    // skipTokenRemoval=true evita chamar unregisterPushToken() sem token válido
    // (o que causaria um segundo 401 e um ciclo de refresh infinito).
    apiClient.setUnauthorizedHandler(() => {
      showError('Sua sessão expirou. Faça login novamente.');
      logout(true);
    });

    // Notificação recebida com app em background (usuário tocou na notificação)
    const unsubscribeResponse = messaging().onNotificationOpenedApp(
      async remoteMessage => {
        const title = remoteMessage.notification?.title ?? '';
        const body = remoteMessage.notification?.body ?? '';
        if (title && remoteMessage.data) {
          saveNotificationToHistory({
            messageId: remoteMessage.messageId,
            title,
            body,
            data: remoteMessage.data as Record<string, string>,
          });
        }
        if (remoteMessage.data) {
          const d = remoteMessage.data as Record<string, string>;
          await refreshTokensIfNeeded(d);
          if (navigationRef.isReady()) {
            handleNotificationNavigation(d);
          } else {
            pendingNavigationRef.current = d;
          }
        }
      },
    );

    // App aberto a partir de notificação quando estava completamente fechado
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage?.data) {
          const d = remoteMessage.data as Record<string, string>;
          const title = remoteMessage.notification?.title ?? '';
          const body = remoteMessage.notification?.body ?? '';
          if (title) {
            saveNotificationToHistory({
              messageId: remoteMessage.messageId,
              title,
              body,
              data: d,
            });
          }
          await refreshTokensIfNeeded(d);
          // Guarda para executar quando o NavigationContainer estiver pronto
          pendingNavigationRef.current = d;
        }
      });

    // Notificação recebida com app em foreground — salva no histórico + trata capitão
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      const title = remoteMessage.notification?.title ?? '';
      const body = remoteMessage.notification?.body ?? '';
      if (title && remoteMessage.data) {
        await saveNotificationToHistory({
          messageId: remoteMessage.messageId,
          title,
          body,
          data: remoteMessage.data as Record<string, string>,
        });
      }

      const data = remoteMessage.data as Record<string, string> | undefined;
      if (data?.type === 'captain_verified') {
        // Atualiza perfil e notifica aprovação
        await useAuthStore.getState().loadStoredUser();
        showSuccess('Parabéns! Sua documentação foi aprovada. Você já pode criar viagens.');
      } else if (data?.type === 'captain_rejected') {
        // Atualiza perfil e notifica rejeição com motivo
        await useAuthStore.getState().loadStoredUser();
        const reason = data.reason || data.rejectionReason || '';
        showError(
          reason
            ? `Documentação rejeitada: ${reason}`
            : 'Sua documentação foi rejeitada. Verifique seu perfil.',
        );
        setTimeout(() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate('EditProfile');
          }
        }, 1500);
      } else if (data?.type === 'boat_verified') {
        showSuccess('Embarcação aprovada! Você já pode criar viagens com ela.');
      } else if (data?.type === 'boat_rejected') {
        const reason = data.reason || data.rejectionReason || '';
        showError(
          reason
            ? `Embarcação rejeitada: ${reason}`
            : 'Uma embarcação foi rejeitada. Verifique os documentos.',
        );
        const bId = data.boatId;
        setTimeout(() => {
          if (navigationRef.isReady()) {
            if (bId) {
              navigationRef.navigate('CaptainEditBoat', {boatId: bId});
            } else {
              navigationRef.navigate('CaptainMyBoats');
            }
          }
        }, 1500);
      } else if (data?.type === 'kyc_approved') {
        queryClient.invalidateQueries({queryKey: queryKeys.kyc.status()});
        showSuccess('Verificação aprovada! Você já pode criar viagens.');
      } else if (data?.type === 'kyc_rejected') {
        queryClient.invalidateQueries({queryKey: queryKeys.kyc.status()});
        const reason = data.rejectionReason || '';
        showError(
          reason
            ? `KYC reprovado: ${reason}`
            : 'Sua verificação foi reprovada. Reenvie os documentos.',
        );
      } else if (data?.type === 'referral_converted') {
        queryClient.invalidateQueries({queryKey: queryKeys.gamification.stats()});
        queryClient.invalidateQueries({queryKey: queryKeys.referrals.my()});
        const referredName = data.referredName || 'Um amigo';
        showSuccess(`🎉 +50 NavegaCoins! ${referredName} fez a primeira viagem!`);
      } else if (data?.type === 'shipment_incoming') {
        // Destinatário: nova encomenda criada para ele — atualiza lista
        queryClient.invalidateQueries({queryKey: queryKeys.shipments.my()});
        showSuccess('Nova encomenda! Alguém criou uma encomenda para você.');
      } else if (
        data?.type === 'shipment_paid' ||
        data?.type === 'shipment_collected' ||
        data?.type === 'shipment_in_transit' ||
        data?.type === 'shipment_arrived' ||
        data?.type === 'shipment_out_for_delivery' ||
        data?.type === 'shipment_delivered'
      ) {
        // Atualiza dados da encomenda específica em foreground
        if (data.shipmentId) {
          queryClient.invalidateQueries({queryKey: queryKeys.shipments.detail(data.shipmentId)});
          queryClient.invalidateQueries({queryKey: queryKeys.shipments.timeline(data.shipmentId)});
        }
        queryClient.invalidateQueries({queryKey: queryKeys.shipments.my()});
      } else if (data?.type === 'sos_personal_contact') {
        // Um contacto pessoal acionou SOS — alerta crítico em foreground
        const senderName = data.senderName || 'Um contacto';
        const alertType = data.alertType || 'emergência';
        showError(`🆘 ${senderName} acionou SOS (${alertType})! Toque para ver localização.`);
        if (data.lat && data.lng) {
          setTimeout(() => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('HomeTabs', undefined);
            }
          }, 2000);
        }
      } else if (data?.type === 'boat_manager_assigned') {
        // Fui adicionado como gestor de um barco — actualiza JWT + role/capabilities
        await refreshTokensIfNeeded(data);
        await useAuthStore.getState().loadStoredUser();
        queryClient.invalidateQueries({queryKey: queryKeys.captain.staff()});
        const boatName = data.boatName || 'um barco';
        showSuccess(`Fui adicionado como gestor de ${boatName}`);
      } else if (data?.type === 'boat_manager_removed') {
        // Fui removido como gestor — actualiza JWT + role/capabilities + volta ao início
        await refreshTokensIfNeeded(data);
        await useAuthStore.getState().loadStoredUser();
        queryClient.invalidateQueries({queryKey: queryKeys.captain.staff()});
        const boatName = data.boatName || 'um barco';
        showError(`Fui removido como gestor de ${boatName}`);
        setTimeout(() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate('HomeTabs', undefined);
          }
        }, 1500);
      }
    });

    return () => {
      unsubscribeResponse();
      unsubscribeForeground();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkOnboarding() {
    const onboarded = await AsyncStorage.getItem(ONBOARDED_KEY);
    setHasOnboarded(!!onboarded);
  }

  async function handleOnboardingComplete() {
    setHasOnboarded(true);
  }

  function handleSplashFinish() {
    setShowSplash(false);
  }

  // Show Splash Screen
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Loading state
  if (hasOnboarded === null || isLoading) {
    return (
      <Box
        flex={1}
        backgroundColor="surface"
        justifyContent="center"
        alignItems="center">
        <ActivityIndicator size="large" color="#0a6fbd" />
      </Box>
    );
  }

  // Show onboarding
  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Show Auth or App
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (pendingNavigationRef.current) {
          handleNotificationNavigation(pendingNavigationRef.current);
          pendingNavigationRef.current = null;
        }
      }}>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
