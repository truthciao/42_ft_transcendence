import { useState } from 'react';
import { useFriends } from '../../hooks/useFriends';
import { useRemoveFriend } from '../../hooks/useFriendMutations';
import { FriendCard } from './FriendCard';

export function FriendList() {
  const { data: friends, isLoading, isError } = useFriends();

  const removeFriendMutation = useRemoveFriend();

  const [removingFriendId, setRemovingFriendId] = useState<number | null>(null);

  const handleRemoveFriend = (friendId: number) => {
    setRemovingFriendId(friendId);

    removeFriendMutation.mutate(friendId, {
      onSettled: () => {
        setRemovingFriendId(null);
      },
    });
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading friends...</p>;
  }

  if (isError) {
    return <p className="text-destructive">Failed to load friends.</p>;
  }

  if (!friends || friends.length === 0) {
    return (
      <p className="text-muted-foreground">You don't have any friends yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map((friend) => (
        <FriendCard
          key={friend.id}
          friend={friend}
          isRemoving={
            removeFriendMutation.isPending && removingFriendId === friend.id
          }
          onRemove={handleRemoveFriend}
        />
      ))}
    </div>
  );
}
