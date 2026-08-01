export const CHAT_ROOM_PREFIX = 'chat';

export function getChatRoom(conversationId: number): string {
  return `${CHAT_ROOM_PREFIX}:${conversationId}`;
}
