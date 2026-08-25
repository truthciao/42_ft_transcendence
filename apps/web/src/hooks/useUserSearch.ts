import { useInfiniteQuery } from '@tanstack/react-query';
import { searchUsers } from '../api/users';

const PAGE_SIZE = 20;

export function useUserSearch(username: string) {
  return useInfiniteQuery({
    queryKey: ['users', 'search', username],

    queryFn: ({ pageParam }) =>
      searchUsers(username, PAGE_SIZE, pageParam),

    initialPageParam: 0,

    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) {
        return undefined;
      }

      return allPages.length * PAGE_SIZE;
    },

    enabled: username.trim().length >= 2,
  });
}