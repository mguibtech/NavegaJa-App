import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';
import {chatService} from '../chatService';
import {Conversation} from '../chatTypes';

export function useConversations() {
  const query = useQuery<Conversation[], Error>({
    queryKey: queryKeys.chat.conversations(),
    queryFn: chatService.getConversations,
    staleTime: 60_000,
    refetchInterval: 90_000,
    refetchOnMount: false,
  });

  const conversations = query.data ?? [];
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    conversations,
    totalUnread,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}