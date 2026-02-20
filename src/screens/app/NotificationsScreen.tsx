import React, {useState, useCallback} from 'react';
import {FlatList, RefreshControl, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {
  getNotificationHistory,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotificationHistory,
} from '@services';
import type {StoredNotification} from '@services';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'Notifications'>;

type NotificationIconConfig = {
  icon: string;
  color: 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info' | 'textSecondary';
  bg: 'primaryBg' | 'secondaryBg' | 'dangerBg' | 'warningBg' | 'successBg' | 'infoBg' | 'background';
};

function getNotificationConfig(type: string): NotificationIconConfig {
  switch (type) {
    case 'booking_confirmed':
    case 'payment_confirmed':
      return {icon: 'confirmation-number', color: 'primary', bg: 'primaryBg'};
    case 'booking_cancelled':
    case 'trip_cancelled':
      return {icon: 'cancel', color: 'danger', bg: 'dangerBg'};
    case 'trip_started':
      return {icon: 'directions-boat', color: 'success', bg: 'successBg'};
    case 'trip_completed':
      return {icon: 'check-circle', color: 'success', bg: 'successBg'};
    case 'shipment_collected':
    case 'shipment_in_transit':
    case 'shipment_arrived':
    case 'shipment_out_for_delivery':
    case 'shipment_delivered':
      return {icon: 'local-shipping', color: 'secondary', bg: 'secondaryBg'};
    case 'new_booking':
      return {icon: 'people', color: 'primary', bg: 'primaryBg'};
    default:
      return {icon: 'notifications', color: 'textSecondary', bg: 'background'};
  }
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) {
    return 'Agora mesmo';
  }
  if (diffMin < 60) {
    return `${diffMin}min atrás`;
  }
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}h atrás`;
  }
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) {
    return `${diffDay}d atrás`;
  }
  return date.toLocaleDateString('pt-BR');
}

export function NotificationsScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
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

  function renderItem({item}: {item: StoredNotification}) {
    const config = getNotificationConfig(item.type);
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => handleTap(item)}>
        <Box
          backgroundColor="surface"
          flexDirection="row"
          alignItems="flex-start"
          paddingHorizontal="s16"
          paddingVertical="s16"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#F0F0F0',
            borderLeftWidth: item.read ? 0 : 3,
            borderLeftColor: '#0E7AFE',
          }}>
          {/* Ícone */}
          <Box
            width={44}
            height={44}
            borderRadius="s24"
            backgroundColor={config.bg}
            alignItems="center"
            justifyContent="center"
            mr="s12"
            style={{flexShrink: 0}}>
            <Icon name={config.icon} size={22} color={config.color} />
          </Box>

          {/* Conteúdo */}
          <Box flex={1}>
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              mb="s4">
              <Text
                preset="paragraphMedium"
                color="text"
                bold={!item.read}
                style={{flex: 1, marginRight: 8}}
                numberOfLines={1}>
                {item.title}
              </Text>
              <Text preset="paragraphSmall" color="textSecondary">
                {formatTimeAgo(item.receivedAt)}
              </Text>
            </Box>
            <Text preset="paragraphSmall" color="textSecondary" numberOfLines={2}>
              {item.body}
            </Text>
          </Box>

          {/* Indicador não lido */}
          {!item.read && (
            <Box
              width={8}
              height={8}
              borderRadius="s8"
              backgroundColor="primary"
              style={{marginLeft: 8, marginTop: 6, flexShrink: 0}}
            />
          )}
        </Box>
      </TouchableOpacity>
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
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between">
          <Box flexDirection="row" alignItems="center">
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
            <Box>
              <Text preset="headingSmall" color="text" bold>
                Notificações
              </Text>
              {unreadCount > 0 && (
                <Text preset="paragraphSmall" color="textSecondary">
                  {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
                </Text>
              )}
            </Box>
          </Box>

          {notifications.length > 0 && (
            <Box flexDirection="row" gap="s8">
              {unreadCount > 0 && (
                <TouchableOpacityBox
                  paddingHorizontal="s12"
                  paddingVertical="s8"
                  borderRadius="s8"
                  backgroundColor="primaryBg"
                  onPress={handleMarkAllRead}>
                  <Text preset="paragraphSmall" color="primary" bold>
                    Ler todas
                  </Text>
                </TouchableOpacityBox>
              )}
              <TouchableOpacityBox
                paddingHorizontal="s12"
                paddingVertical="s8"
                borderRadius="s8"
                backgroundColor="background"
                onPress={handleClear}>
                <Text preset="paragraphSmall" color="textSecondary">
                  Limpar
                </Text>
              </TouchableOpacityBox>
            </Box>
          )}
        </Box>
      </Box>

      {/* Lista */}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 24, flexGrow: 1}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0E7AFE']} />
        }
        ListEmptyComponent={
          <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="s40" style={{paddingTop: 80}}>
            <Box
              width={80}
              height={80}
              borderRadius="s48"
              backgroundColor="surface"
              alignItems="center"
              justifyContent="center"
              mb="s24"
              style={{elevation: 2}}>
              <Icon name="notifications-none" size={40} color="textSecondary" />
            </Box>
            <Text preset="paragraphLarge" color="text" bold mb="s8" style={{textAlign: 'center'}}>
              Nenhuma notificação
            </Text>
            <Text preset="paragraphSmall" color="textSecondary" style={{textAlign: 'center'}}>
              Quando você receber notificações, elas aparecerão aqui.
            </Text>
          </Box>
        }
      />
    </Box>
  );
}
