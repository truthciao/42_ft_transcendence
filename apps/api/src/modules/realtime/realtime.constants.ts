export const REALTIME_EVENTS = {
  CONNECTED: 'connected',
  ERROR: 'exception',
  PING: 'ping',
  PONG: 'pong',
  ROOM_JOIN: 'room:join',
  ROOM_JOINED: 'room:joined',
  ROOM_LEAVE: 'room:leave',
  ROOM_LEFT: 'room:left',
  ROOM_MEMBER_JOINED: 'room:member-joined',
  ROOM_MEMBER_LEFT: 'room:member-left',
} as const;
