import { io, type Socket } from 'socket.io-client';

const API_BASE_URI =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem('access_token');

    socket = io(API_BASE_URI, {
      auth: {
        token,
      },
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}