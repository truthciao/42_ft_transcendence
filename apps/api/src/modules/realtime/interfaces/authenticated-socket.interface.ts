import type { Socket } from 'socket.io';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';

export type AuthenticatedSocket = Socket & {
  data: { user: AuthenticatedUser };
};
