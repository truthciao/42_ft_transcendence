import { Outlet, useParams, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import type { ChatMessage } from '../../api/chat';
import { getConversationMessages } from '../../api/chat';

export function ConversationPage() {
  const { conversationId } = useParams();
  const location = useLocation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const friendName = (location.state as any)?.friendName;
  const chatTitle = friendName ? `Chat with ${friendName}` : "";

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;

      try {
        setIsLoading(true);
        const data: any = await getConversationMessages(conversationId);
        const list = Array.isArray(data) ? data : (data?.data || []);
        setMessages(list);  
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]); 

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId) return;

    try {     
      setInputText('');      
      } catch (error: any) { 
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <header className="border-b border-border px-5 py-3 shadow-sm flex items-center justify-between">
        <h1 className="font-semibold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {chatTitle}
        </h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground text-sm">Loading history...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm">No message history. Say hi below!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col mb-2">
              <span className="text-[10px] text-muted-foreground mb-1">User {msg.senderId}</span>
              <div className="bg-accent text-accent-foreground p-2.5 rounded-lg max-w-[70%] w-fit text-sm">
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-border p-4 bg-background">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
            Send
          </button>
        </div>
      </form>
    </section>
  );
}

export function ChatPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <Outlet />
    </div>
  );
}

export function ChatEmptyState() {
  return null; 
}