"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthUser {
  email: string;
  userId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore from localStorage
    try {
      const stored = localStorage.getItem("gl_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setIsLoading(false);
  }, []);

  const login = (email: string) => {
    // TODO: Replace with proper Convex Auth magic link verification
    // For now, simplified email-based auth
    const userData = { email, userId: email };
    setUser(userData);
    localStorage.setItem("gl_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("gl_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
