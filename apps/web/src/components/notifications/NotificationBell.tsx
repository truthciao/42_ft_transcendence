import { Bell } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useFriendRequests } from '@/hooks/useFriends';
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from '@/hooks/useFriendMutations';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function NotificationBell() {
  const { t } = useTranslation();

  const { data: requests } = useFriendRequests();

  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();

  const friendRequestCount = requests?.length ?? 0;

  const handleAccept = (requestId: number) => {
    acceptMutation.mutate(requestId);
  };

  const handleReject = (requestId: number) => {
    rejectMutation.mutate(requestId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('settings.notifications')}
            className="relative"
          />
        }
      >
        <Bell className="size-4" />

        {friendRequestCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
            {friendRequestCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-1.5 text-sm font-semibold">
          {t('friends.friendRequests.title')}
        </div>

        <DropdownMenuSeparator />

        {!requests || requests.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            {t('friends.friendRequests.empty')}
          </div>
        ) : (
          <div className="space-y-1">
            {requests.map((request) => {
              const isProcessing =
                acceptMutation.isPending || rejectMutation.isPending;

              return (
                <div key={request.id} className="rounded-md p-2">
                  <Link
                    to={`/app/friends/${request.requester.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {request.requester.username}
                  </Link>

                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleAccept(request.id)}
                    >
                      {t('friends.friendRequests.accept')}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isProcessing}
                      onClick={() => handleReject(request.id)}
                    >
                      {t('friends.friendRequests.reject')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DropdownMenuSeparator />

        <Link
          to="/app/friends"
          className="
            block
            px-2
            py-1.5
            text-center
            text-sm
            text-muted-foreground
            hover:text-foreground
          "
        >
          {t('friends.friendRequests.viewAll')}
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
