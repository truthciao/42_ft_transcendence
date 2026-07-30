import type { WorkspaceMember } from 'src/generated/prisma/client';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';

declare global {
  namespace Express {
    type User = AuthenticatedUser;

    interface Request {
      workspaceMembership?: WorkspaceMember;
    }
  }
}

export {};
