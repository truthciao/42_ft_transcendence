import { useFriends } from "../../hooks/useFriends";

export function FriendsSidebar() {
  const {
    data: friends,
    isLoading,
    isError,
  } = useFriends();

  if (isLoading) {
    return (
      <div className="p-4 text-muted-foreground">
        Loading friends...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-destructive">
        Failed to load friends.
      </div>
    );
  }

  return (
    <aside className="p-4">
      <h3 className="mb-4 font-semibold">
        Friends
      </h3>

      {(!friends || friends.length === 0) && (
        <p className="text-sm text-muted-foreground">
          No friends yet.
        </p>
      )}

      <div className="space-y-2">
        {friends?.map((friend) => (
          <div
            key={friend.id}
            className="
              cursor-pointer
              rounded
              p-2
              hover:bg-muted
            "
          >
            {friend.username}
          </div>
        ))}
      </div>
    </aside>
  );
}