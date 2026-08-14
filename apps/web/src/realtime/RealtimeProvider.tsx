import { useEffect, type ReactNode } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URI =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function RealtimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (loading || !user) {
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

    const handleFriendRequest = () => {
      queryClient.invalidateQueries({
        queryKey: ['friendRequests'],
      });
    };

    socket.on('friend-request:received', handleFriendRequest);

    return () => {
      socket.off('friend-request:received', handleFriendRequest);
      socket.disconnect();
    };
  }, [loading, user, queryClient]);

  return children;
}