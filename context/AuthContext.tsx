// context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, mapApiUserToUser } from "@/lib/auth/authUtils";
import { getCookie, removeCookie } from "@/lib/cookies";
import { stopTokenRefresh, startTokenRefresh } from "@/lib/auth/tokenManager";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from cookies on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userCookie = getCookie("user");

        if (userCookie) {
          const parsedUser = JSON.parse(userCookie);
          const mappedUser = mapApiUserToUser(parsedUser);
          setUser(mappedUser);

          // Start token refresh mechanism only if we have a valid session
          // This prevents errors when there's no active session
          try {
            await startTokenRefresh();
          } catch (error) {
            console.warn("⚠️ Could not start token refresh:", error);
            // Don't throw - user might not be logged in
          }
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error);
        // Clear invalid cookies
        removeCookie("user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      stopTokenRefresh();
    };
  }, []);

  // Listen for storage events (for multi-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" && e.newValue) {
        try {
          const parsedUser = JSON.parse(e.newValue);
          const mappedUser = mapApiUserToUser(parsedUser);
          setUser(mappedUser);
        } catch (error) {
          console.error("❌ Error parsing user from storage event:", error);
        }
      } else if (e.key === "user" && !e.newValue) {
        // User was logged out in another tab
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => {
    try {
      // Call API route to set httpOnly cookies
      const response = await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, accessToken, refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to set session");
      }

      const mappedUser = mapApiUserToUser(user);
      setUser(mappedUser);

      // Start token refresh mechanism
      startTokenRefresh();

      console.log("✅ User logged in successfully:", mappedUser);
    } catch (error) {
      console.error("❌ Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Stop token refresh
      stopTokenRefresh();

      // Call API route to clear httpOnly cookies
      await fetch("/api/auth/clear-session", {
        method: "POST",
        credentials: "include",
      });

      // Clear client-side state
      setUser(null);
      removeCookie("user");

      // Clear any localStorage remnants (for migration period)
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }

      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Error during logout:", error);
      // Even if API call fails, clear local state
      setUser(null);
      removeCookie("user");
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };

      // Update user cookie (not httpOnly, so we can update it)
      try {
        document.cookie = `user=${JSON.stringify(updated)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      } catch (error) {
        console.error("❌ Error updating user cookie:", error);
      }

      return updated;
    });
  };

  const refreshUser = () => {
    try {
      const userCookie = getCookie("user");
      if (userCookie) {
        const parsedUser = JSON.parse(userCookie);
        const mappedUser = mapApiUserToUser(parsedUser);
        setUser(mappedUser);
      }
    } catch (error) {
      console.error("❌ Error refreshing user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use authentication context
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
