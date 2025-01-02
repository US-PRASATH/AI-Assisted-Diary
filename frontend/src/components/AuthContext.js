import React, { createContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const { exp } = jwtDecode(token);
        console.log(exp);
        const currentTime = Date.now() / 1000;

        if (exp > currentTime) {
          setAuthToken(token);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem("authToken");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("authToken", token);
    setAuthToken(token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
