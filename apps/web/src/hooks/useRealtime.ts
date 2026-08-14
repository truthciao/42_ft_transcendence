import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const API_BASE_URI =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function useRealtime(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const token = localStorage.getItem('access_token');

    if (!token) {
      return;
    }

    const socket = io(API_BASE_URI, {
      auth: {
        token,
      },
    });

    socket.on('friend-request:received', () => {
      queryClient.invalidateQueries({
        queryKey: ['friendRequests'],
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, queryClient]);
}