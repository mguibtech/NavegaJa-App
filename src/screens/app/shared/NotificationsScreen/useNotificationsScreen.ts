import {useState, useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  getNotificationHistory,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotificationHistory,
} from '@services';
import type {StoredNotification} from '@services';

import {AppStackParamList} from '@routes';

export function useNotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, []),
  );

  async function loadNotifications() {
    const history = await getNotificationHistory();
    setNotifications(history);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }

  async function handleTap(notification: StoredNotification) {
    await markNotificationRead(notification.id);
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? {...n, read: true} : n)),
    );

    const {type, bookingId, tripId, shipmentId} = notification.data;

    switch (type) {
      case 'booking_confirmed':
      case 'payment_confirmed':
        if (bookingId) {
          navigation.navigate('Ticket', {bookingId});
        }
        break;
      case 'booking_cancelled':
        navigation.navigate('HomeTabs', undefined);
        break;
      case 'trip_started':
      case 'trip_cancelled':
        if (bookingId) {
          navigation.navigate('Tracking', {bookingId});
        }
        break;
      case 'trip_completed':
        if (tripId) {
          navigation.navigate('TripReview', {tripId});
        }
        break;
      case 'shipment_collected':
      case 'shipment_in_transit':
      case 'shipment_arrived':
      case 'shipment_out_for_delivery':
      case 'shipment_delivered':
        if (shipmentId) {
          navigation.navigate('ShipmentDetails', {shipmentId});
        }
        break;
      case 'new_booking':
        if (tripId) {
          navigation.navigate('CaptainTripManage', {tripId});
        }
        break;
      default:
        break;
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  }

  async function handleClear() {
    await clearNotificationHistory();
    setNotifications([]);
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    navigation,
    notifications,
    refreshing,
    unreadCount,
    onRefresh,
    handleTap,
    handleMarkAllRead,
    handleClear,
  };
}
