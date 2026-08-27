import {
  Avatar as BaseAvatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

const STATUS_COLOR: Record<AvatarStatus, string> = {
  online: 'bg-success',
  offline: 'bg-muted-foreground',
  away: 'bg-warning',
  busy: 'bg-destructive',
};

const SIZE_CLASS = {
  sm: 'size-9',
  md: 'size-10',
  lg: 'size-12',
  xl: 'size-16',
} as const;

const DOT_SIZE_CLASS = {
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3.5',
  xl: 'size-3.5',
} as const;

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: keyof typeof SIZE_CLASS;
  status?: AvatarStatus;
  unreadCount?: number;
  className?: string;
}

function getAvatarUrl(src?: string | null): string {
  if (!src) {
    return '/images.jpg';
  }

  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  return `${API_BASE_URL}${src}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  src,
  name,
  size = 'md',
  status,
  unreadCount = 0,
  className,
}: AvatarProps) {
  return (
    <span className={cn('relative inline-block shrink-0', className)}>
      <BaseAvatar className={SIZE_CLASS[size]}>
        <AvatarImage
          src={getAvatarUrl(src)}
          alt={name}
        />

        <AvatarFallback>
          {getInitials(name)}
        </AvatarFallback>
      </BaseAvatar>

      {status && (
        <span
          aria-label={status}
          className={cn(
            'absolute right-0 bottom-0 block rounded-full ring-2 ring-background',
            DOT_SIZE_CLASS[size],
            STATUS_COLOR[status],
          )}
        />
      )}

      {unreadCount > 0 && (
        <span
          aria-label={`${unreadCount} unread messages`}
          className="absolute -right-1 -bottom-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none flex items-center justify-center ring-2 ring-background"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </span>
  );
}

