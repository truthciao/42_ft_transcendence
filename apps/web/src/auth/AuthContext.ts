import { createContext } from 'react';
import type { CurrentUser } from '@repo/shared-types';

export interface AuthContextType {
  user: CurrentUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});
