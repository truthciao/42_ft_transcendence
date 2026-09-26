import { disconnectSocket } from '@/lib/realtime';
import {
  Bell,
  Languages,
  LogOut,
  Menu,
  Settings,
  User,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '../common/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useUnreadNotificationCount,
  useMarkAllNotificationsAsRead,
  useNotifications,
} from '@/hooks/useNotifications';
import type { Notification } from '@repo/shared-types';
import { useQueryClient } from '@tanstack/react-query';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  async function logout() {
    disconnectSocket();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    queryClient.clear();
    await refreshUser();
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

      case 'MESSAGE_RECEIVED': {

        const conversation = notification.conversation;

        if (
          conversation?.type === 'GROUP' ||
          conversation?.type === 'CHANNEL'
        ) {
          return t('notifications.messageReceivedInConversation', {
            username,
            conversationName:
              conversation.type === 'CHANNEL'
                ? `#${conversation.name}`
                : conversation.name,
          });
        }

        return t('notifications.messageReceived', { username });
      }

      case 'WORKSPACE_INVITE_RECEIVED':
        return t('notifications.workspaceInviteReceived', {
          username,
          workspaceName,
        });

      case 'WORKSPACE_INVITE_ACCEPTED':
        return t('notifications.workspaceInviteAccepted', {
          username,
          workspaceName,
        });

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
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-accent md:hidden"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
        </button>

        <Link to="/" className="font-semibold tracking-normal">
          transcendence
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

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

          <DropdownMenuContent align="end" className="w-80">
            <div className="px-2 py-1.5 text-sm font-semibold">
              {t('notifications.title')}
            </div>

            <DropdownMenuSeparator />

            {notifications.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                {t('notifications.empty')}
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1"
                    onClick={() => {
                      if (notification.type === 'FRIEND_REQUEST_RECEIVED') {
                        navigate('/app/friends');
                        return;
                      }

                      if (notification.type === 'MESSAGE_RECEIVED') {
                        const conversation = notification.conversation;

                        if (!conversation) return;
                        if (conversation.type === 'CHANNEL') {
                          if (!conversation.workspaceId) return;
                          navigate(
                            `/app/spaces/${conversation.workspaceId}/c/${conversation.id}`,
                          );
                          return;
                        }
                        navigate(`/app/chat/${conversation.id}`, {
                          state: {
                            friendName: notification.actor?.username,
                          },
                        });  
                        return ;     
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
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer outline-none">
            <Avatar src={user?.avatarUrl} name={user?.username ?? 'Account'} />
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

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="size-4" />
                Language
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={
                    i18n.language.startsWith('en')
                      ? 'en'
                      : i18n.language.startsWith('fr')
                        ? 'fr'
                        : 'zh'
                  }
                  onValueChange={(value) => {
                    void i18n.changeLanguage(value);
                  }}
                >
                  <DropdownMenuRadioItem value="en">
                    English
                  </DropdownMenuRadioItem>

                  <DropdownMenuRadioItem value="fr">
                    Français
                  </DropdownMenuRadioItem>

                  <DropdownMenuRadioItem value="zh">
                    中文
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

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
