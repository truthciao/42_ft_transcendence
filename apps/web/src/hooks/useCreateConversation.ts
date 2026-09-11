import { useState } from 'react';
import {
  createConversationByUsername,
  type ConversationItem,
} from '@/api/chat';

export function useCreateConversation(
  setConversations: React.Dispatch<
    React.SetStateAction<ConversationItem[]>
  >,
) {
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const createConversation = async (username: string) => {
    if (isCreatingConversation) {
      return null;
    }

    try {
      setIsCreatingConversation(true);

      const conversation = await createConversationByUsername(username);

      if (!conversation?.id) {
        return null;
      }

      setConversations((current) => {
        const existingIndex = current.findIndex(
          (item) => Number(item.id) === Number(conversation.id),
        );

        if (existingIndex !== -1) {
          const existing = current[existingIndex];

          const updated = {
            ...existing,
            updatedAt: conversation.updatedAt ?? existing.updatedAt,
          };

          return [
            updated,
            ...current.filter((_, index) => index !== existingIndex),
          ];
        }

        return [conversation as ConversationItem, ...current];
      });

      return conversation;
    } catch (error) {
      console.error('Cannot create conversation:', error);
      return null;
    } finally {
      setIsCreatingConversation(false);
    }
  };

  return {
    createConversation,
    isCreatingConversation,
  };
}