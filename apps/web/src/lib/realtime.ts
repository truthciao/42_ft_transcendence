import { io, type Socket } from 'socket.io-client';

const API_BASE_URI =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem('access_token');

    console.log('🔥🔥🔥 CREATING SHARED SOCKET');

    socket = io(API_BASE_URI, {
      auth: {
        token,
      },
    });

  socket.on('connect', () => {
  console.log('🔥🔥🔥 SHARED SOCKET CONNECTED:', socket?.id);
});

  socket.on('disconnect', (reason) => {
  console.log('🔥🔥🔥 SHARED SOCKET DISCONNECTED:', reason);
});


  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}