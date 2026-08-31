import { httpGet, httpPatch, httpPost } from '../lib/http'; 

export interface ChatMessage {
  id: number;
  conversationId: number;
  content: string;
  senderId: number;
  createdAt: string;
  sender?: {
    id: number;
    username: string;
  }
}

export interface AcceptedFriend {
  id: number;
  username: string;
  avatarUrl?: string;
}

export interface Conversation {
  id: string | number;
  type?: string;
  name?: string;
  isFriend?: boolean;
  createdAt?: string;
  updatedAt?: string;

  lastReadMessageId?: number | null;
  unreadCount?: number;

  lastMessage?: {
    id: number,
    content: string;
    createdAt: string;
    senderId: number;
  } | null;

  members?: Array<{
    userId: number;
    user: {
      id: number;
      username: string;
      profile?: {
        displayName?: string;
        avatarUrl?: string;
      } | null;
    };
  }>;
}

export interface MessagePage {
  messages: ChatMessage[];
  nextCursor: number | null;
}

export type ConversationItem = Conversation;

export async function getMyConversations(): Promise<ConversationItem[]> {
  return httpGet<ConversationItem[]>('/chat/conversations');
}

export async function getFriendsList() {
  return httpGet('/friends');
}

export async function createConversationByUsername(username: string): Promise<Conversation> {
  return httpPost<Conversation>('/chat/conversations/by-username', { username });
}

export async function createDirectConversation(targetUserId: number): Promise<Conversation> {
  return httpPost<Conversation>('/chat/conversations', { targetUserId });
}

export async function getConversationMessages(
  conversationId: string | number,
  cursor?: number,
  limit = 30,
): Promise<MessagePage> {
  const params = new URLSearchParams();

  params.set('limit', String(limit));

  if (cursor !== undefined) {
    params.set('cursor', String(cursor));
  }

  return httpGet<MessagePage>(
    `/chat/conversations/${conversationId}/message?${params.toString()}`,
  );
}

export async function searchConversationMessages(
  conversationId: string | number,
  query: string,
): Promise<ChatMessage[]> {
  const params = new URLSearchParams();

  params.set('q', query.trim());

  return httpGet<ChatMessage[]>(
    `/chat/conversations/${conversationId}/messages/search?${params.toString()}`,
  );
}

export async function markConversationAsRead(
  conversationId: string | number,
) {
  return httpPatch(
    `/chat/conversations/${conversationId}/message`,
  );
}