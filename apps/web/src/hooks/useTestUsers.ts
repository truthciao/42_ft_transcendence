import { useQuery } from '@tanstack/react-query';
import { getTestUsers } from '../api/users';

export function useTestUsers() {
  return useQuery({
    queryKey: ['test-users'],
    queryFn: getTestUsers,
  });
}