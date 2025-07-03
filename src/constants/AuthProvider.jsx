import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    if (token && role) {
      setUser({ role, token });
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    sessionStorage.setItem("token", userData.token);
    sessionStorage.setItem("role", userData.role);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
