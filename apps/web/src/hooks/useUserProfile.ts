import { useQuery } from '@tanstack/react-query';

import { getUserProfile } from '../api/users';

export function useUserProfile(userId: number) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: userId > 0,
  });
}
