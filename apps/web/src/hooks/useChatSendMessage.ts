import { getSocket } from '@/lib/realtime';

interface UseChatSendMessageProps {
  conversationId: string;
}

export function useChatSendMessage({
  conversationId,
}: UseChatSendMessageProps) {
  const sendTextMessage = (content: string) => {
    const socket = getSocket();

    socket.emit('chat:message:send', {
      conversationId: Number(conversationId),
      content,
      type: 'text',
    });
  };

  const sendFileMessage = (
    fileUrl: string,
    fileType: string,
  ) => {
    const socket = getSocket();
    const messageType = fileType.startsWith('image/')
      ? 'image'
      : 'file';

    socket.emit('chat:message:send', {
      conversationId: Number(conversationId),
      content: fileUrl,
      type: messageType,
    });
  };

  return {
    sendTextMessage,
    sendFileMessage,
  };
}