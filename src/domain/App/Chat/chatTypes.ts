export type SenderRole = 'passenger' | 'captain';

export interface ChatMessage {
  id: string;
  bookingId: string;
  content: string;
  senderRole: SenderRole;
  senderId: string;
  senderName?: string;
  createdAt: string;
  readAt: string | null;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatarUrl?: string | null;
  role: SenderRole;
}

export interface Conversation {
  bookingId: string;
  trip: {
    origin: string;
    destination: string;
    departureAt: string;
  };
  otherParticipant: ChatParticipant;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

export interface SendMessageData {
  content: string;
}
