export const USER_ROOM_PREFIX = 'user';

export function getUserRoom(userId: number): string {
  return `${USER_ROOM_PREFIX}:${userId}`;
}
