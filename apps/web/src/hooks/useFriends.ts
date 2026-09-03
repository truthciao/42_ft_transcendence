import { useQuery } from '@tanstack/react-query';
import {
  getFriends,
  getPendingRequests,
  getSentPendingRequests,
} from '../api/friends';

export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: getFriends,
  });
}

export function useFriendRequests() {
  return useQuery({
    queryKey: ['friendRequests'],
    queryFn: getPendingRequests,
  });
}

export function useSentFriendRequests() {
  return useQuery({
    queryKey: ['sentFriendRequests'],
    queryFn: getSentPendingRequests,
  });
}
