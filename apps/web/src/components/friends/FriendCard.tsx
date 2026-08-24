import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
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
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleOpenProfile = () => {
    navigate(`/app/friends/${friend.id}`);
  };

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
      <button
        type="button"
        className="flex items-center gap-3 text-left"
        onClick={handleOpenProfile}
      >
        <div className="relative shrink-0">
          <Avatar
            src={friend.avatarUrl}
            name={friend.username}
            size="md"
          />

          <span
            className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-background ${
              isOnline ? 'bg-success' : 'bg-muted'
            }`}
          />
        </div>

        <div>
          <div>
            <span className="font-medium hover:underline">
              {friend.username}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            {friend.email}
          </p>
        </div>
      </button>

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
