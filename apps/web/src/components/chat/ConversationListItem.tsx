import { Avatar } from '../common/Avatar';
import type { ConversationItem } from '@/api/chat';
import { useTranslation } from 'react-i18next';
import { useRealtime } from '@/hooks/useRealtime';

interface ConversationItemProps {
  conversation: ConversationItem;
  currentUserId?: number;
    formatMessageTime: (
    dateString: string,
    yesterdayLabel: string,
  ) => string;
  onSelectConversation: (conversation: ConversationItem) => void;
}

export function ConversationListItem({
  conversation,
  currentUserId,
  formatMessageTime,
  onSelectConversation,
}: ConversationItemProps) {
  const displayName =
    conversation.name || `Room ${conversation.id}`;

  const otherMember = conversation.members?.find(
    (member) => member.userId !== currentUserId,
  );

  const avatarUrl = otherMember?.user?.profile?.avatarUrl;

  const lastMessage = conversation.lastMessage;

  const unreadCount = conversation.unreadCount ?? 0;

  const { onlineUserIds } = useRealtime();

  const otherUserId = otherMember?.userId;

  const isOtherUserOnline =
    otherUserId !== undefined && onlineUserIds.has(otherUserId);

  const { t } = useTranslation();

  const lastMessageTime = lastMessage
  ? formatMessageTime(
      lastMessage.createdAt,
      t('chat.yesterday'),
    )
  : '';

  return (
    <div
      onClick={() => onSelectConversation(conversation)}
      className="flex items-center justify-between rounded-md px-2.5 py-2.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group"
    >
      <div className="font-medium flex items-center gap-2.5 min-w-0 flex-1">
        <Avatar
          src={avatarUrl}
          name={displayName}
          size="lg"
          status={isOtherUserOnline ? 'online' : 'offline'}
          unreadCount={unreadCount}
        />

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
                conversation.isFriend
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              {conversation.isFriend ? t('chat.friend') : t('chat.stranger')}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground truncate min-w-0">
              {lastMessage
                ? `${
                    lastMessage.senderId === currentUserId
                      ? t('chat.me')
                      : displayName
                  }: ${lastMessage.content}`
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

}