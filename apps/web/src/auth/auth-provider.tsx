import { useEffect, useState } from "react";

import { AuthContext } from "./AuthContext";
import type { User } from "./AuthContext";

import { getCurrentUser } from "../api/users";


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
      const currentUser = await getCurrentUser();

      setUser(currentUser);

    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

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