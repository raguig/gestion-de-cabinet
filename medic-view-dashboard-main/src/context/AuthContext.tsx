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
        "https://amine-back-lvdsgp24s-raguigs-projects.vercel.app/api/auth/me",
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
        "https://amine-back-lvdsgp24s-raguigs-projects.vercel.app/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Ensure isAdmin is explicitly set
        setUser({
          ...data,
          isAdmin: Boolean(data.isAdmin),
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("doctorId", data.id);
        navigate("/");
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
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
