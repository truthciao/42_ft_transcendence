import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../auth/useAuth';
import { useFriends } from '../../hooks/useFriends';
import { useSendFriendRequest } from '../../hooks/useFriendMutations';

export function AddFriend() {
  const {
    data: users,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useUsers();

  const { user: currentUser, loading: isCurrentUserLoading } = useAuth();

  const { data: friends } = useFriends();

  const sendFriendRequestMutation = useSendFriendRequest();

  if (isUsersLoading || isCurrentUserLoading) {
    return <p className="text-muted-foreground">Loading users...</p>;
  }

  if (isUsersError) {
    return <p className="text-destructive">Failed to load users.</p>;
  }

  const friendIds = new Set(friends?.map((friend) => friend.id) ?? []);

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
      <h2 className="text-xl font-semibold">Add Friend</h2>

      {availableUsers.length === 0 ? (
        <p className="text-muted-foreground">No users available.</p>
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
              <div>
                <p className="font-medium">{user.username}</p>

                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              <button
                className="
                  rounded
                  bg-primary
                  px-3
                  py-1
                  text-primary-foreground
                  disabled:opacity-50
                "
                disabled={sendFriendRequestMutation.isPending}
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
