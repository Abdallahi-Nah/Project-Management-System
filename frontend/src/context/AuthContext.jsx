// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/api"; // ✅ التأكد من استيراد api

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // جلب بيانات المستخدم من السيرفر
          const { data } = await api.get("/auth/me");
          setUser(data.data);
        } catch (error) {
          console.error("Auto-login failed", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      const newToken = data.data.token;
      localStorage.setItem("token", newToken);

      setToken(newToken);
      setUser(data.data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل تسجيل الدخول",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      const newToken = data.data.token;
      localStorage.setItem("token", newToken);

      setToken(newToken);
      setUser(data.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل إنشاء الحساب",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
