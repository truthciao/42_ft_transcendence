import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { getMyConversations, createConversationByUsername, type ConversationItem } from '../../api/chat';
import { SecondarySidebar } from '../layout/SecondarySidebar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from 'react-i18next';

export function ConversationListSidebar() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const navigate = useNavigate();

  const { t } = useTranslation();

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const dataList = await getMyConversations();

      if (Array.isArray(dataList)) {
        setConversations(dataList);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
      fetchConversations();

      const handleFocus = () => {
        fetchConversations();
      };

      const handleRefreshConversations = () => {
        fetchConversations();
      };

      window.addEventListener('focus', handleFocus);

      window.addEventListener('refresh_conversations', handleRefreshConversations);
      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('refresh_conversations', handleRefreshConversations);
      };
  }, []);

  const handleStrangerChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUsername = usernameInput.trim();
    if (!targetUsername) return;

    try {
      const data = await createConversationByUsername(targetUsername);

      if (data && data.id) {
        navigate(`/app/chat/${data.id}`, { 
          state: { friendName: targetUsername } 
        });
        fetchConversations();
      }
      setUsernameInput('');
    } catch (error: any) {
      console.error('Cannot build conversation:', error);
    }
  };

  return (
    <SecondarySidebar>
      <div className="flex h-full min-h-0 flex-col bg-background">
        <div className="border-b border-border p-3 flex flex-col gap-2 bg-muted/20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('chat.strangerChat')} 
          </h2>
          <form onSubmit={handleStrangerChatSubmit} className="flex gap-2">
            <Input 
              type="text"
              placeholder={t('chat.usernamePlaceholder')}
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="h-8 text-xs"
              required
            />
            <Button
             type="submit"
             size="sm"
             className="shrink-0"
             >
              {t('chat.chat')}
            </Button>
          </form>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider flex items-center justify-between px-1">
            <span>{t('chat.conversations')}</span>
            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
              {conversations.length}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => {
                const displayName = conv.name || t('chat.room', { id: conv.id });
                const avatarLetter = displayName.charAt(0).toUpperCase();

                return (
                  <div
                    key={conv.id}
                  onClick={() => {
                    navigate(`/app/chat/${conv.id}`, {
                      state: { friendName: conv.name },
                    });
                  }}

                    className="flex items-center justify-between rounded-md px-2.5 py-2.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group"
                  >
                    <div className="font-medium flex items-center gap-2.5 min-w-0 flex-1">
                      <Avatar size="sm">
                        <AvatarFallback
                          className={
                            conv.isFriend
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {avatarLetter}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium truncate">
                            {displayName}
                          </span>
                          <span 
                            className="text-xs shrink-0" 
                            title={conv.isFriend ? t('chat.friend') : t('chat.stranger')}
                          >
                            {conv.isFriend ? '🤝' : '👤'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 font-normal ${
                      conv.isFriend 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {conv.isFriend ? t('chat.friend') : t('chat.stranger')}
                    </span>
                  </div>
                );
              })}
            </div>
          )} 
        </div>
      </div>
    </SecondarySidebar>
  );
}