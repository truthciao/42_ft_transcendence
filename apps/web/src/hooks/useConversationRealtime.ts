import { useEffect } from 'react';
import { getSocket } from '@/lib/realtime';
import type { ChatMessage, ConversationItem } from '@/api/chat';

interface UseConversationRealtimeProps {
  currentUserId?: number;
  currentConversationId: number;
  setConversations: React.Dispatch<
    React.SetStateAction<ConversationItem[]>
  >;
}

export function useConversationRealtime({
  currentUserId,
  currentConversationId,
  setConversations,
}: UseConversationRealtimeProps) {
  useEffect(() => {
    const socket = getSocket();

    const handleMessageCreated = (message: ChatMessage) => {
      setConversations((current) => {
        const updated = current.map((conversation) => {
          if (Number(conversation.id) !== message.conversationId) {
            return conversation;
          }

          const isMine = message.senderId === currentUserId;

          const isCurrentConversation =
            currentConversationId === message.conversationId;

          const currentUnreadCount = conversation.unreadCount ?? 0;

          return {
            ...conversation,
            lastMessage: {
              id: message.id,
              content: message.content,
              createdAt: message.createdAt,
              senderId: message.senderId,
            },
            updatedAt: message.createdAt,
            unreadCount:
              isMine || isCurrentConversation
                ? 0
                : currentUnreadCount + 1,
          };
        });

        const conversationIndex = updated.findIndex(
          (conversation) =>
            Number(conversation.id) === message.conversationId,
        );

        if (conversationIndex === -1) {
          return updated;
        }

        const [conversation] = updated.splice(
          conversationIndex,
          1,
        );

        return [conversation, ...updated];
      });
    };

    socket.on('chat:message:received', handleMessageCreated);

    return () => {
      socket.off('chat:message:received', handleMessageCreated);
    };
  }, [
    currentUserId,
    currentConversationId,
    setConversations,
  ]);
}