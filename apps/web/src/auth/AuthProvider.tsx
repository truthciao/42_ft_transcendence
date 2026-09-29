import { useEffect, useState } from 'react';
import type { CurrentUser } from '@repo/shared-types';
import { AuthContext } from './AuthContext';
import { getCurrentUser } from '../api/users';
import i18n from '../i18n';
import { HttpError } from '../lib/http';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();

      setUser(currentUser);

      if (
        currentUser.preferredLanguage &&
        currentUser.preferredLanguage !== i18n.language
      ) {
        void i18n.changeLanguage(currentUser.preferredLanguage);
      }
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }

      setUser(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
