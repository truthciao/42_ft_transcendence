import { Avatar as BaseAvatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

const STATUS_COLOR: Record<AvatarStatus, string> = {
  online: 'bg-success',
  offline: 'bg-muted-foreground',
  away: 'bg-yellow-500',
  busy: 'bg-destructive',
};

const SIZE_CLASS = {
  sm: 'size-7',
  md: 'size-9',
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
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ src, name, size = 'md', status, className }: AvatarProps) {
  return (
    <span className={cn('relative inline-block', className)}>
      <BaseAvatar className={SIZE_CLASS[size]}>
        <AvatarImage
          src={getAvatarUrl(src)}
          alt={name}
        />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </BaseAvatar>

      {status ? (
        <span
          aria-label={status}
          className={cn(
            'absolute right-0 bottom-0 block rounded-full ring-2 ring-background',
            DOT_SIZE_CLASS[size],
            STATUS_COLOR[status],
          )}
        />
      ) : null}
    </span>
  );
}
