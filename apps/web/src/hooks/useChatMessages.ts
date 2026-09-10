import { useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getConversationMessages } from '@/api/chat';

export function useChatMessages(conversationId: string) {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['chat-messages', conversationId],

    queryFn: async ({ pageParam }) => {
      const result = await getConversationMessages(
        conversationId,
        pageParam,
        30,
      );

      return result;
    },

    initialPageParam: undefined as number | undefined,

    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor ?? undefined;
    },

    refetchOnMount: 'always',
  });

  useEffect(() => {
    refetch();
  }, [conversationId, refetch]);

  const messages = useMemo(
    () =>
      data?.pages
        .flatMap((page) => page.messages)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime(),
        ) ?? [],
    [data],
  );

  return {
    messages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}