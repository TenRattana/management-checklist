import { saveUserData, loadUserData, removeUserData } from '@/app/services/storage';
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: string | null;
  role: string | null;
  loading: boolean;
  login: (values: { username: string }) => { success: boolean; role: string | null };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [data] = useState<User[]>([
    { username: "Ten", role: "admin" },
    { username: "1", role: "user" },
    { username: "2", role: "guest" },
  ]);

  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = await loadUserData();
      if (storedUser) {
        setUser(storedUser.username);
        setRole(storedUser.role);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const login = (values: { username: string }) => {
    const foundUser = data.find((v) => v.username === values.username);
    const userRole = foundUser ? foundUser.role : null;

    if (foundUser) {
      saveUserData({ username: values.username, role: userRole });
      setUser(values.username);
      setRole(userRole);
      return { success: true, role: userRole };
    } else {
      return { success: false, role: null };
    }
  };

  const logout = () => {
    removeUserData();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
