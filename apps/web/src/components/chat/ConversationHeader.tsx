import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ConversationHeaderProps {
  title: ReactNode;
  headerIcon?: ReactNode;
  otherUserName?: string;
  onSearch: () => void;
  onBack?: () => void;
}

export function ConversationHeader({
  title,
  headerIcon,
  otherUserName,
  onSearch,
  onBack,
}: ConversationHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between border-b border-border px-5 py-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 md:hidden"
            onClick={onBack}
            aria-label={t('common.back')}
          >
            ←
          </Button>
        )}

        <h1 className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          {headerIcon ?? (
            <span className="truncate">
              {otherUserName
                ? t('chat.chatWith', { friendName: otherUserName })
                : title}
            </span>
          )}
        </h1>
      </div>

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