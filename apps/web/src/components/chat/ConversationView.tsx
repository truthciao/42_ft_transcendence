import { Search } from 'lucide-react';
import {
  type SubmitEvent,
  type ReactNode,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getMyConversations,
  type ChatMessage,
} from '@/api/chat';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatScroll } from '@/hooks/useChatScroll';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { useChatRealtime } from '@/hooks/useChatRealtime';
import { useChatSendMessage } from '@/hooks/useChatSendMessage';
import { useChatRead } from '@/hooks/useChatRead';
import {
  FileUpload,
  type AttachmentType,
} from '@/components/common/FileUpload';
import { MessageSearchDialog } from './MessageSearchDialog';
import { MessageItem } from './MessageItem';

const API_BASE_URI = import.meta.env.VITE_API_URL ?? '/api';

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
  const { onlineUserIds } = useRealtime();

  const { data: conversations } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: getMyConversations,
  });

  const currentConversation = conversations?.find(
    (conversation) => Number(conversation.id) === Number(conversationId),
  );

  const otherMember = currentConversation?.members?.find(
    (member) => member.userId !== currentUser?.id,
  );

  const otherUserId = otherMember?.userId;
  const otherUserName = otherMember?.user.username;

  const isOtherUserOnline =
    otherUserId !== undefined && onlineUserIds.has(otherUserId);

  const {
    messages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(conversationId);

  const [inputText, setInputText] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    number | null
  >(null);

  useChatRealtime({
    conversationId,
  });

  useChatRead({
    conversationId,
  });

  const { 
    sendTextMessage, 
    sendFileMessage,
  } = useChatSendMessage({
    conversationId,
  });

  const {
    messagesContainerRef,
    previousScrollHeightRef,
  } = useChatScroll({
    conversationId,
    messages,
    isLoading,
  });


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
      const element = document.getElementById(`message-${message.id}`);

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
 
  function handleSendMessage(e: SubmitEvent) {
    e.preventDefault();

    const content = inputText.trim();

    if (!content) {
      return;
    }

    sendTextMessage(content);

    setInputText('');
  }

  const handleFileUploadSuccess = (attachment: AttachmentType) => {
    sendFileMessage(
      attachment.fileUrl,
      attachment.fileType,
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <header className="border-b border-border px-5 py-3 shadow-sm flex items-center justify-between">
        <h1 className="font-semibold text-sm flex items-center gap-2">
          {headerIcon ?? (
            <>
            <span
              className={`w-2 h-2 rounded-full ${
                isOtherUserOnline ? 'bg-success' : 'bg-muted-foreground'
              }`}
            />
            <span>
              {otherUserName
                ? t(
                    isOtherUserOnline ? 'chat.online' : 'chat.offline',
                    { friendName: otherUserName },
                  )
                : title}
            </span>
          </>
        )}
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
        className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4 [overflow-anchor:none]"
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
                  className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                >
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

              return (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  isMine={isMine}
                  senderLabel={senderLabel}
                  highlighted={highlightedMessageId === msg.id}
                  apiBaseUri={API_BASE_URI}
                  downloadLabel={t(
                    'chat.downloadFile',
                    'Download File',
                  )}
                />
              );
            })}
          </>
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t border-border p-4 bg-background"
      >
        <div className="flex gap-2 items-center">
          {/* 左侧：文件上传组件 */}
          <FileUpload
            onUploadSuccess={handleFileUploadSuccess}
            context="chat"
          />
          {/* 右侧：文本输入与发送按钮 */}
          <Input
            type="text"
            autoComplete="off"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('chat.placeholder', 'Type a message...')}
            className="flex-1 border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button type="submit">{t('chat.send', 'Send')}</Button>
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
