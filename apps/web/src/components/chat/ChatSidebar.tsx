import { useUserSearch } from '../../hooks/useUserSearch';
import {
  Search,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { getMyConversations, createConversationByUsername, type ConversationItem } from '../../api/chat';
import { SecondarySidebar } from '../layout/SecondarySidebar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getSocket } from '@/lib/realtime';
import type { ChatMessage } from '@/api/chat';

const API_BASE_URI =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function ConversationListSidebar() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] =
    useState(false);

  const { user: currentUser } = useAuth();

  const navigate = useNavigate();

  const { t } = useTranslation();

  const userSearch = useUserSearch(searchQuery);

  const searchResults =
    userSearch.data?.pages.flatMap((page) => page.users) ?? [];

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
    const socket = getSocket();

    const currentConversationId = Number(
      location.pathname.split('/').pop(),
    );

    const handleMessageCreated = (message: ChatMessage) => {  
      setConversations((current) => {
        const updated = current.map((conversation) => {
          if (Number(conversation.id) !== message.conversationId) {
            return conversation;
          }

          const isMine = message.senderId === currentUser?.id;

          const isCurrentConversation =
            currentConversationId === message.conversationId;

          const currentUnreadCount =
            conversation.unreadCount ?? 0;

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
  }, [currentUser?.id, location.pathname]);


  useEffect(() => {
    fetchConversations();

    const handleRefreshConversations = () => {
      fetchConversations();
    };

    const handleUserProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        userId: number;
        avatarUrl: string;
      }>;

      const { userId, avatarUrl } = customEvent.detail;

      setConversations((current) => {
        return current.map((conversation) => ({
          ...conversation,
          members: conversation.members?.map((member) => {
            if (member.userId !== userId) {
              return member;
            }

            return {
              ...member,
              user: {
                ...member.user,
                profile: {
                  ...(member.user.profile ?? {}),
                  avatarUrl,
                },
              },
            };
          }),
        }));
      });
    };

  window.addEventListener(
    'refresh_conversations',
    handleRefreshConversations,
  );

  window.addEventListener(
    'user_profile_updated',
    handleUserProfileUpdated,
  );

  return () => {
    window.removeEventListener(
      'refresh_conversations',
      handleRefreshConversations,
    );

    window.removeEventListener(
      'user_profile_updated',
      handleUserProfileUpdated,
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

    window.addEventListener(
      'conversation_read',
      handleConversationRead,
    );

    return () => {
      window.removeEventListener(
        'conversation_read',
        handleConversationRead,
      );
    };
  }, []);

    const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return t('chat.yesterday');
    }

    return date.toLocaleDateString([], {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleUserSelect = async (username: string) => {
    if (isCreatingConversation) {
      return;
    }

    try {
      setIsCreatingConversation(true);

      const conversation =
        await createConversationByUsername(username);

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
            updatedAt:
              conversation.updatedAt ?? existing.updatedAt,
          };

          return [
            updated,
            ...current.filter(
              (_, index) => index !== existingIndex,
            ),
          ];
        }

        const newConversation =
          conversation as ConversationItem;

        return [
          newConversation,
          ...current,
        ];
      });

      setIsSearchOpen(false);
      setSearchQuery('');

      navigate(`/app/chat/${conversation.id}`, {
        state: {
          friendName: username,
        },
      });
    } catch (error) {
      console.error(
        'Cannot create conversation:',
        error,
      );
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
              aria-label="Search users"
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
              {conversations.map((conv) => {
                const displayName = conv.name || t('chat.room', { id: conv.id });
                const avatarLetter = displayName.charAt(0).toUpperCase();

                const otherMember = conv.members?.find(
                  (member) => member.userId !== currentUser?.id
                );

                const avatarUrl = otherMember?.user.profile?.avatarUrl
                  ? `${API_BASE_URI}${otherMember.user.profile.avatarUrl}`
                  : undefined; 

                const lastMessage = conv.lastMessage;
 
                const unreadCount = conv.unreadCount ?? 0;

                const lastMessageTime = lastMessage
                    ? formatMessageTime(lastMessage.createdAt)
                  : '';

                return (
                  <div
                    key={conv.id}
                 onClick={() => {
                  setConversations((current) =>
                    current.map((conversation) =>
                      Number(conversation.id) === Number(conv.id)
                        ? {
                            ...conversation,
                            unreadCount: 0,
                            lastReadMessageId: conversation.lastMessage?.id ?? null,
                          }
                        : conversation,
                    ),
                  );

                  navigate(`/app/chat/${conv.id}`, {
                    state: { friendName: conv.name },
                  });
                }} 
                           
                    className="flex items-center justify-between rounded-md px-2.5 py-2.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group"
                  >
                    <div className="font-medium flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <Avatar className="size-10">
                          {avatarUrl && (
                            <AvatarImage
                              src={avatarUrl}
                              alt={displayName}
                            />
                          )}

                          <AvatarFallback
                            className={
                              conv.isFriend
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {avatarLetter}
                          </AvatarFallback>
                        </Avatar>

                        {unreadCount > 0 && (
                          <span
                            className="absolute -right-0.5 -bottom-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-background"
                            aria-label={`${unreadCount} unread messages`}
                          >
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>

                        <div className="flex flex-col min-w-0 flex-1">

                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm truncate ${
                                unreadCount > 0 ? 'font-bold' : 'font-medium'
                              }`}
                            >
                              {displayName}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 font-normal ${
                                conv.isFriend
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {conv.isFriend ? t('chat.friend') : t('chat.stranger')}
                            </span> 
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground truncate min-w-0">
                              {lastMessage
                                ? `${lastMessage.senderId === currentUser?.id
                                    ? t('chat.me')
                                    : displayName}: ${lastMessage.content}`
                                : t('chat.empty')}
                            </span>

                            {lastMessageTime && (
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {lastMessageTime}
                              </span>
                            )}
                          </div>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )} 
        </div>
      </div>
        <Dialog
          open={isSearchOpen}
          onOpenChange={(open) => {
            setIsSearchOpen(open);

            if (!open) {
              setSearchQuery('');
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Search people
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder="Search username..."
                  className="pl-9"
                />
              </div>

              {searchQuery.trim().length < 2 && (
                <p className="text-xs text-muted-foreground">
                  Enter at least 2 characters to search.
                </p>
              )}

              {userSearch.isLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}

              {!userSearch.isLoading &&
                searchQuery.trim().length >= 2 &&
                searchResults.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No users found.
                  </p>
                )}

              <div className="max-h-80 overflow-y-auto space-y-1">
                {searchResults.map((user) => {
                  const displayName = user.username;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      disabled={
                        isCreatingConversation ||
                        user.id === currentUser?.id
                      }
                      onClick={() =>
                        handleUserSelect(user.username)
                      }
                      className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent disabled:opacity-50"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {displayName}
                        </div>

                        <div className="truncate text-xs text-muted-foreground">
                          @{user.username}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </SecondarySidebar>
    );
}