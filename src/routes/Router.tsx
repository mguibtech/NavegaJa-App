import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, AppState, AppStateStatus} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

import {NavigationContainer} from '@react-navigation/native';

import {Box} from '@components';
import {useToast} from '@hooks';
import {useAuthStore} from '@store';
import {OnboardingScreen} from '../screens/onboarding/OnboardingScreen';
import {SplashScreen} from '../screens/splash/SplashScreen';
import {apiClient} from '../api/apiClient';
import {saveNotificationToHistory} from '@services';

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

    default:
      break;
  }
}

export function Router() {
  const {isLoggedIn, isLoading, loadStoredUser, logout} = useAuthStore();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const {showSuccess, showError} = useToast();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

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
      remoteMessage => {
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
          handleNotificationNavigation(
            remoteMessage.data as Record<string, string>,
          );
        }
      },
    );

    // App aberto a partir de notificação quando estava completamente fechado
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage?.data) {
          const title = remoteMessage.notification?.title ?? '';
          const body = remoteMessage.notification?.body ?? '';
          if (title) {
            saveNotificationToHistory({
              messageId: remoteMessage.messageId,
              title,
              body,
              data: remoteMessage.data as Record<string, string>,
            });
          }
          setTimeout(() => {
            handleNotificationNavigation(
              remoteMessage.data as Record<string, string>,
            );
          }, 500);
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
      }
    });

    return () => {
      unsubscribeResponse();
      unsubscribeForeground();
    };
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
    <NavigationContainer ref={navigationRef}>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
