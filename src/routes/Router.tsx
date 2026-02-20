import React, {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

import {NavigationContainer} from '@react-navigation/native';

import {Box} from '@components';
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

  const {type, bookingId, tripId, shipmentId} = data;

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

    default:
      break;
  }
}

export function Router() {
  const {isLoggedIn, isLoading, loadStoredUser, logout} = useAuthStore();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkOnboarding();
    loadStoredUser();

    // Registra callback para fazer logout quando token expirar
    apiClient.setUnauthorizedHandler(() => {
      logout();
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

    // Notificação recebida com app em foreground — salva no histórico local
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
