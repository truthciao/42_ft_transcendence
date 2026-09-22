import { UserRole } from '../../../generated/prisma/enums.js';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  username: string;
  role: UserRole;
}
