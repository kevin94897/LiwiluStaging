// ============================================
// pages/api/auth/logout.ts
// ============================================
export const logoutUser = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No hay sesión activa");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    // Limpiar localStorage independientemente de la respuesta
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    if (!res.ok) {
      const errorData = await res.json();
      console.warn("Advertencia al cerrar sesión:", errorData.message);
    }

    return { success: true, message: "Sesión cerrada correctamente" };
  } catch (error: any) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    
    throw new Error(error.message || "Error al cerrar sesión");
  }
};

export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  
  const accessToken = localStorage.getItem("accessToken");
  return !!accessToken;
};