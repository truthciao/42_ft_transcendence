import { useFriendRequests } from '../../hooks/useFriends';

import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from '../../hooks/useFriendMutations';

export function FriendRequests() {
  const { data: requests, isLoading, isError } = useFriendRequests();

  const acceptMutation = useAcceptFriendRequest();

  const rejectMutation = useRejectFriendRequest();

  if (isLoading) {
    return <div>Loading friend requests...</div>;
  }

  if (isError) {
    return (
      <div className="text-destructive">Failed to load friend requests.</div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-muted-foreground">No pending friend requests.</div>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Friend Requests</h2>

      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="
              flex
              items-center
              justify-between
              border
              rounded-lg
              p-4
            "
          >
            <div>
              <div className="font-medium">{request.requester.username}</div>

              <div className="text-sm text-muted-foreground">
                {request.requester.email}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="
                  px-3
                  py-1
                  rounded
                  bg-primary
                  text-primary-foreground
                  disabled:opacity-50
                "
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                onClick={() => acceptMutation.mutate(request.id)}
              >
                Accept
              </button>

              <button
                className="
                  px-3
                  py-1
                  rounded
                  border
                  disabled:opacity-50
                "
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                onClick={() => rejectMutation.mutate(request.id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
