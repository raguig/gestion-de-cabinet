import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const verifyToken = async (token) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}api/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        // Ensure isAdmin is explicitly set
        setUser({
          ...userData,
          isAdmin: Boolean(userData.isAdmin),
        });
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || "Login failed" };
      }

      const data = await response.json();

      // Fetch complete user data immediately after login
      const userResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser({
          ...userData,
          isAdmin: Boolean(data.isAdmin),
        });
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("doctorId", data.id);
      navigate("/");
      return { success: true, data };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error occurred" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login"); // Redirect to login
  };

  const value = {
    user,
    login,
    logout,
    loading, // Make sure loading is included in the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
