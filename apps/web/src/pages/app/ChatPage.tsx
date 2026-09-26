import { Outlet, useNavigate, useParams, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ConversationView } from '@/components/chat/ConversationView';
import { ConversationListSidebar } from '@/components/chat/ChatSidebar';

type ConversationLocationState = {
  friendName?: string;
};

export function ConversationPage() {
  const { t } = useTranslation();
  const { conversationId } = useParams();
  const location = useLocation();
  const locationState = location.state as ConversationLocationState | null;
  const friendName = locationState?.friendName;
  const title = friendName ? t('chat.chatWith', { friendName }) : '';
  const navigate = useNavigate();

  if (!conversationId) return null;

  return (
    <ConversationView
      conversationId={conversationId}
      title={title}
      onBack={() => navigate('/app/chat')}
    />
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
  return (
    <div className="md:hidden">
      <ConversationListSidebar />
    </div>
  );
}