import { useState } from 'react';
import { NavLink } from 'react-router';
import { useFriends } from '../../hooks/useFriends';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/input';
import { Avatar } from '@/components/common/Avatar';
import { useRealtime } from '../../hooks/useRealtime';
import { useRemoveFriend } from '../../hooks/useFriendMutations';
import { useConfirm } from '@/lib/confirm-context';
import { toast } from 'sonner';
import { Button } from '../ui/button';

export function FriendsSidebar() {
  const { data: friends, isLoading, isError } = useFriends();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const removeFriendMutation = useRemoveFriend();
  const confirm = useConfirm();

  const [removingFriendId, setRemovingFriendId] = useState<number | null>(null);
  const filteredFriends = friends?.filter((friend) =>
    friend.username.toLowerCase().includes(search.toLowerCase()),
  );
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
    return (
      <div className="p-4 text-muted-foreground">
        {t('friends.loading')}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-destructive">
        {t('friends.loadError')}
      </div>
    );
  }

  return (
    <aside className="flex h-full min-h-0 flex-col p-4">
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t('friends.searchPlaceholder')}
        className="mb-4"
      />

      {filteredFriends?.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('friends.noSearchResults')}
        </p>
      ) : (
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {filteredFriends?.map((friend) => {
            const isRemoving =
              removeFriendMutation.isPending &&
              removingFriendId === friend.id;

            return (
              <div
                key={friend.id}
                className="group flex items-center gap-1 rounded-md"
              >
                <NavLink
                  to={`/app/friends/${friend.id}`}
                  className={({ isActive }) =>
                    `flex min-w-0 flex-1 items-center gap-3 rounded-md p-2 ${
                      isActive
                        ? 'bg-muted font-medium'
                        : 'hover:bg-muted'
                    }`
                  }
                >
                  <Avatar
                    src={friend.avatarUrl}
                    name={friend.username}
                    size="sm"
                    status={onlineUserIds.has(friend.id) ? 'online' : 'offline'}
                  />

                  <span className="truncate">{friend.username}</span>
                </NavLink>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isRemoving}
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="shrink-0"
                >
                  {isRemoving
                    ? t('friends.removeFriend.removing')
                    : t('friends.removeFriend.confirm')}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
