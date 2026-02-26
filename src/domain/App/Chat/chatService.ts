import {chatAPI} from './chatAPI';
import {ChatMessage, Conversation} from './chatTypes';

export const chatService = {
  getConversations(): Promise<Conversation[]> {
    return chatAPI.getConversations();
  },

  getMessages(bookingId: string, since?: string): Promise<ChatMessage[]> {
    return chatAPI.getMessages(bookingId, since);
  },

  sendMessage(bookingId: string, content: string): Promise<ChatMessage> {
    return chatAPI.sendMessage(bookingId, content);
  },

  markRead(bookingId: string): Promise<{marked: number}> {
    return chatAPI.markRead(bookingId);
  },
};
