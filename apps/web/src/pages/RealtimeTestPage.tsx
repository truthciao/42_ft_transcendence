import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export function RealtimeTestPage() {
  useEffect(() => {
    const token = 'YOUR_JWT';

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    socket.on('connect', () => {
      console.log('CONNECTED', socket.id);

      socket.emit('document:join', {
        documentId: 3,
      });
    });

    socket.on('document:joined', (data) => {
      console.log('JOINED', data);
    });

    socket.on('document:updated', (data) => {
      console.log('UPDATED', data);
    });

    socket.on('exception', (error) => {
      console.error('ERROR', error);
    });

    return () => {
      socket.emit('document:leave', {
        documentId: 3,
      });

      socket.disconnect();
    };
  }, []);

  return <div>Realtime test</div>;
}