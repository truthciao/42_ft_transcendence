import { Skeleton } from '../ui/skeleton';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  searchConversationMessages,
  type ChatMessage,
} from '@/api/chat';

interface MessageSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  onSelectMessage: (message: ChatMessage) => void;
}

export function MessageSearchDialog({
  open,
  onOpenChange,
  conversationId,
  onSelectMessage,
}: MessageSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { t }  = useTranslation();

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ['chat-message-search', conversationId, debouncedSearch],
    queryFn: () =>
      searchConversationMessages(
        conversationId,
        debouncedSearch,
      ),
      enabled: open && debouncedSearch.length > 0,
  });

  const searchResults: ChatMessage[] =
    data ?? [];

  const handleClose = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    onOpenChange(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
          return;
        }

        onOpenChange(true);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('chat.searchMessages')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              autoFocus
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('chat.searchMessagesPlaceholder')}
              className="pl-9"
            />

            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedSearch('');
                }}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          {isLoading && !searchResults.length && (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {!isLoading &&
            debouncedSearch &&
            searchResults.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t('chat.noMessagesFound')}
              </p>
          )}

          <div className="max-h-80 overflow-y-auto space-y-1">
            {searchResults.map((message) => (
              <button
                key={message.id}
                type="button"
                onClick={() => onSelectMessage(message)}
                className="w-full rounded-md p-2 text-left hover:bg-accent"
              >
                <div className="truncate text-sm font-medium">
                  {message.sender?.username ?? t('chat.user')}
                </div>

                <div className="text-sm break-words">
                  {message.content}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ) 
}

