import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../api/friends';

export function useUserSearch(username: string) {
  return useQuery({
    queryKey: ['user-search', username],
    queryFn: () => searchUsers(username),
    enabled: username.trim().length >= 2,
  });
}