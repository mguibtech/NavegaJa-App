import React, {useRef, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {useChat} from '@domain';
import {useAuthStore} from '@store';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'Chat'>;

export function ChatScreen({navigation, route}: Props) {
  const {top, bottom} = useSafeAreaInsets();
  const {bookingId, otherName} = route.params;
  const {user} = useAuthStore();
  const {messages, send, sending, isLoading} = useChat(bookingId);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  function handleSend() {
    if (!inputText.trim()) {
      return;
    }
    send(inputText.trim());
    setInputText('');
  }

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const myId = user?.id;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingBottom="s12"
        borderBottomWidth={1}
        borderBottomColor="border"
        style={{paddingTop: top + 12}}>
        <Box flexDirection="row" alignItems="center">
          <TouchableOpacityBox
            width={40}
            height={40}
            alignItems="center"
            justifyContent="center"
            marginRight="s12"
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color="text" />
          </TouchableOpacityBox>
          <Box
            width={36}
            height={36}
            borderRadius="s20"
            backgroundColor="primaryBg"
            alignItems="center"
            justifyContent="center"
            marginRight="s12">
            <Icon name="person" size={20} color="primary" />
          </Box>
          <Box flex={1}>
            <Text preset="paragraphMedium" color="text" bold>
              {otherName || 'Conversa'}
            </Text>
            <Text preset="paragraphCaptionSmall" color="textSecondary">
              Reserva #{bookingId.slice(0, 8).toUpperCase()}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Messages */}
      <Box flex={1} backgroundColor="background">
        {isLoading && messages.length === 0 ? (
          <Box flex={1} alignItems="center" justifyContent="center">
            <Text preset="paragraphSmall" color="textSecondary">
              Carregando mensagens...
            </Text>
          </Box>
        ) : messages.length === 0 ? (
          <Box flex={1} alignItems="center" justifyContent="center" padding="s24">
            <Icon name="chat-bubble-outline" size={48} color="textSecondary" />
            <Text preset="paragraphMedium" color="textSecondary" textAlign="center" mt="s16">
              Nenhuma mensagem ainda.{'\n'}Envie a primeira!
            </Text>
          </Box>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({animated: false})
            }
            renderItem={({item, index}) => {
              const isMe = item.senderId === myId;
              const prevItem = index > 0 ? messages[index - 1] : null;
              const showTime =
                !prevItem ||
                new Date(item.createdAt).getTime() -
                  new Date(prevItem.createdAt).getTime() >
                  5 * 60 * 1000;

              return (
                <Box>
                  {showTime && (
                    <Box alignItems="center" mb="s8" mt="s4">
                      <Text preset="paragraphCaptionSmall" color="textSecondary">
                        {formatTime(item.createdAt)}
                      </Text>
                    </Box>
                  )}
                  <Box
                    flexDirection="row"
                    justifyContent={isMe ? 'flex-end' : 'flex-start'}
                    mb="s8">
                    <Box
                      maxWidth="80%"
                      paddingHorizontal="s16"
                      paddingVertical="s10"
                      borderRadius="s16"
                      style={{
                        backgroundColor: isMe ? '#0B5D8A' : '#FFFFFF',
                        borderBottomRightRadius: isMe ? 4 : 16,
                        borderBottomLeftRadius: isMe ? 16 : 4,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 1},
                        shadowOpacity: 0.08,
                        shadowRadius: 3,
                        elevation: 1,
                      }}>
                      <Text
                        preset="paragraphSmall"
                        style={{color: isMe ? '#FFFFFF' : '#1A1A2E'}}>
                        {item.content}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              );
            }}
          />
        )}
      </Box>

      {/* Input */}
      <Box
        backgroundColor="surface"
        borderTopWidth={1}
        borderTopColor="border"
        paddingHorizontal="s16"
        paddingVertical="s12"
        style={{paddingBottom: bottom + 12}}
        flexDirection="row"
        alignItems="flex-end">
        <Box
          flex={1}
          backgroundColor="background"
          borderRadius="s24"
          paddingHorizontal="s16"
          paddingVertical="s10"
          marginRight="s12"
          style={{maxHeight: 100}}>
          <RNTextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escreva uma mensagem..."
            placeholderTextColor="#9CA3AF"
            multiline
            style={styles.textInput}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
        </Box>
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !inputText.trim()}
          style={[
            styles.sendBtn,
            {opacity: sending || !inputText.trim() ? 0.4 : 1},
          ]}>
          <Icon name="send" size={22} color={'primary'} />
        </TouchableOpacity>
      </Box>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: '#F3F4F6'},
  messageList: {padding: 16, paddingBottom: 8},
  textInput: {
    fontSize: 15,
    color: '#1A1A2E',
    padding: 0,
    minHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
