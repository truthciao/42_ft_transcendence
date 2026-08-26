import { useEffect } from 'react';
import { getSocket } from '../lib/realtime';

interface DocumentUpdatedData {
  id: number;
  title: string;
  content: string;
  workspaceId: number;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
}

export function useDocumentRealtime(
  documentId: number,
  onUpdated: (data: DocumentUpdatedData) => void,
) {
  useEffect(() => {
    const socket = getSocket();

    const handleJoined = (data: { documentId: number }) => {
      console.log('[realtime] document joined', data);
    };

    const handleUpdated = (data: DocumentUpdatedData) => {
      console.log('[realtime] document updated', data);
      onUpdated(data);
    };

    socket.emit('document:join', {
      documentId,
    });

    socket.on('document:joined', handleJoined);
    socket.on('document:updated', handleUpdated);

    return () => {
      socket.emit('document:leave', {
        documentId,
      });

      socket.off('document:joined', handleJoined);
      socket.off('document:updated', handleUpdated);
    };
  }, [documentId, onUpdated]);
}