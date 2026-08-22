import { Bell, LogOut, Search, Settings, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '../common/Avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useNotifications } from '@/hooks/useNotifications';

export function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } =
    useUnreadNotificationCount();

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-full min-w-0 items-center gap-3 px-4">
      <Link to="app/chat" className="font-semibold tracking-normal">
        transcendence
      </Link>

      <Button
        variant="outline"
        className="ml-3 w-full max-w-md justify-start text-muted-foreground"
      >
        <Search className="size-4" />
        Search
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />

      <DropdownMenu>
        <DropdownMenuTrigger
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
          aria-label="Notifications"
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
            Notifications
          </div>

          <DropdownMenuSeparator />

          {notifications.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1"
              >
                <span className="font-medium">
                  {notification.actor?.username ?? 'Unknown user'}
                </span>

                <span className="text-xs text-muted-foreground">
                  {notification.type}
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
            {/* <DropdownMenuLabel>{user?.username ?? "Account"}</DropdownMenuLabel> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/app/settings/profile')}>
              <User className="size-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/app/settings/account')}>
              <Settings className="size-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
