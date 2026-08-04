import { createContext, useEffect, useState } from "react";
import { getCurrentuser } from "@/api/users";

interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});


export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  async function refreshUser() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const currentUser = await getCurrentuser();
      setUser(currentUser);
    } catch {
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "user"
      );
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
