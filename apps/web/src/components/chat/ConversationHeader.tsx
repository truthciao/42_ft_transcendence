import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ConversationHeaderProps {
  title: ReactNode;
  headerIcon?: ReactNode;
  otherUserName?: string;
  isOtherUserOnline: boolean;
  onSearch: () => void;
}

export function ConversationHeader({
  title,
  headerIcon,
  otherUserName,
  isOtherUserOnline,
  onSearch,
}: ConversationHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="border-b border-border px-5 py-3 shadow-sm flex items-center justify-between">
      <h1 className="font-semibold text-sm flex items-center gap-2">
        {headerIcon ?? (
          <>
            <span
              className={`w-2 h-2 rounded-full ${
                isOtherUserOnline
                  ? 'bg-success'
                  : 'bg-muted-foreground'
              }`}
            />
            <span>
              {otherUserName
                ? t(
                    isOtherUserOnline
                      ? 'chat.online'
                      : 'chat.offline',
                    { friendName: otherUserName },
                  )
                : title}
            </span>
          </>
        )}
      </h1>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={onSearch}
        aria-label={t('chat.searchMessages')}
      >
        <Search className="size-4" />
      </Button>
    </header>
  );
}