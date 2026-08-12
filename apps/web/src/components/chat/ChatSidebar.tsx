import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { getMyConversations, createConversationByUsername, type ConversationItem } from '../../api/chat';

export function ConversationListSidebar() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const navigate = useNavigate();

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

      window.addEventListener('focus', handleFocus);
      return () => {
        window.removeEventListener('focus', handleFocus);
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
    <div className="flex h-full min-h-0 flex-col bg-background border-r border-border">
      <div className="border-b border-border p-3 flex flex-col gap-2 bg-muted/20">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stranger Chat (Username)</h2>
        <form onSubmit={handleStrangerChatSubmit} className="flex gap-2">
          <input 
            type="text"
            placeholder="Enter a username..."
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="w-full border border-input bg-background px-2.5 py-1.5 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            required
          />
          <button type="submit" className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:opacity-90 shrink-0">
            Chat
          </button>
        </form>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
        <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider flex items-center justify-between px-1">
          <span>Conversations</span>
          <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">{conversations.length}</span>
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading chats...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground leading-relaxed">
            No active conversations yet.<br />
            Use the top box to chat with anyone!
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => {
              const displayName = conv.name || `Chat Room #${conv.id}`;
              const avatarLetter = displayName.charAt(0).toUpperCase();

              return (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/app/chat/${conv.id}`, { state: { friendName: conv.name } })}
                  className="flex items-center justify-between rounded-md px-2.5 py-2.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group"
                >
                  <div className="font-medium flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      conv.isFriend ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {avatarLetter}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">
                          {displayName}
                        </span>
                        <span className="text-xs shrink-0" title={conv.isFriend ? 'Friend' : 'Stranger'}>
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
                    {conv.isFriend ? 'Friend' : 'Stranger'}
                  </span>
                </div>
              );
            })}
          </div>
        )} 
      </div>
    </div>
  );
}