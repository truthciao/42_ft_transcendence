import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { searchUsers } from '../api/friends';

export function useUserSearch(username: string) {
  const [debouncedUsername, setDebouncedUsername] = useState(username);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [username]);

  return useQuery({
    queryKey: ['user-search', debouncedUsername],
    queryFn: () => searchUsers(debouncedUsername),
    enabled: debouncedUsername.trim().length >= 2,
  });
}