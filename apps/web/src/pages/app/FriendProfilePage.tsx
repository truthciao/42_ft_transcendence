import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/common/Avatar';
import { PageError } from '@/components/common/PageError';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import { useUserProfile } from '../../hooks/useUserProfile';
import { createDirectConversation } from '../../api/chat';

export function FriendProfilePage() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();

  const numericUserId = Number(userId);

  const {
    data: friend,
    isLoading,
    isError,
    refetch,
  } = useUserProfile(numericUserId);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-md p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-2/3" />

            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-5 w-3/4" />
          </div>

          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return <PageError onRetry={() => void refetch()} />;
  }

  if (!friend) {
    return (
      <main className="mx-auto max-w-md p-6">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <h1 className="text-xl font-semibold">
            {t('friends.profile.notFound')}
          </h1>

          <Button
            variant="outline"
            onClick={() => navigate('/app/friends')}
          >
            {t('friends.profile.backToFriends')}
          </Button>
        </div>
      </main>
    );
  }

const handleMessage = async () => {
  console.log('Message button clicked');
  console.log('friend:', friend);

  try {
    const data = await createDirectConversation(friend.id);

    console.log('conversation:', data);

    if (data?.id) {
      navigate(`/app/chat/${data.id}`, {
        state: { friendName: friend.username },
      });
    }
  } catch (error) {
    console.error('Cannot build conversation:', error);
  }
};
  return (
    <main className="mx-auto max-w-md p-6">
      <Button
        variant="ghost"
        className="mb-6 px-0"
        onClick={() => navigate('/app/friends')}
      >
        ← {t('common.back')}
      </Button>

      <div className="space-y-6 rounded-lg border p-6">
        <div className="flex items-center gap-4">
          <Avatar
            src={null}
            name={friend.username}
            size="xl"
          />

          <div>
            <h1 className="text-2xl font-semibold">
              {friend.username}
            </h1>

            <p className="text-muted-foreground">
              {t('friends.profile.friend')}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {t('friends.profile.username')}
            </p>

            <p className="font-medium">{friend.username}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              {t('friends.profile.email')}
            </p>

            <p className="font-medium">{friend.email}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => void handleMessage()}
          >
            {t('friends.profile.message')}
          </Button>
        </div>
      </div>
    </main>
  );
}
