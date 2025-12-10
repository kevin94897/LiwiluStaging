// components/ProtectedRoute.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { validateToken } from '@/lib/auth/apiClient';

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
    fallback = <LoadingScreen />
}: ProtectedRouteProps) {
    const [isValidating, setIsValidating] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const hasCheckedRef = useRef(false);

    useEffect(() => {
        // Evitar múltiples validaciones
        if (hasCheckedRef.current) return;
        hasCheckedRef.current = true;

        const checkAuth = async () => {
            try {
                // Verificar si hay tokens antes de validar
                const accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');

                if (!accessToken || !refreshToken) {
                    console.log('🔒 No hay tokens, redirigiendo al home...');
                    router.push('/');
                    return;
                }

                setIsValidating(true);

                // Validar token con el servidor
                const isValid = await validateToken();

                if (!isValid) {
                    console.log('🔒 Token inválido, redirigiendo al home...');
                    router.push('/');
                    return;
                }

                setIsAuthenticated(true);
                setIsValidating(false);
            } catch (error) {
                console.error('❌ Error al validar autenticación:', error);
                router.push('/');
            }
        };

        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Sin dependencias para evitar re-renders

    if (isValidating) {
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
                <p className="text-gray-400 text-sm mt-2">Por favor espera un momento</p>
            </div>
        </div>
    );
}