import { Outlet, useParams, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import type { ChatMessage } from '../../api/chat';
import { getConversationMessages } from '../../api/chat';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useTranslation } from 'react-i18next'; 

type ConversationLocationState = {
  friendName?: string;
};

export function ConversationPage() {
  const { t } = useTranslation();
  const { conversationId } = useParams();
  const location = useLocation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const locationState =
  location.state as ConversationLocationState | null;

  const friendName = locationState?.friendName;

  const chatTitle = friendName
  ? t('chat.conversation.chatWith', { friendName })
  : '';

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;

      try {
        setIsLoading(true);
        const data = await getConversationMessages(conversationId);
        setMessages(data);  
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

    setInputText('');

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
          <div className="text-center text-muted-foreground text-sm">
            {t('chat.conversation.loadingHistory')} 
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm">
            {t('chat.conversation.empty')}
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col mb-2">
              <span className="text-[10px] text-muted-foreground mb-1">
                {t('chat.conversation.user')} {msg.senderId}
              </span>
              <div className="bg-accent text-accent-foreground p-2.5 rounded-lg max-w-[70%] w-fit text-sm">
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-border p-4 bg-background">
        <div className="flex gap-2">
          <Input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('chat.conversation.placeholder')}
            className="flex-1 border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button type="submit">
            {t('chat.conversation.send')} 
          </Button>
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