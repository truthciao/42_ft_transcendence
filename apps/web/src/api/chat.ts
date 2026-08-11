import { httpGet, httpPost } from '../lib/http'; // 复用项目已有的通用请求工具

export interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  createdAt: string;
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
}

export async function getFriendsList() {
  return httpGet('/friends'); 
}

export async function createDirectConversation(targetUserId: number): Promise<Conversation> {
  return httpPost<Conversation>('/chat/conversations', { targetUserId });
}

export async function getConversationMessages(conversationId: string | number): Promise<ChatMessage[]> {
  return httpGet<ChatMessage[]>(`/chat/conversations/${conversationId}/message`);
}