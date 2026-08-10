import { NavLink, Outlet, useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

// Types
interface Conversation {
  id: string;
  name?: string;
  preview?: string;
}

interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  createdAt: string;
}

let globalRefreshChats: () => void = () => {};

//Sidebar Component
export function ConversationListSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const rawData = await response.json();
      const extractedData = rawData.data ? rawData.data : rawData;
      
      if (Array.isArray(extractedData)) {
        setConversations(extractedData);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    globalRefreshChats = fetchConversations;
    fetchConversations();
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h2 className="text-sm font-semibold">Messages</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading chats...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet.</div>
        ) : (
          conversations.map((conversation) => (
            <NavLink
              key={conversation.id}
              to={`/app/chat/${conversation.id}`}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-accent text-accent-foreground font-semibold' : 'hover:bg-accent/50'
                }`
              }
            >
              <div className="font-medium">{conversation.name || `Chat Room ${conversation.id}`}</div>
              <div className="truncate text-xs text-muted-foreground">
                {conversation.preview || 'Click to view...'}
              </div>
            </NavLink>
          ))
        )}
      </div>
    </div>
  );
}

//Main Chat Page Layout
export function ChatPage() {
  return <Outlet />;
}

//Empty State Component (Create Chat)
export function ChatEmptyState() {
  const [targetUserId, setTargetUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreateChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim()) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/chat/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetUserId: parseInt(targetUserId, 10) })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Creation failed: ${data.message || 'Unknown error'}`);
        return;
      }

      alert("Chat created successfully!");
      setTargetUserId('');
      globalRefreshChats(); 
      
      if (data.id) {
         navigate(`/app/chat/${data.id}`);
      }
    } catch (error: any) {
      alert(`Request failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex h-full flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome to Chat</h2>
        <p className="text-muted-foreground text-sm">Select a conversation on the left, or start a new one.</p>
      </div>

      <div className="w-full max-w-sm p-6 bg-card rounded-xl border border-border shadow-sm">
        <h3 className="font-semibold mb-4 text-center">Start a New Conversation</h3>
        <form onSubmit={handleCreateChatSubmit} className="flex flex-col gap-3">
          <input 
            type="number" 
            placeholder="Enter Target User ID (e.g., 2)"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Chat Room'}
          </button>
        </form>
      </div>
    </section>
  );
}

// Conversation Page (Messages Panel)
export function ConversationPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3000/chat/conversations/${conversationId}/message`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch messages');

        const data = await response.json();
        setMessages(data.data || data); 
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]); 

  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <header className="border-b border-border px-5 py-3 shadow-sm">
        <h1 className="font-semibold text-sm">Conversation ID: {conversationId}</h1>
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

      <div className="border-t border-border p-4 bg-background">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
            Send
          </button>
        </div>
      </div>
    </section>
  );
}