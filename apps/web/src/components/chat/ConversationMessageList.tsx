import { type TFunction } from 'i18next';
import type { ChatMessage } from '@/api/chat';
import { Button } from '@/components/ui/button';
import { MessageItem } from './MessageItem';

interface ConversationMessageListProps {
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messages: ChatMessage[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadOlderMessages: () => void;
  currentUserId?: number;
  highlightedMessageId: number | null;
  apiBaseUri: string;
  t: TFunction;
}

export function ConversationMessageList({
  messagesContainerRef,
  messages,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadOlderMessages,
  currentUserId,
  highlightedMessageId,
  apiBaseUri,
  t,
}: ConversationMessageListProps) {
  return (
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
                onClick={onLoadOlderMessages}
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
            const isMine = msg.senderId === currentUserId;

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
                apiBaseUri={apiBaseUri}
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
  );
}