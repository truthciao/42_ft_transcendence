import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface.js';
import type { AuthenticatedSocket } from '../interfaces/authenticated-socket.interface.js';

export const WsCurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const client: AuthenticatedSocket = ctx.switchToWs().getClient();

    const user = client.data?.user;
    return data ? user?.[data] : user;
  },
);
