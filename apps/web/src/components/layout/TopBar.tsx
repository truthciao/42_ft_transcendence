import { Bell, LogOut, Settings, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '../common/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  useUnreadNotificationCount,
  useMarkAllNotificationsAsRead,
  useNotifications
} from '@/hooks/useNotifications';
import type { Notification } from '@repo/shared-types';

export function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } =
    useUnreadNotificationCount();
  const markAllAsReadMutation =
    useMarkAllNotificationsAsRead();
  const { t } = useTranslation();

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }

  function getNotificationMessage(notification: Notification) {
    const username = notification.actor?.username ?? t('common.unknownUser');
    const workspaceName =
      notification.workspace?.name ?? t('common.genericWorkspace');

    switch (notification.type) {
      case 'FRIEND_REQUEST_RECEIVED':
        return t('notifications.friendRequestReceived', { username });

      case 'FRIEND_REQUEST_ACCEPTED':
        return t('notifications.friendRequestAccepted', { username });

      case 'FRIEND_REQUEST_REJECTED':
        return t('notifications.friendRequestRejected', { username });

      case 'FRIEND_REMOVED':
        return t('notifications.friendRemoved', { username });

      case 'WORKSPACE_INVITE_RECEIVED':
        return t('notifications.workspaceInviteReceived', { username, workspaceName });

      case 'WORKSPACE_INVITE_ACCEPTED':
        return t('notifications.workspaceInviteAccepted', { username, workspaceName });

      case 'WORKSPACE_MEMBER_REMOVED':
        return t('notifications.workspaceMemberRemoved', { workspaceName });

      case 'WORKSPACE_ROLE_CHANGED':
        return t('notifications.workspaceRoleChanged', { workspaceName });

      default:
        return notification.type;
    }
  }

  return (
    <div className="flex h-full min-w-0 items-center gap-3 px-4">
      <Link to="/" className="font-semibold tracking-normal">
        transcendence
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />

      <DropdownMenu
        onOpenChange={(open) => {
          if (open && unreadCount > 0) {
            markAllAsReadMutation.mutate();
          }
        }}
      >
        <DropdownMenuTrigger
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
          aria-label={t('settings.notifications')}
        >
            <Bell className="size-4" />

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  size-5
                  items-center
                  justify-center
                  rounded-full
                  bg-destructive
                  text-[10px]
                  font-medium
                  text-destructive-foreground
                "
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80"
        >
          <div className="px-2 py-1.5 text-sm font-semibold">
            {t('notifications.title')}
          </div>

          <DropdownMenuSeparator />

          {notifications.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              {t('notifications.empty')}
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1"
                onClick={() => {
                  if (notification.type === 'FRIEND_REQUEST_RECEIVED') {
                    navigate('/app/friends');
                    return;
                  }

                  const workspaceId = notification.workspace?.id;

                  if (!workspaceId) return;

                  if (notification.type === 'WORKSPACE_INVITE_RECEIVED') {
                    navigate('/app/spaces');
                  } else if (notification.type.startsWith('WORKSPACE')) {
                    navigate(`/app/spaces/${workspaceId}`);
                  }
                }}
              >
                <span className="font-medium">
                  {notification.actor?.username ?? t('common.unknownUser')}
                </span>

                <span className="text-xs text-muted-foreground">
                  {getNotificationMessage(notification)}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer outline-none">
            <Avatar
              src={user?.avatarUrl}
              name={user?.username ?? 'Account'}
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm font-semibold">
              {user?.username ?? 'Account'}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/app/settings/profile')}>
              <User className="size-4" />
              {t('profile.title')}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/app/settings/account')}>
              <Settings className="size-4" />
              {t('settings.account')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut className="size-4" />
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
