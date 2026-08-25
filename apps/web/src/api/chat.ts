import { httpGet, httpPost } from '../lib/http'; // 复用项目已有的通用请求工具

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

export async function getConversationMessages(conversationId: string | number): Promise<ChatMessage[]> {
  return httpGet<ChatMessage[]>(`/chat/conversations/${conversationId}/message`);
}
