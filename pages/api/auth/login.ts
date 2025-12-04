// lib/auth.ts

// ============================================
// Definición de usuario para correcta tipificación
// ============================================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  electronicSignatureUrl?: string | null;
}

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
  data: { email: string; password: string }
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

    // 🔹 Guardar tokens y datos del usuario en localStorage
    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      console.log("✅ AccessToken guardado");
    }

    if (response.data?.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken);
      console.log("✅ RefreshToken guardado");
    }

    if (response.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      console.log("✅ Usuario guardado:", response.data.user);
    }

    // 🔹 Recargar la página después del login exitoso
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }

    return response;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Error desconocido en login");
  }
};

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
  console.log("🧹 Sesión limpiada");
};

// ============================================
// Obtener usuario actual (validado y tipado)
// ============================================

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  if (!userStr) {
    console.log("⚠️ No hay usuario en localStorage");
    return null;
  }

  try {
    const parsed = JSON.parse(userStr);

    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.email === "string" &&
      typeof parsed.firstName === "string" &&
      typeof parsed.lastName === "string"
    ) {
      console.log("✅ Usuario recuperado:", parsed);
      return parsed as User;
    }

    console.log("⚠️ Estructura de usuario inválida:", parsed);
    return null;
  } catch (error) {
    console.error("❌ Error al parsear usuario:", error);
    return null;
  }
};

// ============================================
// Estado simple de autenticación
// ============================================

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const hasToken = !!localStorage.getItem("accessToken");
  console.log("🔐 Usuario autenticado:", hasToken);
  return hasToken;
};