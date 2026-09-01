import { Search } from 'lucide-react';
import {
  type SubmitEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
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
import { FileUpload, type AttachmentType } from '@/components/common/FileUpload';

// 新增：定义后端服务器的地址
const API_BASE_URI = import.meta.env.VITE_API_URL ?? '/api';
import { MessageSearchDialog } from './MessageSearchDialog';

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
  const [highlightedMessageId, setHighlightedMessageId] = useState<number | null>(null);

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
    queryKey: ['chat-messages', conversationId],

    queryFn: ({ pageParam }) =>
      getConversationMessages(
        conversationId,
        pageParam,
        30,
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

  const handleSelectMessage = async (message: ChatMessage) => {
    setIsSearchOpen(false);

    while (!document.getElementById(`message-${message.id}`) && hasNextPage) {
      previousScrollHeightRef.current =
        messagesContainerRef.current?.scrollHeight ?? null;

      const result = await fetchNextPage();

      const loadedMessages =
        result.data?.pages.flatMap((page) => page.messages) ?? [];

      if (loadedMessages.some((msg) => msg.id === message.id)) {
        break;
      }

      if (!result.hasNextPage) {
        break;
      }
    }

    requestAnimationFrame(() => {
      const element = document.getElementById(
        `message-${message.id}`,
      );

      if (!element) {
        return;
      }

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      setHighlightedMessageId(message.id);

      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    });
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

  const messages = useMemo(
    () =>
      data?.pages
        .flatMap((page) => page.messages)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime(),
        ) ?? [],
    [data],
  );
 
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
        console.error('Failed to mark conversation as read:', error);
      });
  };

    socket.on('chat:message:received', handleMessageCreated);

    return () => {
      socket.off('chat:message:received', handleMessageCreated);
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
      type: 'text'
    });

    setInputText('');
  }

  // 发送文件消息
  const handleFileUploadSuccess = (attachment: AttachmentType) => {
    const socket = getSocket();
    const messageType = attachment.fileType.startsWith('image/') ? 'image' : 'file';

    socket.emit('chat:message:send', {
      conversationId: Number(conversationId),
      content: attachment.fileUrl, 
      type: messageType,
    });
  };

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
        onClick={() => setIsSearchOpen(true)} 
        aria-label={t('chat.searchMessages')}
      >
        <Search className="size-4" />
      </Button>
    </header>

      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4"
      >

        {isLoading ? (
          <div className="text-center text-muted-foreground text-sm">
            {t('chat.loadingHistory', 'Loading history...')}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm">
            {t('chat.empty', 'No message history. Say hi below!')}
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
                  className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
                  {isFetchingNextPage
                    ? t('chat.loading')
                    : t('chat.loadOlderMessages')}
                </Button>
              </div>
            )}

            {messages.map((msg) => {
              const isMine = msg.senderId === currentUser?.id;
              const senderLabel = isMine
                ? t('chat.me', 'Me')
                : (msg.sender?.username ?? t('chat.user', 'User'));

              // 🛠️ 新增：智能嗅探真实的消息类型 (绕过后端缺陷)
              const isImageUrl = msg.content.startsWith('/uploads/') && msg.content.match(/\.(jpeg|jpg|gif|png|webp)$/i);
              const isFileUrl = msg.content.startsWith('/uploads/') && !isImageUrl;
              
              // 决定最终的渲染类型
              const renderType = (msg.type === 'image' || isImageUrl) ? 'image' 
                               : (msg.type === 'file' || isFileUrl) ? 'file' 
                               : 'text';

              return (
                <div
                  key={msg.id}
                  id={`message-${msg.id}`}
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
                    } ${
                      highlightedMessageId === msg.id
                        ? 'ring-2 ring-amber-400 shadow-md shadow-amber-400/30'
                        : ''
                    }`}
                  >
                    {/* 🛠️ 修改：使用我们刚刚计算出的 renderType 来判断 ; 分支渲染：处理不同类型的消息内容 */}
                    {renderType === 'image' ? (
                       <img src={`${API_BASE_URI}${msg.content}`} alt="attachment" className="max-w-full rounded-md cursor-pointer hover:opacity-90" />
                    ) : renderType === 'file' ? (
                       <a href={`${API_BASE_URI}${msg.content}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline underline-offset-2">
                         📎 {t('chat.downloadFile', 'Download File')}
                       </a>
                    ) : (
                      msg.content
                    )}

                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-border p-4 bg-background">
        <div className="flex gap-2 items-center">

          {/* 左侧：文件上传组件 */}
          <FileUpload onUploadSuccess={handleFileUploadSuccess} context="chat" />
          {/* 右侧：文本输入与发送按钮 */}
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('chat.placeholder', 'Type a message...')}
            className="flex-1 border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button type="submit">
            {t('chat.send', 'Send')}
          </Button>
        </div>
      </form>
        <MessageSearchDialog
            open={isSearchOpen}
            onOpenChange={setIsSearchOpen}
            conversationId={conversationId}
            onSelectMessage={handleSelectMessage}
        />
    </section>
  );
}
