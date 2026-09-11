import {
  type SubmitEvent,
  type ReactNode,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getMyConversations,
  type ChatMessage,
} from '@/api/chat';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatScroll } from '@/hooks/useChatScroll';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { useChatRealtime } from '@/hooks/useChatRealtime';
import { useChatSendMessage } from '@/hooks/useChatSendMessage';
import { useChatRead } from '@/hooks/useChatRead';
import {
  type AttachmentType,
} from '@/components/common/FileUpload';
import { MessageSearchDialog } from './MessageSearchDialog';
import { ConversationHeader } from './ConversationHeader';
import { ConversationMessageList } from './ConversationMessageList';
import { MessageInput } from './MessageInput';

const API_BASE_URI = import.meta.env.VITE_API_URL ?? '/api';

interface ConversationViewProps {
  conversationId: string;
  title: ReactNode;
  headerIcon?: ReactNode;
}

export function ConversationView({
  conversationId,
  title,
  headerIcon,
}: ConversationViewProps) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { onlineUserIds } = useRealtime();

  const { data: conversations } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: getMyConversations,
  });

  const currentConversation = conversations?.find(
    (conversation) => Number(conversation.id) === Number(conversationId),
  );

  const otherMember = currentConversation?.members?.find(
    (member) => member.userId !== currentUser?.id,
  );

  const otherUserId = otherMember?.userId;
  const otherUserName = otherMember?.user.username;

  const isOtherUserOnline =
    otherUserId !== undefined && onlineUserIds.has(otherUserId);

  const {
    messages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(conversationId);

  const [inputText, setInputText] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    number | null
  >(null);

  useChatRealtime({
    conversationId,
  });

  useChatRead({
    conversationId,
  });

  const { 
    sendTextMessage, 
    sendFileMessage,
  } = useChatSendMessage({
    conversationId,
  });

  const {
    messagesContainerRef,
    previousScrollHeightRef,
  } = useChatScroll({
    conversationId,
    messages,
    isLoading,
  });


  const handleLoadOlderMessages = () => {
    const container = messagesContainerRef.current;

    if (!container || isFetchingNextPage || !hasNextPage) {
      return;
    }

    previousScrollHeightRef.current = container.scrollHeight;

    fetchNextPage();
  };

  const handleSelectMessage = async (message: ChatMessage) => {
    setIsSearchOpen(false);

    while (!document.getElementById(`message-${message.id}`) && hasNextPage) {
      previousScrollHeightRef.current =
        messagesContainerRef.current?.scrollHeight ?? null;

      const result = await fetchNextPage();

      const loadedMessages =
        result.data?.pages.flatMap((page) => page.messages) ?? [];

      if (loadedMessages.some((msg) => msg.id === message.id)) {
        break;
      }

      if (!result.hasNextPage) {
        break;
      }
    }

    requestAnimationFrame(() => {
      const element = document.getElementById(`message-${message.id}`);

      if (!element) {
        return;
      }

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      setHighlightedMessageId(message.id);

      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    });
  };
 
  function handleSendMessage(e: SubmitEvent) {
    e.preventDefault();

    const content = inputText.trim();

    if (!content) {
      return;
    }

    sendTextMessage(content);

    setInputText('');
  }

  const handleFileUploadSuccess = (attachment: AttachmentType) => {
    sendFileMessage(
      attachment.fileUrl,
      attachment.fileType,
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
     <ConversationHeader
      title={title}
      headerIcon={headerIcon}
      otherUserName={otherUserName}
      isOtherUserOnline={isOtherUserOnline}
      onSearch={() => setIsSearchOpen(true)}
    /> 
      <ConversationMessageList
        messagesContainerRef={messagesContainerRef}
        messages={messages}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadOlderMessages={handleLoadOlderMessages}
        currentUserId={currentUser?.id}
        highlightedMessageId={highlightedMessageId}
        apiBaseUri={API_BASE_URI}
        t={t}
      />
      
      <MessageInput
        inputText={inputText}
        onInputChange={setInputText}
        onSendMessage={handleSendMessage}
        onFileUploadSuccess={handleFileUploadSuccess}
      />

      <MessageSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        conversationId={conversationId}
        onSelectMessage={handleSelectMessage}
      />
    </section>
  );
}
