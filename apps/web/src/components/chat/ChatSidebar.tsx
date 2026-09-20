import { useUserSearch } from '../../hooks/useUserSearch';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  createConversationByUsername,
  type ConversationItem,
} from '../../api/chat';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useConversationRealtime } from '@/hooks/useConversationRealtime';
import { ConversationListItem } from './ConversationListItem';
import { useAuth } from '../../hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { formatMessageTime } from '@/lib/formatMessageTime';

export function ConversationListSidebar() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const { user: currentUser } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const { t } = useTranslation();

  const userSearch = useUserSearch(searchQuery);

  const searchResults =
    userSearch.data?.pages.flatMap((page) => page.users) ?? [];
  const trimmedSearchQuery = searchQuery.trim();
  const {
    conversations,
    setConversations,
    isLoading,
    fetchConversations,
  } = useConversations();

  useConversationRealtime({
    currentUserId: currentUser?.id,
    currentConversationId: Number(location.pathname.split('/').pop()),
    setConversations,
    fetchConversations,
  });

  const handleUserSelect = async (username: string) => {
    if (isCreatingConversation) {
      return;
    }

    try {
      setIsCreatingConversation(true);

      const conversation = await createConversationByUsername(username);

      if (!conversation?.id) {
        return;
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

        const newConversation = conversation as ConversationItem;

        return [newConversation, ...current];
      });

      await queryClient.invalidateQueries({
        queryKey: ['chat-conversations'],
      });
      
      setSearchQuery('');

      navigate(`/app/chat/${conversation.id}`, {
        state: {
          friendName: username,
        },
      });
    } catch (error) {
      console.error('Cannot create conversation:', error);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t('chat.usernamePlaceholder')}
            autoComplete="off"
            className="pl-9"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {trimmedSearchQuery ? (
          <div className="space-y-2">
            {trimmedSearchQuery.length < 2 && (
              <p className="text-xs text-muted-foreground">
                {t('chat.searchDescription')}
              </p>
            )}

            {userSearch.isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}

            {!userSearch.isLoading &&
              trimmedSearchQuery.length >= 2 &&
              searchResults.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t('chat.noUsersFound')}
                </p>
              )}

            <div className="space-y-1">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  disabled={
                    isCreatingConversation || user.id === currentUser?.id
                  }
                  onClick={() => handleUserSelect(user.username)}
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent disabled:opacity-50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {user.username}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      @{user.username}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2 px-1 text-xs font-semibold tracking-wider text-muted-foreground">
              {t('chat.conversations')}
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={currentUser?.id}
                    formatMessageTime={(dateString) =>
                      formatMessageTime(dateString, t('chat.yesterday'))
                    }
                    onSelectConversation={(conversation) => {
                      setConversations((current) =>
                        current.map((item) =>
                          Number(item.id) === Number(conversation.id)
                            ? {
                                ...item,
                                unreadCount: 0,
                                lastReadMessageId:
                                  item.lastMessage?.id ?? null,
                              }
                            : item,
                        ),
                      );

                      navigate(`/app/chat/${conversation.id}`, {
                        state: { friendName: conversation.name },
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
