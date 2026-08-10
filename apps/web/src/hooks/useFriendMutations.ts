import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from '../api/friends';

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendFriendRequest,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['friendRequests'],
      });
    },
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptFriendRequest,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['friends'],
      });

      queryClient.invalidateQueries({
        queryKey: ['friendRequests'],
      });
    },
  });
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectFriendRequest,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['friendRequests'],
      });
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFriend,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['friends'],
      });
    },
  });
}
