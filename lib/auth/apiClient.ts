// lib/auth/apiClient.ts

import { refreshAccessToken, clearSession } from './tokenManager';

/**
 * Cliente HTTP con manejo automático de tokens
 * Intercepta errores 401 y renueva el token automáticamente
 */

interface FetchOptions extends RequestInit {
    skipAuth?: boolean; // Para endpoints públicos
    skipRetry?: boolean; // Para evitar loops infinitos
}

/**
 * Fetch wrapper que maneja automáticamente la renovación de tokens
 */
export const authenticatedFetch = async (
    url: string,
    options: FetchOptions = {}
): Promise<Response> => {
    const { skipAuth = false, skipRetry = false, ...fetchOptions } = options;

    // Si no se debe agregar autenticación, hacer fetch normal
    if (skipAuth) {
        return fetch(url, fetchOptions);
    }

    // Obtener accessToken
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        throw new Error('No hay sesión activa');
    }

    // Agregar Authorization header
    const headers = {
        ...fetchOptions.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    // Hacer la petición
    const response = await fetch(url, {
        ...fetchOptions,
        headers,
    });

    // Si es 401 (Unauthorized), el token expiró
    if (response.status === 401 && !skipRetry) {
        console.log('⚠️ Token expirado (401), intentando renovar...');

        // Intentar renovar el token
        const refreshSuccess = await refreshAccessToken();

        if (refreshSuccess) {
            console.log('✅ Token renovado, reintentando petición...');

            // Reintentar la petición original con el nuevo token
            return authenticatedFetch(url, {
                ...options,
                skipRetry: true, // Evitar loop infinito
            });
        } else {
            console.error('❌ No se pudo renovar el token, cerrando sesión...');
            clearSession();
            window.location.href = '/';
            throw new Error('Sesión expirada');
        }
    }

    return response;
};

/**
 * Valida el token actual usando el endpoint /auth/profile
 * Retorna true si el token es válido, false si no
 */
export const validateToken = async (): Promise<boolean> => {
    try {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            console.log('⚠️ No hay accessToken para validar');
            return false;
        }

        console.log('🔍 Validando token con /auth/profile...');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            console.log('✅ Token válido');
            return true;
        }

        // Si es 401, el token expiró
        if (response.status === 401) {
            console.log('⚠️ Token expirado, intentando renovar...');

            const refreshSuccess = await refreshAccessToken();

            if (refreshSuccess) {
                console.log('✅ Token renovado exitosamente');
                return true;
            } else {
                console.error('❌ No se pudo renovar el token');
                clearSession();
                return false;
            }
        }

        console.error('❌ Error al validar token:', response.status);
        return false;
    } catch (error) {
        console.error('❌ Error en validateToken:', error);
        return false;
    }
};

/**
 * Hook para proteger rutas
 * Valida el token antes de mostrar el contenido
 */
export const useAuthGuard = async (): Promise<boolean> => {
    const isValid = await validateToken();

    if (!isValid) {
        console.log('🔒 Acceso denegado, redirigiendo...');
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
        return false;
    }

    return true;
};

/**
 * Wrapper para GET requests
 */
export const apiGet = async (endpoint: string, options: FetchOptions = {}) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
    return authenticatedFetch(url, {
        ...options,
        method: 'GET',
    });
};

/**
 * Wrapper para POST requests
 */
export const apiPost = async (
    endpoint: string,
    data?: unknown,
    options: FetchOptions = {}
) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
    return authenticatedFetch(url, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
};

/**
 * Wrapper para PUT requests
 */
export const apiPut = async (
    endpoint: string,
    data?: unknown,
    options: FetchOptions = {}
) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
    return authenticatedFetch(url, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
};

/**
 * Wrapper para DELETE requests
 */
export const apiDelete = async (endpoint: string, options: FetchOptions = {}) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
    return authenticatedFetch(url, {
        ...options,
        method: 'DELETE',
    });
};
