import { useUserSearch } from '../../hooks/useUserSearch';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  createConversationByUsername,
  type ConversationItem,
} from '../../api/chat';
import { SecondarySidebar } from '../layout/SecondarySidebar';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useConversationRealtime } from '@/hooks/useConversationRealtime';
import { ConversationListItem } from './ConversationListItem';
import { useAuth } from '../../hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { formatMessageTime } from '@/lib/formatMessageTime';
import { UserSearchDialog } from './UserSearchDialog';

const API_BASE_URI = import.meta.env.VITE_API_URL ?? '/api';

export function ConversationListSidebar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const { user: currentUser } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const { t } = useTranslation();

  const userSearch = useUserSearch(searchQuery);

  const searchResults =
    userSearch.data?.pages.flatMap((page) => page.users) ?? [];

  const {
    conversations,
    setConversations,
    isLoading,
  } = useConversations();

  useConversationRealtime({
    currentUserId: currentUser?.id,
    currentConversationId: Number(location.pathname.split('/').pop()),
    setConversations,
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

      setIsSearchOpen(false);
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
    <SecondarySidebar>
      <div className="flex h-full min-h-0 flex-col bg-background">
        <div className="border-b border-border p-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('chat.searchPeople')}
            </h2>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => setIsSearchOpen(true)}
              aria-label={t('chat.searchPeople')}
            >
              <Search className="size-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider flex items-center justify-between px-1">
            <span>{t('chat.conversations')}</span>
            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
              {conversations.length}
            </span>
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
                  apiBaseUri={API_BASE_URI}
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
        </div>
      </div>
        <UserSearchDialog
          open={isSearchOpen}
          searchQuery={searchQuery}
          isCreatingConversation={isCreatingConversation}
          searchResults={searchResults}
          isLoading={userSearch.isLoading}
          currentUserId={currentUser?.id}
          onOpenChange={(open) => {
            setIsSearchOpen(open);

            if (!open) {
              setSearchQuery('');
            }
          }}
          onSearchQueryChange={setSearchQuery}
          onUserSelect={handleUserSelect}
        />
    </SecondarySidebar>
  );
}
