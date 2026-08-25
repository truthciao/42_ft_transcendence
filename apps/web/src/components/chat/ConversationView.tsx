import { type SubmitEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSocket } from "@/lib/realtime";
import { getConversationMessages, type ChatMessage } from "@/api/chat";
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from "@/hooks/useAuth";

interface ConversationViewProps {
  conversationId: string;
  title: ReactNode;
  headerIcon?: ReactNode;
}

export function ConversationView({ conversationId, title, headerIcon }: ConversationViewProps) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMessages() {
      try {
        setIsLoading(true);
        const data = await getConversationMessages(conversationId as string);
        if(!cancelled)
          setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        if (!cancelled)
          setIsLoading(false);
      }
    }

    fetchMessages();
    return () => {
      cancelled = true;
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth'})
  }, [messages])

  useEffect(() => {
    const socket = getSocket();

    const joinConversation = () => {
      socket.emit('chat:conversation:join', { conversationId: Number(conversationId) });
    }

    if (socket.connected) {
      joinConversation();
    } else {
      socket.once('connect', joinConversation);
    }

    const handleMessageCreated = (message: ChatMessage) => {
      if (message.conversationId.toString() !== conversationId)
        return;
      setMessages((prev) => [...prev, message]);
    }

    socket.on('chat:message:created', handleMessageCreated);

    return () => {
      socket.off('chat:message:created', handleMessageCreated);
      socket.off('connect', joinConversation);
    }
  }, [conversationId]);

  function handleSendMessage(e: SubmitEvent) {
    e.preventDefault();
    const content = inputText.trim();
    if (!content)
      return;

    const socket = getSocket();
    socket.emit('chat:message:send', {
      conversationId: Number(conversationId),
      content,
    });
    setInputText('');
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <header className="border-b border-border px-5 py-3 shadow-sm flex items-center justify-between">
        <h1 className="font-semibold text-sm flex items-center gap-2">
          {headerIcon ?? <span className="w-2 h-2 rounded-full bg-success" />}
          {title}
        </h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground text-sm">
            {t('chat.loadingHistory')}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm">
            {t('chat.empty')}
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUser?.id;
            const senderLabel = isMine ? t('chat.me') : (msg.sender?.username ?? t('chat.user'));

            return (
              <div
                key={msg.id}
                className={`flex flex-col mb-2 ${
                  isMine ? 'items-end' : 'items-start'
                }`}
              >
                <span className="text-[10px] text-muted-foreground mb-1">
                  {senderLabel}
                </span>

                <div
                  className={`p-2.5 rounded-lg max-w-[70%] w-fit text-sm ${
                    isMine
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-accent-foreground'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-border p-4 bg-background">
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('chat.placeholder')}
            className="flex-1 border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button type="submit">
            {t('chat.send')}
          </Button>
        </div>
      </form>
    </section>
  );

}
