import { useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getSocket } from '@/lib/realtime';
import { RealtimeContext } from './RealtimeContext';

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    const socket = getSocket();

    const handleOnline = ({ userId }: { userId: number }) => {
      setOnlineUserIds((current) => {
        const next = new Set(current);
        next.add(userId);
        return next;
      });
    };

    const handleUsersOnline = ({ userIds }: { userIds: number[] }) => {
      setOnlineUserIds(new Set(userIds));
    };

    const handleOffline = ({ userId }: { userId: number }) => {
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

      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
    };

    const handleFriendRequestAccepted = () => {
      queryClient.invalidateQueries({
        queryKey: ['friends'],
      });

      queryClient.invalidateQueries({
        queryKey: ['friendRequests'],
      });

      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
    };

    const handleFriendRequestRejected = () => {
      queryClient.invalidateQueries({
        queryKey: ['sentFriendRequests'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
    };

    const handleFriendRemoved = () => {
      queryClient.invalidateQueries({
        queryKey: ['friends'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
    };

    const handleConversationCreated = () => {
      window.dispatchEvent(new Event('refresh_conversations'));
    };

    const handleUserProfileUpdated = ({
      userId,
      avatarUrl,
    }: {
      userId: number;
      avatarUrl: string;
    }) => {
      window.dispatchEvent(
        new CustomEvent('user_profile_updated', {
          detail: {
            userId,
            avatarUrl,
          },
        }),
      );
    };

    const handleWorkspaceInviteReceived = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspace-invites', 'incoming'],
      });
    };

    const handleWorkspaceInviteAccepted = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
    };

    const handleWorkspaceMemberRemoved = (payload: { workspaceId: number }) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspace', payload.workspaceId],
      });
    };

    const handleWorkspaceRoleChanged = (payload: { workspaceId: number }) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspace', payload.workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    };

    socket.on('users:online', handleUsersOnline);
    socket.on('user:online', handleOnline);
    socket.on('user:offline', handleOffline);

    socket.on('friend-request:received', handleFriendRequest);

    socket.on('friend-request:accepted', handleFriendRequestAccepted);

    socket.on('friend-request:rejected', handleFriendRequestRejected);

    socket.on('friend:removed', handleFriendRemoved);

    socket.on('conversation.created', handleConversationCreated);

    socket.on('user:profile-updated', handleUserProfileUpdated);

    socket.on('workspace-invite:received', handleWorkspaceInviteReceived);

    socket.on('workspace-invite:accepted', handleWorkspaceInviteAccepted);

    socket.on('workspace-member:removed', handleWorkspaceMemberRemoved);

    socket.on('workspace-role:changed', handleWorkspaceRoleChanged);

    return () => {
      socket.off('users:online', handleUsersOnline);
      socket.off('user:online', handleOnline);
      socket.off('user:offline', handleOffline);

      socket.off('friend-request:received', handleFriendRequest);

      socket.off('friend-request:accepted', handleFriendRequestAccepted);

      socket.off('friend-request:rejected', handleFriendRequestRejected);

      socket.off('friend:removed', handleFriendRemoved);

      socket.off('conversation.created', handleConversationCreated);

      socket.off('user:profile-updated', handleUserProfileUpdated);

      socket.off('workspace-invite:received', handleWorkspaceInviteReceived);

      socket.off('workspace-invite:accepted', handleWorkspaceInviteAccepted);

      socket.off('workspace-member:removed', handleWorkspaceMemberRemoved);

      socket.off('workspace-role:changed', handleWorkspaceRoleChanged);

      setOnlineUserIds(new Set());
    };
  }, [loading, user, queryClient]);

  return (
    <RealtimeContext.Provider value={{ onlineUserIds }}>
      {children}
    </RealtimeContext.Provider>
  );
}
