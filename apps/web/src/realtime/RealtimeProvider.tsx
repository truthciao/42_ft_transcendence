import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getSocket, disconnectSocket } from '@/lib/realtime';

interface RealtimeContextValue {
  onlineUserIds: Set<number>;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    const socket = getSocket();

    console.log('RealtimeProvider socket:', socket.id);

    const handleOnline = ({ userId }: { userId: number }) => {
      console.log('USER_ONLINE', userId);

      setOnlineUserIds((current) => {
        const next = new Set(current);
        next.add(userId);
        return next;
      });
    };

    const handleOffline = ({ userId }: { userId: number }) => {
      console.log('USER_OFFLINE', userId);

      setOnlineUserIds((current) => {
        const next = new Set(current);
        next.delete(userId);
        return next;
      });
    };

    const handleFriendRequest = () => {
      queryClient.invalidateQueries({
        queryKey: ['friendRequests'],
      });
    };

    socket.on('user:online', handleOnline);
    socket.on('user:offline', handleOffline);
    socket.on('friend-request:received', handleFriendRequest);

    return () => {
      socket.off('user:online', handleOnline);
      socket.off('user:offline', handleOffline);
      socket.off('friend-request:received', handleFriendRequest);

      disconnectSocket();
      setOnlineUserIds(new Set());
    };
  }, [loading, user, queryClient]);

  return (
    <RealtimeContext.Provider value={{ onlineUserIds }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error(
      'useRealtime must be used within RealtimeProvider',
    );
  }

  return context;
}