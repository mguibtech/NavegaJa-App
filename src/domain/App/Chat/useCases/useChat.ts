import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';

import {useAuthStore} from '@store';
import {chatService} from '../chatService';
import {ChatMessage} from '../chatTypes';

export function useChat(bookingId: string) {
  const {user} = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [sending, setSending] = useState(false);
  const lastSinceRef = useRef<string | null>(null);

  // Carga inicial
  useEffect(() => {
    setIsLoading(true);
    chatService
      .getMessages(bookingId)
      .then(data => {
        setMessages(data);
        if (data.length > 0) {
          lastSinceRef.current = data[data.length - 1].createdAt;
        }
        chatService.markRead(bookingId).catch(() => {});
      })
      .catch(() => { setLoadError(true); })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  // Busca mensagens novas desde o último fetch
  const fetchNew = useCallback(async () => {
    if (!lastSinceRef.current) {
      return;
    }
    try {
      const newMsgs = await chatService.getMessages(bookingId, lastSinceRef.current);
      if (newMsgs.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const unique = newMsgs.filter(m => !existingIds.has(m.id));
          return unique.length > 0 ? [...prev, ...unique] : prev;
        });
        lastSinceRef.current = newMsgs[newMsgs.length - 1].createdAt;
        chatService.markRead(bookingId).catch(() => {});
      }
    } catch {
      // falha silenciosa no polling
    }
  }, [bookingId]);

  // Polling a cada 10s
  useEffect(() => {
    const timer = setInterval(fetchNew, 10_000);
    return () => clearInterval(timer);
  }, [fetchNew]);

  // FCM wakeup — fetch imediato quando chega notificação de chat desta conversa
  useEffect(() => {
    const unsub = messaging().onMessage(remoteMessage => {
      const data = remoteMessage.data as Record<string, string> | undefined;
      if (data?.type === 'chat' && data.bookingId === bookingId) {
        fetchNew();
      }
    });
    return unsub;
  }, [fetchNew, bookingId]);

  // Enviar mensagem com UI otimista
  const send = useCallback(
    async (content: string) => {
      if (!content.trim() || sending || !user) {
        return;
      }
      setSending(true);

      const tempId = `temp-${Date.now()}`;
      const tempMsg: ChatMessage = {
        id: tempId,
        bookingId,
        content: content.trim(),
        senderRole: (user.role as 'passenger' | 'captain') ?? 'passenger',
        senderId: user.id,
        senderName: user.name,
        createdAt: new Date().toISOString(),
        readAt: null,
      };
      setMessages(prev => [...prev, tempMsg]);

      try {
        const sent = await chatService.sendMessage(bookingId, content.trim());
        setMessages(prev => prev.map(m => (m.id === tempId ? sent : m)));
        lastSinceRef.current = sent.createdAt;
      } catch {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        Alert.alert('Erro', 'Mensagem não enviada. Tente novamente.');
      } finally {
        setSending(false);
      }
    },
    [bookingId, sending, user],
  );

  return {messages, send, sending, isLoading, loadError, fetchNew};
}
