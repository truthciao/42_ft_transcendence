import { useState } from 'react';
import { useFriends } from '../../hooks/useFriends';
import { useRemoveFriend } from '../../hooks/useFriendMutations';
import { FriendCard } from './FriendCard';
import { useConfirm } from '@/lib/confirm-context';
import { toast, Toaster } from 'sonner';

export function FriendList() {
  const { data: friends, isLoading, isError } = useFriends();

  const removeFriendMutation = useRemoveFriend();

  const confirm = useConfirm();

  const [removingFriendId, setRemovingFriendId] = useState<number | null>(null);

  const handleRemoveFriend = async (friendId: number) => {
    const confirmed = await confirm({
      title: 'Remove friend?',
      description: 'Are you sure you want to remove this friend?',
      confirmLabel: 'Remove',
      variant: 'destructive',
    });

    if (!confirmed) {
      return;
    }
    
    setRemovingFriendId(friendId);

    removeFriendMutation.mutate(friendId, {
      onSuccess: () => {
        toast.success('Friend removed');
      },
      onError: () => {
        toast.error('Failed to remove friend');
      },
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
