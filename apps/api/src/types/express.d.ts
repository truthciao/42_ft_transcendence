import type { WorkspaceMember } from 'src/generated/prisma/client';
import type { AuthenticatedUser } from '../modules/auth/interfaces/authenticated-user.interface.ts';

declare global {
  namespace Express {
    type User = AuthenticatedUser;
    interface Request {
      workspaceMembership?: WorkspaceMember;
    }
  }
}

export {};
