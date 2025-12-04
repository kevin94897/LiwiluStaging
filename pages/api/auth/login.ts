// ============================================
// pages/api/auth/login.ts
// ============================================
export const loginUser = async (data: { email: string; password: string }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    return await res.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
};