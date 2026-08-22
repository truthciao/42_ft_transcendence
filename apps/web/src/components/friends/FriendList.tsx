import { useState } from 'react';
import { useFriends } from '../../hooks/useFriends';
import { useRemoveFriend } from '../../hooks/useFriendMutations';
import { FriendCard } from './FriendCard';
import { useConfirm } from '@/lib/confirm-context';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useRealtime } from '@/realtime/RealtimeProvider';

export function FriendList() {
  const { data: friends, isLoading, isError } = useFriends();

  const removeFriendMutation = useRemoveFriend();

  const confirm = useConfirm();

  const [removingFriendId, setRemovingFriendId] = useState<number | null>(null);

  const { t } = useTranslation();

  const { onlineUserIds } = useRealtime();

  const handleRemoveFriend = async (friendId: number) => {
    const confirmed = await confirm({
      title: t('friends.removeFriend.title'),
      description: t('friends.removeFriend.description'),
      confirmLabel: t('friends.removeFriend.confirm'),
      variant: 'destructive',
    });

    if (!confirmed) {
      return;
    }
    
    setRemovingFriendId(friendId);

    removeFriendMutation.mutate(friendId, {
      onSuccess: () => {
        toast.success(t('friends.removeFriend.success'));
      },
      onError: () => {
        toast.error(t('friends.removeFriend.error'));
      },
      onSettled: () => {
        setRemovingFriendId(null);
      },
    });
  };

  if (isLoading) {
    return <p className="text-muted-foreground">{t('friends.loading')}</p>;
  }

  if (isError) {
    return <p className="text-destructive">{t('friends.loadError')}</p>;
  }

  if (!friends || friends.length === 0) {
    return (
      <p className="text-muted-foreground">{t('friends.empty')}</p>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map((friend) => (
        <FriendCard
          key={friend.id}
          friend={friend}
          isOnline={onlineUserIds.has(friend.id)}
          isRemoving={
            removeFriendMutation.isPending && removingFriendId === friend.id
          }
          onRemove={handleRemoveFriend}
        />
      ))}
    </div>
  );
}
