// ============================================
// hooks/useAuth.ts
// ============================================
import { useState, useEffect } from "react";
import { loginUser } from "../pages/api/auth/login";
import { logoutUser, getCurrentUser, isAuthenticated as checkAuth } from "../pages/api/auth/logout";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const currentUser = getCurrentUser();
      const hasToken = checkAuth();

      if (currentUser && hasToken) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error al verificar autenticación:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser({ email, password });

      if (response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
      }
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }
      if (response.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
      }

      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuth: checkAuthentication,
  };
}