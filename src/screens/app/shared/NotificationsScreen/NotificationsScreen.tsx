import React from 'react';
import {FlatList, RefreshControl, TouchableOpacity} from 'react-native';
import {useTheme} from '@shopify/restyle';

import {Box, Icon, Text, TouchableOpacityBox, ScreenHeader} from '@components';
import type {StoredNotification} from '@services';
import {Theme} from '@theme';

import {useNotificationsScreen} from './useNotificationsScreen';

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

export function NotificationsScreen() {
  const {colors} = useTheme<Theme>();
  const {
    navigation,
    notifications,
    refreshing,
    unreadCount,
    onRefresh,
    handleTap,
    handleMarkAllRead,
    handleClear,
  } = useNotificationsScreen();

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
            borderBottomColor: colors.border,
            borderLeftWidth: item.read ? 0 : 3,
            borderLeftColor: colors.primary,
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
      <ScreenHeader
        title="Notificações"
        subtitle={unreadCount > 0 ? `${unreadCount} não ${unreadCount === 1 ? 'lida' : 'lidas'}` : undefined}
        onBack={() => navigation.goBack()}
        rightElement={
          notifications.length > 0 ? (
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
                <Text preset="paragraphSmall" color="textSecondary" bold>
                  Limpar
                </Text>
              </TouchableOpacityBox>
            </Box>
          ) : undefined
        }
      />

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
