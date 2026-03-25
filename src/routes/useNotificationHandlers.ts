import {useCallback, useEffect, useEffectEvent, useRef} from 'react';
import messaging, {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {useQueryClient} from '@tanstack/react-query';

import {useToast} from '@hooks';
import {queryKeys} from '@infra';
import {saveNotificationToHistory, authStorage} from '@services';
import {useAuthStore} from '@store';
import {apiClient} from '@api/apiClient';

import {navigationRef} from './navigationRef';
import {
  navigateFromNotificationData,
  NotificationData,
} from './notificationNavigation';

async function saveNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
  const title = remoteMessage.notification?.title ?? '';
  if (!title || !remoteMessage.data) {
    return;
  }

  await saveNotificationToHistory({
    messageId: remoteMessage.messageId,
    title,
    body: remoteMessage.notification?.body ?? '',
    data: remoteMessage.data as NotificationData,
  });
}

async function refreshTokensIfNeeded(data: NotificationData): Promise<void> {
  if (data.requiresTokenRefresh !== 'true') {
    return;
  }

  try {
    const storedRefreshToken = await authStorage.getRefreshToken();
    if (!storedRefreshToken) {
      return;
    }

    const response = await apiClient.post<{accessToken: string; refreshToken: string}>(
      '/auth/refresh',
      {refreshToken: storedRefreshToken},
    );

    await authStorage.saveToken(response.accessToken);
    await authStorage.saveRefreshToken(response.refreshToken);
  } catch {
    // Silencioso: loadStoredUser atualiza o perfil mesmo sem novo token.
  }
}

function getNotificationData(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): NotificationData | undefined {
  return remoteMessage.data as NotificationData | undefined;
}

export function useNotificationHandlers() {
  const queryClient = useQueryClient();
  const {showSuccess, showError, showInfo} = useToast();
  const pendingNavigationRef = useRef<NotificationData | null>(null);

  const queueNavigation = useEffectEvent((data: NotificationData) => {
    if (navigationRef.isReady()) {
      navigateFromNotificationData(data);
      return;
    }

    pendingNavigationRef.current = data;
  });

  const handleForegroundNotification = useEffectEvent(async (
    data: NotificationData | undefined,
    title: string,
    body: string,
  ) => {
    if (data?.type === 'captain_verified') {
      await useAuthStore.getState().loadStoredUser();
      showSuccess('Parabéns! Sua documentação foi aprovada. Você já pode criar viagens.');
      return;
    }

    if (data?.type === 'captain_rejected') {
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
      return;
    }

    if (data?.type === 'boat_verified') {
      showSuccess('Embarcação aprovada! Você já pode criar viagens com ela.');
      return;
    }

    if (data?.type === 'boat_rejected') {
      const reason = data.reason || data.rejectionReason || '';
      showError(
        reason
          ? `Embarcação rejeitada: ${reason}`
          : 'Uma embarcação foi rejeitada. Verifique os documentos.',
      );
      const boatId = data.boatId;
      setTimeout(() => {
        if (navigationRef.isReady()) {
          if (boatId) {
            navigationRef.navigate('CaptainEditBoat', {boatId});
          } else {
            navigationRef.navigate('CaptainMyBoats');
          }
        }
      }, 1500);
      return;
    }

    if (data?.type === 'kyc_approved') {
      queryClient.invalidateQueries({queryKey: queryKeys.kyc.status()});
      showSuccess('Verificação aprovada! Você já pode criar viagens.');
      return;
    }

    if (data?.type === 'kyc_rejected') {
      queryClient.invalidateQueries({queryKey: queryKeys.kyc.status()});
      const reason = data.rejectionReason || '';
      showError(
        reason
          ? `KYC reprovado: ${reason}`
          : 'Sua verificação foi reprovada. Reenvie os documentos.',
      );
      return;
    }

    if (data?.type === 'referral_converted') {
      queryClient.invalidateQueries({queryKey: queryKeys.gamification.stats()});
      queryClient.invalidateQueries({queryKey: queryKeys.referrals.my()});
      const referredName = data.referredName || 'Um amigo';
      showSuccess(`🎉 +50 NavegaCoins! ${referredName} fez a primeira viagem!`);
      return;
    }

    if (data?.type === 'shipment_incoming') {
      queryClient.invalidateQueries({queryKey: queryKeys.shipments.my()});
      showSuccess('Nova encomenda! Alguém criou uma encomenda para você.');
      return;
    }

    if (
      data?.type === 'shipment_paid' ||
      data?.type === 'shipment_collected' ||
      data?.type === 'shipment_in_transit' ||
      data?.type === 'shipment_arrived' ||
      data?.type === 'shipment_out_for_delivery' ||
      data?.type === 'shipment_delivered'
    ) {
      if (data.shipmentId) {
        queryClient.invalidateQueries({queryKey: queryKeys.shipments.detail(data.shipmentId)});
        queryClient.invalidateQueries({
          queryKey: queryKeys.shipments.timeline(data.shipmentId),
        });
      }

      queryClient.invalidateQueries({queryKey: queryKeys.shipments.my()});
      return;
    }

    if (data?.type === 'sos_personal_contact') {
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
      return;
    }

    if (data?.type === 'boat_manager_assigned') {
      await refreshTokensIfNeeded(data);
      await useAuthStore.getState().loadStoredUser();
      queryClient.invalidateQueries({queryKey: queryKeys.captain.staff()});
      const boatName = data.boatName || 'um barco';
      showSuccess(`Fui adicionado como gestor de ${boatName}`);
      return;
    }

    if (data?.type === 'boat_manager_removed') {
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
      return;
    }

    if (title) {
      showInfo(body || title);
    }
  });

  useEffect(() => {
    const unsubscribeOpened = messaging().onNotificationOpenedApp(async remoteMessage => {
      await saveNotification(remoteMessage);
      const data = getNotificationData(remoteMessage);
      if (!data) {
        return;
      }

      await refreshTokensIfNeeded(data);
      queueNavigation(data);
    });

    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (!remoteMessage) {
          return;
        }

        await saveNotification(remoteMessage);
        const data = getNotificationData(remoteMessage);
        if (!data) {
          return;
        }

        await refreshTokensIfNeeded(data);
        pendingNavigationRef.current = data;
      })
      .catch(() => {});

    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      await saveNotification(remoteMessage);
      await handleForegroundNotification(
        getNotificationData(remoteMessage),
        remoteMessage.notification?.title ?? '',
        remoteMessage.notification?.body ?? '',
      );
    });

    return () => {
      unsubscribeOpened();
      unsubscribeForeground();
    };
  }, []);

  const flushPendingNavigation = useCallback(() => {
    const pendingData = pendingNavigationRef.current;
    if (!pendingData) {
      return;
    }

    navigateFromNotificationData(pendingData);
    pendingNavigationRef.current = null;
  }, []);

  return {flushPendingNavigation};
}
