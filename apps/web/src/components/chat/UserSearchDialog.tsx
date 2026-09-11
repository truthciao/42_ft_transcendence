import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

interface SearchUser {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
}

interface UserSearchDialogProps {
  open: boolean;
  searchQuery: string;
  isCreatingConversation: boolean;
  searchResults: SearchUser[];
  isLoading: boolean;
  currentUserId?: number;
  onOpenChange: (open: boolean) => void;
  onSearchQueryChange: (query: string) => void;
  onUserSelect: (username: string) => void;
}

export function UserSearchDialog({
  open,
  searchQuery,
  isCreatingConversation,
  searchResults,
  isLoading,
  currentUserId,
  onOpenChange,
  onSearchQueryChange,
  onUserSelect,
}: UserSearchDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('chat.searchPeople')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder={t('chat.usernamePlaceholder')}
              className="pl-9"
            />
          </div>

          {searchQuery.trim().length < 2 && (
            <p className="text-xs text-muted-foreground">
              {t('chat.searchDescription')}
            </p>
          )}

          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {!isLoading &&
            searchQuery.trim().length >= 2 &&
            searchResults.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t('chat.noUsersFound')}
              </p>
            )}

          <div className="max-h-80 overflow-y-auto space-y-1">
            {searchResults.map((user) => {
              const displayName = user.username;

              return (
                <button
                  key={user.id}
                  type="button"
                  disabled={
                    isCreatingConversation || user.id === currentUserId
                  }
                  onClick={() => onUserSelect(user.username)}
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent disabled:opacity-50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {displayName}
                    </div>

                    <div className="truncate text-xs text-muted-foreground">
                      @{user.username}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}