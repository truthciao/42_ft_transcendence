import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useFriendRequests } from '../../hooks/useFriends';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '../ui/button';
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from '../../hooks/useFriendMutations';

export function FriendRequests() {
  const { t } = useTranslation();

  const [processingRequestId, setProcessingRequestId] = useState<number | null>(
    null,
  );

  const {
    data: requests,
    isLoading,
    isError,
  } = useFriendRequests();

  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();

  const handleAccept = (requestId: number) => {
    setProcessingRequestId(requestId);

    acceptMutation.mutate(requestId, {
      onSettled: () => {
        setProcessingRequestId(null);
      },
    });
  };

  const handleReject = (requestId: number) => {
    setProcessingRequestId(requestId);

    rejectMutation.mutate(requestId, {
      onSettled: () => {
        setProcessingRequestId(null);
      },
    });
  };

  if (isLoading) {
    return <div>{t('friends.friendRequests.loading')}</div>;
  }

  if (isError) {
    return (
      <div className="text-destructive">
        {t('friends.friendRequests.loadError')}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-muted-foreground">
        {t('friends.friendRequests.empty')}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">
        {t('friends.friendRequests.title')}
      </h2>

      <div className="space-y-3">
        {requests.map((request) => {
          const isProcessing =
            processingRequestId === request.id;

          return (
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
              <div className="flex items-center gap-3">
                <Link
                  to={`/app/friends/${request.requester.id}`}
                  className="shrink-0"
                >
                  <Avatar
                    src={request.requester.avatarUrl}
                    name={request.requester.username}
                    size="md"
                  />
                </Link>

                <div>
                  <div className="font-medium">
                    <Link
                      to={`/app/friends/${request.requester.id}`}
                      className="hover:underline"
                    >
                      {request.requester.username}
                    </Link>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {request.requester.email}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAccept(request.id)}
                >
                  {isProcessing && acceptMutation.isPending
                    ? t('friends.friendRequests.accepting')
                    : t('friends.friendRequests.accept')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => handleReject(request.id)}
                >
                  {isProcessing && rejectMutation.isPending
                    ? t('friends.friendRequests.rejecting')
                    : t('friends.friendRequests.reject')}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
