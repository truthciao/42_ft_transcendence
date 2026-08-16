import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useFriends } from '../../hooks/useFriends';
import { useUserSearch } from '../../hooks/useUserSearch';
import { useSendFriendRequest } from '../../hooks/useFriendMutations';

export function AddFriend() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');

  const {
    data: users,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useUserSearch(username);

  const { user: currentUser, loading: isCurrentUserLoading } = useAuth();

  const { data: friends } = useFriends();

  const sendFriendRequestMutation = useSendFriendRequest();

  if (isCurrentUserLoading) {
    return <p>{t('friends.loading')}</p>;
  }

  const friendIds = new Set(
    friends?.map((friend) => friend.id) ?? [],
  );

  const availableUsers =
    users?.filter((user) => {
      if (user.id === currentUser?.id) {
        return false;
      }

      if (friendIds.has(user.id)) {
        return false;
      }

      return true;
    }) ?? [];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">
        {t('friends.addFriend.title')}
      </h2>

      <input
        type="text"
        placeholder={t('friends.addFriend.searchPlaceholder')}
        value={username}
        onChange={(event) => {
          setUsername(event.target.value);
        }}
        className="
          w-full
          rounded-lg
          border
          px-3
          py-2
        "
      />

      {username.trim().length < 2 ? (
        <p className="text-muted-foreground">
          {t('friends.addFriend.minCharacters')}
        </p>
      ) : isUsersLoading ? (
        <p className="text-muted-foreground">
          {t('friends.addFriend.searching')}
        </p>
      ) : isUsersError ? (
        <p className="text-destructive">
          {t('friends.addFriend.searchError')}
        </p>
      ) : availableUsers.length === 0 ? (
        <p className="text-muted-foreground">
          {t('friends.addFriend.noUsers')}
        </p>
      ) : (
        <div className="space-y-3">
          {availableUsers.map((user) => (
            <div
              key={user.id}
              className="
                flex
                items-center
                justify-between
                rounded-lg
                border
                p-4
              "
            >
              <p className="font-medium">
                {user.username}
              </p>

              <button
                className="
                  rounded
                  bg-primary
                  px-3
                  py-1
                  text-primary-foreground
                  disabled:opacity-50
                "
                disabled={
                  sendFriendRequestMutation.isPending
                }
                onClick={() =>
                  sendFriendRequestMutation.mutate({
                    addresseeId: user.id,
                  })
                }
              >
                {sendFriendRequestMutation.isPending
                  ? t('friends.addFriend.sending')
                  : t('friends.addFriend.button')}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}