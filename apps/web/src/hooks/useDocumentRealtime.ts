import { useEffect } from 'react';
import { getSocket } from '../lib/realtime';

export interface DocumentUpdatePatch {
  documentId: number;
  title?: string;
  content?: string;
}

export function useDocumentRealtime(
  documentId: number,
  onUpdated: (data: DocumentUpdatePatch) => void,
) {
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      socket.emit('document:join', {
        documentId,
      });
    };

    const handleUpdated = (data: DocumentUpdatePatch) => {
      onUpdated(data);
    };

    const handleError = (error: unknown) => {
      console.error(
        '[document realtime] ERROR',
        error,
      );
    };

    socket.on('connect', handleConnect);
    socket.on('document:updated', handleUpdated);
    socket.on('exception', handleError);

    if (socket.connected) {
      socket.emit('document:join', {
        documentId,
      });
    }

    return () => {
      socket.emit('document:leave', {
        documentId,
      });

      socket.off('connect', handleConnect);
      socket.off('document:updated', handleUpdated);
      socket.off('exception', handleError);
    };
  }, [documentId, onUpdated]);
}

export function updateDocument(
  patch: Omit<DocumentUpdatePatch, 'documentId'>,
  documentId: number,
) {
  getSocket().emit('document:updated', {
    documentId,
    ...patch,
  });
}