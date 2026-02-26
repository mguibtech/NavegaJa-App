import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';
import {chatService} from '../chatService';
import {Conversation} from '../chatTypes';

export function useConversations() {
  const query = useQuery<Conversation[], Error>({
    queryKey: queryKeys.chat.conversations(),
    queryFn: () => chatService.getConversations(),
    refetchInterval: 30_000,
  });

  const totalUnread = (query.data ?? []).reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    conversations: query.data ?? [],
    totalUnread,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
