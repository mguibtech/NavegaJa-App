import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {useQueryClient} from '@tanstack/react-query';

import {
  enqueueChatMessage,
  isLikelyOfflineError,
  queryKeys,
  refreshOnlineState,
} from '@infra';
import {useAuthStore} from '@store';
import {chatService} from '../chatService';
import {ChatMessage} from '../chatTypes';

function mergeNewMessages(
  previousMessages: ChatMessage[],
  incomingMessages: ChatMessage[],
): ChatMessage[] {
  const nextMessages = [...previousMessages];

  for (const incomingMessage of incomingMessages) {
    const existingIndex = nextMessages.findIndex(
      message => message.id === incomingMessage.id,
    );

    if (existingIndex >= 0) {
      nextMessages[existingIndex] = {
        ...nextMessages[existingIndex],
        ...incomingMessage,
      };
      continue;
    }

    const queuedIndex = nextMessages.findIndex(
      message =>
        message.syncStatus === 'queued' &&
        message.content === incomingMessage.content &&
        message.senderId === incomingMessage.senderId &&
        message.bookingId === incomingMessage.bookingId,
    );

    if (queuedIndex >= 0) {
      nextMessages[queuedIndex] = incomingMessage;
      continue;
    }

    nextMessages.push(incomingMessage);
  }

  return nextMessages;
}

export function useChat(bookingId: string) {
  const {user} = useAuthStore();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [sending, setSending] = useState(false);
  const lastSinceRef = useRef<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    chatService
      .getMessages(bookingId)
      .then(data => {
        setMessages(data);
        if (data.length > 0) {
          lastSinceRef.current = data[data.length - 1].createdAt;
        }
        chatService
          .markRead(bookingId)
          .then(() => {
            queryClient.invalidateQueries({
              queryKey: queryKeys.chat.conversations(),
            });
          })
          .catch(() => {});
      })
      .catch(() => {
        setLoadError(true);
      })
      .finally(() => setIsLoading(false));
  }, [bookingId, queryClient]);

  const fetchNew = useCallback(async () => {
    if (!lastSinceRef.current) {
      return;
    }

    try {
      const newMessages = await chatService.getMessages(bookingId, lastSinceRef.current);
      if (newMessages.length === 0) {
        return;
      }

      setMessages(previousMessages =>
        mergeNewMessages(previousMessages, newMessages),
      );
      lastSinceRef.current = newMessages[newMessages.length - 1].createdAt;

      chatService
        .markRead(bookingId)
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.chat.conversations(),
          });
        })
        .catch(() => {});
    } catch {
      // Silent fail during background polling.
    }
  }, [bookingId, queryClient]);

  useEffect(() => {
    const timer = setInterval(fetchNew, 10_000);
    return () => clearInterval(timer);
  }, [fetchNew]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(remoteMessage => {
      const data = remoteMessage.data as Record<string, string> | undefined;
      if (data?.type === 'chat' && data.bookingId === bookingId) {
        fetchNew();
      }
    });
    return unsubscribe;
  }, [fetchNew, bookingId]);

  const send = useCallback(
    async (content: string) => {
      if (!content.trim() || sending || !user) {
        return;
      }

      const normalizedContent = content.trim();
      setSending(true);

      const tempId = `temp-${Date.now()}`;
      const tempMessage: ChatMessage = {
        id: tempId,
        bookingId,
        content: normalizedContent,
        senderRole: (user.role as 'passenger' | 'captain') ?? 'passenger',
        senderId: user.id,
        senderName: user.name,
        createdAt: new Date().toISOString(),
        readAt: null,
        syncStatus: 'sent',
      };
      setMessages(previousMessages => [...previousMessages, tempMessage]);

      try {
        const isOnline = await refreshOnlineState();
        if (!isOnline) {
          await enqueueChatMessage(bookingId, normalizedContent);
          setMessages(previousMessages =>
            previousMessages.map(message =>
              message.id === tempId
                ? {
                    ...message,
                    syncStatus: 'queued',
                  }
                : message,
            ),
          );
          Alert.alert(
            'Sem conexão',
            'Mensagem salva offline. Ela será enviada automaticamente quando a conexão voltar.',
          );
          return;
        }

        const sentMessage = await chatService.sendMessage(bookingId, normalizedContent);
        setMessages(previousMessages =>
          previousMessages.map(message =>
            message.id === tempId ? sentMessage : message,
          ),
        );
        lastSinceRef.current = sentMessage.createdAt;
      } catch (error) {
        if (isLikelyOfflineError(error)) {
          await enqueueChatMessage(bookingId, normalizedContent);
          setMessages(previousMessages =>
            previousMessages.map(message =>
              message.id === tempId
                ? {
                    ...message,
                    syncStatus: 'queued',
                  }
                : message,
            ),
          );
          Alert.alert(
            'Sem conexão',
            'Mensagem salva offline. Ela será enviada automaticamente quando a conexão voltar.',
          );
          return;
        }

        setMessages(previousMessages =>
          previousMessages.filter(message => message.id !== tempId),
        );
        Alert.alert('Erro', 'Mensagem não enviada. Tente novamente.');
      } finally {
        setSending(false);
      }
    },
    [bookingId, sending, user],
  );

  return {messages, send, sending, isLoading, loadError, fetchNew};
}
