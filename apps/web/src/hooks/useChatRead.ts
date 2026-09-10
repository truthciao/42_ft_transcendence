import { useEffect } from 'react';
import { markConversationAsRead } from '@/api/chat';

interface UseChatReadProps {
  conversationId: string;
}

export function useChatRead({
  conversationId,
}: UseChatReadProps) {
  useEffect(() => {
    markConversationAsRead(conversationId)
      .then(() => {
        window.dispatchEvent(
          new CustomEvent('conversation_read', {
            detail: {
              conversationId: Number(conversationId),
            },
          }),
        );
      })
      .catch((error) => {
        console.error(
          'Failed to mark conversation as read:',
          error,
        );
      });
  }, [conversationId]);
}
