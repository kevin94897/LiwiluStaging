// components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que protege rutas validando el token con /auth/profile
 * Si el token es inválido, intenta renovarlo automáticamente
 * Si falla, redirige al home
 */
export default function ProtectedRoute({
  children,
  fallback = <LoadingScreen />,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("🔒 No hay sesión activa, redirigiendo al home...");
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Pantalla de carga por defecto
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Validando sesión...</p>
        <p className="text-gray-400 text-sm mt-2">
          Por favor espera un momento
        </p>
      </div>
    </div>
  );
}
