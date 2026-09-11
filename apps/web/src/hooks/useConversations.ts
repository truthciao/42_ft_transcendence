import { useEffect, useState } from 'react';
import {
  getMyConversations,
  type ConversationItem,
} from '@/api/chat';

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);

      const dataList = await getMyConversations();

      if (Array.isArray(dataList)) {
        const directConversations = dataList.filter(
          (conversation) => conversation.type === 'DIRECT',
        );

        setConversations(directConversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    const handleRefreshConversations = () => {
      fetchConversations();
    };

    window.addEventListener(
      'refresh_conversations',
      handleRefreshConversations,
    );

    return () => {
      window.removeEventListener(
        'refresh_conversations',
        handleRefreshConversations,
      );
    };
  }, []);

  useEffect(() => {
    const handleConversationRead = (event: Event) => {
      const customEvent = event as CustomEvent<{
        conversationId: number;
      }>;

      const conversationId = customEvent.detail.conversationId;

      setConversations((current) =>
        current.map((conversation) => {
          if (Number(conversation.id) !== conversationId) {
            return conversation;
          }

          const lastMessage = conversation.lastMessage;

          return {
            ...conversation,
            lastReadMessageId: lastMessage?.id ?? null,
            unreadCount: 0,
          };
        }),
      );
    };

    window.addEventListener('conversation_read', handleConversationRead);

    return () => {
      window.removeEventListener('conversation_read', handleConversationRead);
    };
  }, []);

  return {
    conversations,
    setConversations,
    isLoading,
    fetchConversations,
  };
}