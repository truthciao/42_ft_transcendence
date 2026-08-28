import { Search, X } from 'lucide-react';
import {
  type SubmitEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getSocket } from "@/lib/realtime";
import { 
  getConversationMessages,
  markConversationAsRead,
  type ChatMessage,
  type MessagePage } from "@/api/chat";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/hooks/useAuth";
import { mergeMessages } from "@/lib/chat-messages"
import type { InfiniteData } from "@tanstack/react-query";

interface ConversationViewProps {
  conversationId: string;
  title: ReactNode;
  headerIcon?: ReactNode;
}

export function ConversationView({
  conversationId,
  title,
  headerIcon,
}: ConversationViewProps) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [inputText, setInputText] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const previousScrollHeightRef = useRef<number | null>(null);

  const shouldScrollToBottomRef = useRef(true);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['chat-messages', conversationId, activeSearch],

    queryFn: ({ pageParam }) =>
      getConversationMessages(
        conversationId,
        pageParam,
        30,
        searchQuery,
      ),

    initialPageParam: undefined as number | undefined,

    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor ?? undefined;
    },

  });

  const isNearBottom = (container: HTMLDivElement) => {
    const threshold = 100;

    return (
      container.scrollHeight -
        container.scrollTop -
        container.clientHeight <
      threshold
    );
  };

  const handleLoadOlderMessages = () => {
    const container = messagesContainerRef.current;

    if (!container || isFetchingNextPage || !hasNextPage) {
      return;
    }

    previousScrollHeightRef.current = container.scrollHeight;

    fetchNextPage();
  };

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      shouldScrollToBottomRef.current = isNearBottom(container);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const messages = data?.pages
    .flatMap((page) => page.messages)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    ) ?? [];

    const isSearchMode = activeSearch.trim().length > 0;
    
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const previousScrollHeight = previousScrollHeightRef.current;

    if (previousScrollHeight === null) {
      return;
    }

    const heightDifference =
      container.scrollHeight - previousScrollHeight;

    container.scrollTop += heightDifference;

    previousScrollHeightRef.current = null;
 
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container || isLoading) {
      return;
    }

    if (previousScrollHeightRef.current !== null) {
      return;
    }

    if (shouldScrollToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [conversationId, isLoading, messages.length]);

  useEffect(() => {
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

    markConversationAsRead(conversationId)
      .then(() => {
        window.dispatchEvent(
          new CustomEvent('refresh_conversations'),
        );
      })
      .catch((error) => {
        console.error('Failed to mark conversation as read:', error);
      });
  };

    socket.on('chat:message:created', handleMessageCreated);

    return () => {
      socket.off('chat:message:created', handleMessageCreated);
      socket.off('connect', joinConversation);
    };
  }, [conversationId, queryClient]);

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
        console.error('Failed to mark conversation as read:', error);
      });
  }, [conversationId]);


  function handleSendMessage(e: SubmitEvent) {
    e.preventDefault();

    const content = inputText.trim();

    if (!content) {
      return;
    }

    const socket = getSocket();

    socket.emit('chat:message:send', {
      conversationId: Number(conversationId),
      content,
    });

    setInputText('');
  }
  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <header className="border-b border-border px-5 py-3 shadow-sm flex items-center justify-between">
      <h1 className="font-semibold text-sm flex items-center gap-2">
        {headerIcon ?? <span className="w-2 h-2 rounded-full bg-success" />}
        {title}
      </h1>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => setIsSearchOpen((current) => !current)}
        aria-label="Search messages"
      >
        <Search className="size-4" />
      </Button>
    </header>

    {isSearchOpen && (
      <div className="border-b border-border px-5 py-2 bg-muted/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />


          <Input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setActiveSearch(searchQuery.trim());
              }
            }}
            placeholder="Search messages..."
            className="pl-9 pr-9"
          />
              
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
            onClick={() => {
              setSearchQuery('');
              setActiveSearch('');
              setIsSearchOpen(false);
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    )}



      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4"
      >
        {isSearchMode && !isLoading && (
          <div className="mb-4 text-xs text-muted-foreground">
            {messages.length === 0
              ? `No messages found for "${activeSearch}"`
              : `${messages.length} ${
                messages.length === 1 ? 'message' : 'messages'
                } found`}
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-muted-foreground text-sm">
            {t('chat.loadingHistory')}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm">
            {t('chat.empty')}
          </div>
        ) : (
          <>
            {hasNextPage && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleLoadOlderMessages}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage
                    ? 'Loading...'
                    : 'Load older messages'}
                </Button>
              </div>
            )}

            {messages.map((msg) => {
              const isMine = msg.senderId === currentUser?.id;
              const senderLabel = isMine
                ? t('chat.me')
                : (msg.sender?.username ?? t('chat.user'));

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col mb-2 ${
                    isMine ? 'items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[10px] text-muted-foreground mb-1">
                    {senderLabel}
                  </span>

                  <div
                    className={`p-2.5 rounded-lg max-w-[70%] w-fit text-sm break-words ${
                      isMine
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-accent-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-border p-4 bg-background">
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('chat.placeholder')}
            className="flex-1 border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button type="submit">
            {t('chat.send')}
          </Button>
        </div>
      </form>
    </section>
  );

}
