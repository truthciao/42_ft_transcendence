import { useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { useFriends } from '../../hooks/useFriends';
import { useUserSearch } from '../../hooks/useUserSearch';
import { useSendFriendRequest } from '../../hooks/useFriendMutations';

export function AddFriend() {
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
    return <p>Loading...</p>;
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
        Add Friend
      </h2>

      <input
        type="text"
        placeholder="Search by username"
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
          Enter at least 2 characters to search.
        </p>
      ) : isUsersLoading ? (
        <p className="text-muted-foreground">
          Searching...
        </p>
      ) : isUsersError ? (
        <p className="text-destructive">
          Failed to search users.
        </p>
      ) : availableUsers.length === 0 ? (
        <p className="text-muted-foreground">
          No users found.
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
                  ? 'Sending...'
                  : 'Add Friend'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}