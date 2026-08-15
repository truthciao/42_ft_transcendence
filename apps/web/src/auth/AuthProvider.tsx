import { useEffect, useState } from 'react';
import type { User } from '@repo/shared-types';
import { AuthContext } from './AuthContext';
import { getCurrentUser } from '../api/users';
import i18n from '../i18n'; 

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');

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
