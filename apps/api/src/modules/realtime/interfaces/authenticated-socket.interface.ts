import type { DefaultEventsMap, Socket } from 'socket.io';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface.js';

export type AuthenticatedSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { user: AuthenticatedUser }
>;
