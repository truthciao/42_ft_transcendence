import { Bell, LogOut, Search, Settings, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }

  const fallback = user?.username?.slice(0, 2).toUpperCase() ?? 'ME';

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

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer outline-none">
            <Avatar>
              <AvatarImage
                src={user?.avatarUrl ?? undefined}
                alt={user?.username ?? 'Avartar'}
              />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
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
