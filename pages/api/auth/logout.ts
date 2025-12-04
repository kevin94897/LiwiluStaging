// ============================================
// Definición de usuario para correcta tipificación
// ============================================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

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

    if (!accessToken) {
      throw new Error("No hay sesión activa");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 🔹 Siempre limpiar la sesión
    clearSession();

    // 🔹 Redirigir al home después de cerrar sesión
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.warn(
        "Advertencia al cerrar sesión:",
        errorData?.message ?? "Error desconocido"
      );

      return { success: false, message: "Sesión cerrada con advertencias" };
    }

    return { success: true, message: "Sesión cerrada correctamente" };
  } catch (err: unknown) {
    clearSession();

    // 🔹 Redirigir al home incluso si hay error
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }

    if (err instanceof Error) {
      throw new Error(err.message);
    }

    throw new Error("Error desconocido al intentar cerrar sesión");
  }
};

// ============================================
// Helpers
// ============================================

const clearSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// ============================================
// Obtener usuario actual (validado y tipado)
// ============================================

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    const parsed = JSON.parse(userStr);

    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.email === "string"
    ) {
      return parsed as User;
    }

    return null;
  } catch {
    return null;
  }
};

// ============================================
// Estado simple de autenticación
// ============================================

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
};