// lib/auth/services/authService.ts
import { startTokenRefresh, clearSession, revokeRefreshToken } from '@/lib/auth/tokenManager';
import { User, saveSession, clearAuthSession } from '@/lib/auth/authUtils';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Service for user login.
 * Calls the Next.js API route (/api/auth/login) which proxies to the backend and sets httpOnly cookies.
 */
export const loginUser = async (
  data: { email: string; password: string },
  options: { skipRedirect?: boolean; redirectTo?: string } = {}
): Promise<LoginResponse> => {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    const response = await res.json() as LoginResponse;

    // After proxy sets cookies, we still call startTokenRefresh for client-side scheduling
    startTokenRefresh();

    if (typeof window !== "undefined" && !options.skipRedirect) {
      window.location.href = options.redirectTo || "/";
    }

    return response;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Error desconocido en login");
  }
};

/**
 * Service for user registration.
 */
export const registerUser = async (data: any): Promise<any> => {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al registrarse");
    }

    const response = await res.json();
    
    startTokenRefresh();
    
    return response;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Error desconocido en registro");
  }
};

/**
 * Service for user logout.
 */
export const logoutUser = async (): Promise<any> => {
  try {
    // Notify proxy/backend to revoke refreshToken
    await fetch("/api/auth/logout", { method: "POST" }).catch(err => console.warn("Logout warning:", err));

    // Clear local state
    await clearSession();

    if (typeof window !== "undefined") {
      window.location.href = "/";
    }

    return { success: true };
  } catch (err) {
    console.error("Logout error:", err);
    await clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return { success: false };
  }
};
