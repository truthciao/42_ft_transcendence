import type { ChatMessage } from '../api/chat';

export function mergeMessages(
  existing: ChatMessage[],
  incoming: ChatMessage | ChatMessage[],
): ChatMessage[] {
  const incomingMessages = Array.isArray(incoming) ? incoming : [incoming];

  const messages = [...existing, ...incomingMessages];

  const uniqueMessages = Array.from(
    new Map(messages.map((message) => [message.id, message])).values(),
  );

  return uniqueMessages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}
