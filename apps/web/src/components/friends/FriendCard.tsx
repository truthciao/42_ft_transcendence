import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { Friend } from '@repo/shared-types';
import { Avatar } from '@/components/common/Avatar';

interface FriendCardProps {
  friend: Friend;
  isOnline: boolean;
  isRemoving: boolean;
  onRemove: (friendId: number) => void;
}

export function FriendCard({
  friend,
  isOnline,
  isRemoving,
  onRemove,
}: FriendCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className="
        flex
        items-center
        justify-between
        rounded-lg
        border
        p-4
      "
    >
      <Link
        to={`/app/friends/${friend.id}`}
        className="flex items-center gap-3 text-left"
      >
        <Avatar
          src={friend.avatarUrl}
          name={friend.username}
          size="md"
          status={isOnline ? 'online' : 'offline'}
        />

        <div>
          <div className="font-medium hover:underline">
            {friend.username}
          </div>

          <p className="text-sm text-muted-foreground">
            {friend.email}
          </p>
        </div>
      </Link>

      <button
        type="button"
        className="
          rounded
          border
          px-3
          py-1
          text-destructive
          transition-colors
          hover:bg-destructive/10
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
        disabled={isRemoving}
        onClick={() => onRemove(friend.id)}
      >
        {isRemoving
          ? t('friends.removeFriend.removing')
          : t('friends.removeFriend.confirm')}
      </button>
    </div>
  );
}
