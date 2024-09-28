import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [data] = useState([
    { username: "Ten", role: "admin" },
    { username: "1", role: "user" },
    { username: "2", role: "guest" },
  ]);

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const login = (values) => {
    const foundUser = data.find((v) => v.username === values.username);
    const userRole = foundUser ? foundUser.role : null;
    if (foundUser) {
      setUser(values.username);
      setRole(userRole);
      return { success: true, role: userRole };
    } else {
      return { success: false, role: null };
    }
  };

  const logout = () => {
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
