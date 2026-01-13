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

    // Preparar headers base
    const baseHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
    };

    // Agregar X-Session-Id si existe para identificar carritos de invitados
    if (typeof window !== 'undefined') {
        const sessionId = localStorage.getItem('liwilu_session_id');
        if (sessionId) {
            console.log('📡 Request with X-Session-Id:', sessionId);
            baseHeaders['X-Session-Id'] = sessionId;
        }
    }

    // Si no se debe agregar autenticación, hacer fetch normal
    if (skipAuth) {
        return fetch(url, {
            ...fetchOptions,
            headers: baseHeaders
        });
    }

    // Obtener accessToken
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        throw new Error('No hay sesión activa');
    }

    // Agregar Authorization header
    const headers = {
        ...baseHeaders,
        'Authorization': `Bearer ${accessToken}`,
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
 * Obtiene el perfil del usuario desde la API y actualiza localStorage
 * Útil para rehidratar la sesión si faltan datos locales
 */
export const fetchUserProfile = async (): Promise<any | null> => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return null;

        console.log('🔄 Fetching user profile from API...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            // Asegurarnos de tener la estructura de usuario correcta
            // La API puede devolver { success: true, data: user } o directamente user
            const userData = data.data || data;

            if (userData) {
                // Importar dinámicamente para evitar dependencias circulares si es necesario, 
                // o usar la lógica de guardado localmente aquí
                const { saveSession } = await import('./authUtils');
                const refreshToken = localStorage.getItem('refreshToken') || '';

                // Guardar sesión actualizada
                saveSession(userData, accessToken, refreshToken);
                return userData;
            }
        }
        return null;
    } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        return null;
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
