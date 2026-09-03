import { io } from 'socket.io-client';

const token = process.env.TOKEN;

if (!token) {
  throw new Error('ACCESS_TOKEN is required');
}

const socket = io('http://localhost:3000', {
  auth: {
    token,
  },
});

socket.on('connect', () => {
  console.log('connected:', socket.id);

  socket.emit('room:join', {
    room: 'a'.repeat(200),
  });
});

socket.on('connect_error', (error) => {
  console.error('connect_error:', error);
});

socket.on('exception', (error) => {
  console.error('exception:', error);
});
