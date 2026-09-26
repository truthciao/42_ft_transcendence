import {
  MessageCircle,
  Settings,
  ShieldCheck,
  Users,
  Waypoints,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MobileNavigationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavigation({
  open,
  onOpenChange,
}: MobileNavigationProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationItems = [
    {
      to: '/app/chat',
      label: t('chat.title'),
      icon: MessageCircle,
    },
    {
      to: '/app/friends',
      label: t('friends.title'),
      icon: Users,
    },
    {
      to: '/app/spaces',
      label: t('workspaces.title'),
      icon: Waypoints,
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            to: '/app/admin',
            label: t('admin.title'),
            icon: ShieldCheck,
          },
        ]
      : []),
    {
      to: '/app/settings',
      label: t('settings.title'),
      icon: Settings,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90dvh] max-h-[90dvh] flex-col md:hidden">
        <DialogHeader>
          <DialogTitle>{t('common.navigation')}</DialogTitle>
        </DialogHeader>

        <nav className="shrink-0">
          <div className="flex flex-col gap-1">
            {navigationItems.map(({ to, label, icon: Icon }) => (
              <button
                key={to}
                type="button"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent"
                onClick={() => {
                  onOpenChange(false);

                  if (location.pathname !== to) {
                    navigate(to);
                  }
                }}
              >
                <Icon className="size-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
