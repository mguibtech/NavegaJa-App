import React from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {useConversations, Conversation} from '@domain';

import {AppStackParamList} from '@routes';

export function ConversationsScreen() {
  const {top} = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {conversations, isLoading, refetch} = useConversations();

  function formatDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    }
    if (diffDays === 1) {
      return 'Ontem';
    }
    if (diffDays < 7) {
      return date.toLocaleDateString('pt-BR', {weekday: 'short'});
    }
    return date.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
  }

  function renderItem({item}: {item: Conversation}) {
    const lastMsg = item.lastMessage;

    return (
      <TouchableOpacityBox
        onPress={() =>
          navigation.navigate('Chat', {
            bookingId: item.bookingId,
            otherName: item.otherParticipant.name,
          })
        }
        activeOpacity={0.7}
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingVertical="s16"
        flexDirection="row"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="border">
        {/* Avatar */}
        <Box
          width={48}
          height={48}
          borderRadius="s24"
          backgroundColor="primaryBg"
          alignItems="center"
          justifyContent="center"
          marginRight="s16">
          <Icon name="person" size={24} color="primary" />
        </Box>

        {/* Content */}
        <Box flex={1}>
          <Box flexDirection="row" justifyContent="space-between" mb="s4">
            <Text
              preset="paragraphMedium"
              color="text"
              bold={item.unreadCount > 0}>
              {item.otherParticipant.name}
            </Text>
            {lastMsg && (
              <Text preset="paragraphCaptionSmall" color="textSecondary">
                {formatDate(lastMsg.createdAt)}
              </Text>
            )}
          </Box>

          <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
            {item.trip.origin} → {item.trip.destination}
          </Text>

          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text
              preset="paragraphSmall"
              color={item.unreadCount > 0 ? 'text' : 'textSecondary'}
              style={{flex: 1}}
              numberOfLines={1}>
              {lastMsg?.content ?? 'Nenhuma mensagem ainda'}
            </Text>
            {item.unreadCount > 0 && (
              <Box
                backgroundColor="primary"
                borderRadius="s12"
                minWidth={20}
                height={20}
                paddingHorizontal="s8"
                alignItems="center"
                justifyContent="center"
                ml="s8">
                <Text
                  preset="paragraphCaptionSmall"
                  bold
                  style={{color: '#FFFFFF', fontSize: 11}}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </TouchableOpacityBox>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingBottom="s16"
        borderBottomWidth={1}
        borderBottomColor="border"
        style={{paddingTop: top + 12}}>
        <Text preset="headingMedium" color="text" bold>
          Mensagens
        </Text>
      </Box>

      {isLoading && conversations.length === 0 ? (
        <Box flex={1} alignItems="center" justifyContent="center">
          <Text preset="paragraphMedium" color="textSecondary">
            Carregando conversas...
          </Text>
        </Box>
      ) : conversations.length === 0 ? (
        <Box flex={1} alignItems="center" justifyContent="center" padding="s24">
          <Icon name="chat-bubble-outline" size={56} color="textSecondary" />
          <Text
            preset="paragraphMedium"
            color="textSecondary"
            textAlign="center"
            mt="s16">
            Nenhuma conversa ainda.{'\n'}As mensagens aparecem aqui após uma reserva.
          </Text>
        </Box>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.bookingId}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />
      )}
    </Box>
  );
}
