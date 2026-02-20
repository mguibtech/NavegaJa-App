import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api} from '@api';

// ─── Notification History (local storage) ───────────────────────────────────

const HISTORY_KEY = '@navegaja:notification_history';

export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, string>;
  receivedAt: string;
  read: boolean;
}

export async function saveNotificationToHistory(notification: {
  messageId?: string;
  title: string;
  body: string;
  data: Record<string, string>;
}): Promise<void> {
  try {
    const history = await getNotificationHistory();
    // Evita duplicatas pelo messageId
    if (notification.messageId && history.some(n => n.id === notification.messageId)) {
      return;
    }
    const item: StoredNotification = {
      id: notification.messageId ?? Date.now().toString(),
      title: notification.title,
      body: notification.body,
      type: notification.data.type ?? 'general',
      data: notification.data,
      receivedAt: new Date().toISOString(),
      read: false,
    };
    const updated = [item, ...history].slice(0, 50); // mantém últimas 50
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export async function getNotificationHistory(): Promise<StoredNotification[]> {
  try {
    const stored = await AsyncStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    const history = await getNotificationHistory();
    const updated = history.map(n => (n.id === id ? {...n, read: true} : n));
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    const history = await getNotificationHistory();
    const updated = history.map(n => ({...n, read: true}));
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export async function clearNotificationHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {}
}

export async function getUnreadCount(): Promise<number> {
  const history = await getNotificationHistory();
  return history.filter(n => !n.read).length;
}

// ─── Push Token Registration ─────────────────────────────────────────────────

/**
 * Solicita permissão e registra o token FCM no backend.
 * Configura listener de renovação automática do token.
 * Chamar após login/registro bem-sucedido.
 */
export async function registerPushToken(): Promise<void> {
  try {
    // Android 13+ precisa de permissão explícita
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        return;
      }
    }

    // iOS — solicitar permissão
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) {
        return;
      }
    }

    const fcmToken = await messaging().getToken();
    if (!fcmToken) {
      return;
    }

    await sendTokenToBackend(fcmToken);

    // Renovação automática do token FCM (ex: token revogado pelo Firebase)
    messaging().onTokenRefresh(newToken => {
      sendTokenToBackend(newToken).catch(() => {});
    });
  } catch {
    // Silencioso — não bloqueia o fluxo de login
  }
}

/**
 * Remove o token FCM do backend e invalida o token local.
 * Chamar antes de fazer logout.
 */
export async function unregisterPushToken(): Promise<void> {
  try {
    await api.delete('/notifications/unregister-token');
    await messaging().deleteToken();
  } catch {
    // Silencioso — não bloqueia o logout
  }
}

async function sendTokenToBackend(fcmToken: string): Promise<void> {
  await api.post('/notifications/register-token', {fcmToken});
}
