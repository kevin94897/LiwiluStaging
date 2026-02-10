import logger from '@/lib/logger';
import { startTokenRefresh } from '@/lib/auth/tokenManager';
import { User, saveSession, getCurrentUser, isAuthenticated, clearAuthSession } from '@/lib/auth/authUtils';

export type { User };

// ============================================
// Login con recarga de página
// ============================================

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export const loginUser = async (
  data: { email: string; password: string },
  options: { skipRedirect?: boolean; redirectTo?: string } = {}
): Promise<LoginResponse> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    const response = await res.json() as LoginResponse;

    // 🔹 Guardar tokens y datos del usuario usando la utilidad centralizada
    if (response.data) {
      saveSession(
        response.data.user,
        response.data.accessToken,
        response.data.refreshToken
      );
    }

    // 🛒 Intentar refrescar el carrito para el usuario autenticado
    try {
      // Al no existir mergeCart, simplemente pedimos el carrito o dejamos que el componente cargue los datos
      logger.log("🛒 Login exitoso, el carrito debería sincronizarse automáticamente");
    } catch (cartError) {
      logger.warn("⚠️ No se pudo sincronizar el carrito:", cartError);
    }

    // 🆕 Iniciar sistema de renovación automática de tokens
    startTokenRefresh();

    // 🔹 Recargar la página después del login exitoso (si no se indica lo contrario)
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
 * @deprecated Use clearAuthSession from authUtils instead
 * Keeping for backward compatibility if needed by other components temporarily
 */
export const logoutUser = async (): Promise<any> => {
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
      }).catch(err => logger.warn("Silent logout failure:", err));
    }

    clearAuthSession();

    if (typeof window !== "undefined") {
      window.location.href = "/";
    }

    return { success: true };
  } catch (err) {
    clearAuthSession();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return { success: false };
  }
};

export { getCurrentUser, isAuthenticated };
