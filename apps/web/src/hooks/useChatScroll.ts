import { 
  useEffect, 
  useLayoutEffect , 
  useRef 
} from 'react';
import type { ChatMessage } from '@/api/chat';

interface UseChatScrollProps {
  conversationId: string;
  messages: ChatMessage[];
  isLoading: boolean;
}

export function useChatScroll({ 
  conversationId,
  messages,
  isLoading,
}: UseChatScrollProps) {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const previousScrollHeightRef = useRef<number | null>(null);
  const shouldScrollToBottomRef = useRef(true);

  const isNearBottom = (container: HTMLDivElement) => {
    const threshold = 100;

    return (
      container.scrollHeight -
        container.scrollTop -
        container.clientHeight <
      threshold
    );
  };

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      shouldScrollToBottomRef.current = isNearBottom(container);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const previousScrollHeight = previousScrollHeightRef.current;

    if (previousScrollHeight === null) {
      return;
    }

    const heightDifference = container.scrollHeight - previousScrollHeight;

    container.scrollTop += heightDifference;

    previousScrollHeightRef.current = null;
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container || isLoading) {
      return;
    }

    if (previousScrollHeightRef.current !== null) {
      return;
    }

    if (shouldScrollToBottomRef.current) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [conversationId, isLoading, messages.length]);

  return {
    messagesContainerRef,
    previousScrollHeightRef,
    shouldScrollToBottomRef,
  };
}