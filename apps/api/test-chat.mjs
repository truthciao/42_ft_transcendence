import { io } from 'socket.io-client';

const TOKEN = process.env.TOKEN_A;

if (!TOKEN) {
  console.error('TOKEN_A is not set');
  process.exit(1);
}

const socket = io('http://localhost:3000', {
  auth: {
    token: TOKEN,
  },
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);

  console.log('Sending message...');

  socket.emit('chat:message:send', {
    conversationId: 2,
    content: 'a'.repeat(4001),
  });
});

socket.on('chat:message:created', (message) => {
  console.log('Message created:');
  console.log(JSON.stringify(message, null, 2));

  socket.disconnect();
});

socket.on('exception', (error) => {
  console.error('WebSocket exception:');
  console.error(JSON.stringify(error, null, 2));
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});