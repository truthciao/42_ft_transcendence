import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import type { AcceptedFriend } from '../../api/chat';
import { getFriendsList, createDirectConversation } from '../../api/chat';

export const startChatWithUser = async (targetUserId: number, navigate: ReturnType<typeof useNavigate>) => {
  try {
    const data = await createDirectConversation(targetUserId);
    if (data && data.id) {
      navigate(`/app/chat/${data.id}`);
    }
  } catch (error: any) {
    console.error('Cannot build conversation:', error.message);
  }
};

export function ConversationListSidebar() {
  const [friends, setFriends] = useState<AcceptedFriend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetUserIdInput, setTargetUserIdInput] = useState('');
  const navigate = useNavigate();

  const fetchAcceptedFriends = async () => {
    try {
      setIsLoading(true);
      const dataList = await getFriendsList();
      if (Array.isArray(dataList)) {
        setFriends(dataList);
      }
    } catch (error) {
      console.error('Failed to fetch accepted friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedFriends();
  }, []);

  const handleStrangerChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userIdNum = parseInt(targetUserIdInput, 10);
    if (isNaN(userIdNum)) return;
    startChatWithUser(userIdNum, navigate);
    setTargetUserIdInput('');
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background border-r border-border">
      <div className="border-b border-border p-3 flex flex-col gap-2 bg-muted/20">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stranger Chat (User ID)</h2>
        <form onSubmit={handleStrangerChatSubmit} className="flex gap-2">
          <input 
            type="number"
            placeholder="Enter User ID..."
            value={targetUserIdInput}
            onChange={(e) => setTargetUserIdInput(e.target.value)}
            className="w-full border border-input bg-background px-2.5 py-1.5 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button type="submit" className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:opacity-90 shrink-0">
            Chat
          </button>
        </form>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
        <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider flex items-center justify-between px-1">
          <span>My Friends</span>
          <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">{friends.length}</span>
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading friends...</div>
        ) : friends.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground leading-relaxed">
            No accepted friends yet.<br />
            Use the top ID box to chat with strangers or add friends first!
          </div>
        ) : (
          <div className="space-y-1">
            {friends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => startChatWithUser(friend.id, navigate)}
                className="flex items-center justify-between rounded-md px-2.5 py-2.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group"
              >
                <div className="font-medium flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {friend.username ? friend.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{friend.username}</span>
                    <span className="text-[10px] text-muted-foreground">ID: {friend.id}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Chat
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}