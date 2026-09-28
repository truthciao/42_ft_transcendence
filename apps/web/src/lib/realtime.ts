import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem('access_token');

    socket = io({
      // The provider must register its presence listeners before the server can
      // emit the initial `users:online` snapshot.
      autoConnect: false,
      auth: {
        token,
      },
    });
  }

  return socket;
}

export function connectSocket(): void {
  socket?.connect();
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
