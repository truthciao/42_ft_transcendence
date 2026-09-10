import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import type { ChatMessage, MessagePage } from '@/api/chat';
import { getSocket } from '@/lib/realtime';
import { markConversationAsRead } from '@/api/chat';
import { mergeMessages } from '@/lib/chat-messages';

interface UseChatRealtimeProps {
  conversationId: string;
}

export function useChatRealtime({
  conversationId,
}: UseChatRealtimeProps) {

  console.log('[useChatRealtime] render', conversationId);


  const queryClient = useQueryClient();

  useEffect(() => {
     console.log('[useChatRealtime] effect', conversationId);

     const socket = getSocket();

    const joinConversation = () => {
      socket.emit('chat:conversation:join', {
        conversationId: Number(conversationId),
      });
    };

    if (socket.connected) {
      joinConversation();
    } else {
      socket.once('connect', joinConversation);
    }

    const handleMessageCreated = (message: ChatMessage) => {
      if (message.conversationId.toString() !== conversationId) {
        return;
      }

      queryClient.setQueryData<InfiniteData<MessagePage>>(
        ['chat-messages', conversationId],
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page, index) => {
              if (index !== 0) {
                return page;
              }

              return {
                ...page,
                messages: mergeMessages(page.messages, message),
              };
            }),
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey: ['chat-message-search', conversationId],
      });

      markConversationAsRead(conversationId)
        .then(() => {
          window.dispatchEvent(
            new CustomEvent('refresh_conversations'),
          );
        })
        .catch((error) => {
          console.error(
            'Failed to mark conversation as read:',
            error,
          );
        });
    };

    console.log('[useChatRealtime] register message listener');

    socket.on('chat:message:created', handleMessageCreated);

    return () => {
      socket.emit('chat:conversation:leave', {
        conversationId: Number(conversationId),
      });

      socket.off('chat:message:received', handleMessageCreated);
      socket.off('connect', joinConversation);
    };
  }, [conversationId, queryClient]);
}