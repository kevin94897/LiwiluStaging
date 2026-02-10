import logger from '@/lib/logger';
import { User, clearAuthSession, getCurrentUser, isAuthenticated } from '@/lib/auth/authUtils';

export type { User };

// ============================================
// Logout con redirección a home
// ============================================

interface LogoutResponse {
  success: boolean;
  message: string;
}

export const logoutUser = async (): Promise<LogoutResponse> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      }).catch(err => logger.warn("Logout warning:", err));
    }

    // 🔹 Siempre limpiar la sesión localmente
    clearAuthSession();

    // 🔹 Redirigir al home después de cerrar sesión
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }

    return { success: true, message: "Sesión cerrada correctamente" };
  } catch (err: unknown) {
    clearAuthSession();

    if (typeof window !== "undefined") {
      window.location.href = "/";
    }

    return { success: false, message: "Error al cerrar sesión" };
  }
};

export { getCurrentUser, isAuthenticated };
