import { useNavigate } from "react-router";
import type { Friend } from '@repo/shared-types';

interface FriendCardProps {
  friend: Friend;
  isRemoving: boolean;
  onRemove: (friendId: number) => void;
}

export function FriendCard({ friend, isRemoving, onRemove }: FriendCardProps) {
  const navigate = useNavigate();

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
      <div>
        <p className="font-medium">{friend.username}</p>

        <p className="text-sm text-muted-foreground">{friend.email}</p>
      </div>
      
      <button
        type="button"
        className="
          text-left
          hover:underline
        "
        onClick={handleOpenProfile}
      >
        <p className="font-medium">{friend.username}</p>

        <p className="text-sm text-muted-foreground">
          {friend.email}
        </p>
      </button>

      <button
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
        {isRemoving ? 'Removing...' : 'Remove'}
      </button>
    </div>
  );
}
