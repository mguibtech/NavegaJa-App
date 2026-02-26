import {apiClient} from '../../../api/apiClient';
import {API_ENDPOINTS} from '../../../api/config';
import {ChatMessage, Conversation} from './chatTypes';

export const chatAPI = {
  getConversations(): Promise<Conversation[]> {
    return apiClient.get<Conversation[]>(API_ENDPOINTS.CHAT_CONVERSATIONS);
  },

  getMessages(bookingId: string, since?: string): Promise<ChatMessage[]> {
    const endpoint = API_ENDPOINTS.CHAT_MESSAGES(bookingId);
    const params = new URLSearchParams({limit: '50'});
    if (since) {
      params.append('since', since);
    }
    return apiClient.get<ChatMessage[]>(`${endpoint}?${params.toString()}`);
  },

  sendMessage(bookingId: string, content: string): Promise<ChatMessage> {
    return apiClient.post<ChatMessage>(API_ENDPOINTS.CHAT_MESSAGES(bookingId), {content});
  },

  markRead(bookingId: string): Promise<{marked: number}> {
    return apiClient.patch<{marked: number}>(API_ENDPOINTS.CHAT_READ(bookingId), {});
  },
};
