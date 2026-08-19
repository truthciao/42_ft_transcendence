import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFriendRequests } from '../../hooks/useFriends';

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
              <div>
                <div className="font-medium">
                  {request.requester.username}
                </div>

                <div className="text-sm text-muted-foreground">
                  {request.requester.email}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="
                    px-3
                    py-1
                    rounded
                    bg-primary
                    text-primary-foreground
                    disabled:opacity-50
                  "
                  disabled={isProcessing}
                  onClick={() => handleAccept(request.id)}
                >
                  {isProcessing && acceptMutation.isPending
                    ? t('friends.friendRequests.accepting')
                    : t('friends.friendRequests.accept')}
                </button>

                <button
                  type="button"
                  className="
                    px-3
                    py-1
                    rounded
                    border
                    disabled:opacity-50
                  "
                  disabled={isProcessing}
                  onClick={() => handleReject(request.id)}
                >
                  {isProcessing && rejectMutation.isPending
                    ? t('friends.friendRequests.rejecting')
                    : t('friends.friendRequests.reject')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
