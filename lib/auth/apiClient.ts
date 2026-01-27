import { refreshAccessToken, clearSession } from './tokenManager';
import { isAuthenticated } from './authUtils';

/**
 * Centra la URL base de la API.
 * En el cliente usamos el PROXY de Next.js para manejar cookies httpOnly de forma segura.
 * En el servidor usamos la URL real.
 */
const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return '/api/proxy';
    }
    return process.env.NEXT_PUBLIC_API_URL;
};

const API_BASE_URL = getApiBaseUrl();

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


    // Hacer la petición con credentials: 'include' para enviar cookies automáticamente
    const response = await fetch(url, {
        ...fetchOptions,
        headers: baseHeaders,
        credentials: 'include', // ⭐ Importante: envía cookies httpOnly automáticamente
    });

    // Si es 401 (Unauthorized), el token expiró
    if (response.status === 401 && !skipRetry && !skipAuth) {
        // Solo intentar renovar si creemos que hay una sesión (basado en la cookie 'user')
        if (!isAuthenticated()) {
            console.log('🛑 401 recibido pero no hay sesión activa, ignorando renovación.');
            return response;
        }

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
            await clearSession();

            // Solo redirigir si NO estamos en una página pública
            if (typeof window !== 'undefined') {
                const currentPath = window.location.pathname;
                const publicPaths = ['/', '/productos', '/tienda'];
                const isPublicPage = publicPaths.some(path => currentPath.startsWith(path));

                // Solo redirigir si estamos en una página protegida
                if (!isPublicPage && currentPath !== '/') {
                    window.location.href = '/';
                }
            }
            throw new Error('Sesión expirada');
        }
    }

    return response;
};

/**
 * Valida el token actual usando el endpoint /auth/profile
 * Retorna true si el token es válido, false si no
 * Note: Tokens are now in httpOnly cookies, sent automatically with credentials: 'include'
 */
export const validateToken = async (): Promise<boolean> => {
    if (!isAuthenticated()) {
        return false;
    }

    try {
        console.log('🔍 Validando token con /auth/profile...');

        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Send httpOnly cookies
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
 * Obtiene el perfil del usuario desde la API
 * Útil para rehidratar la sesión si faltan datos locales
 * Note: Tokens are now in httpOnly cookies, sent automatically
 */
export const fetchUserProfile = async (): Promise<any | null> => {
    if (!isAuthenticated()) {
        return null;
    }

    try {
        console.log('🔄 Fetching user profile from API...');
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Send httpOnly cookies
        });

        if (response.ok) {
            const data = await response.json();
            // La API puede devolver { success: true, data: user } o directamente user
            const userData = data.data || data;
            return userData || null;
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
    const url = `${API_BASE_URL}${endpoint}`;
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
    const url = `${API_BASE_URL}${endpoint}`;
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
    const url = `${API_BASE_URL}${endpoint}`;
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
    const url = `${API_BASE_URL}${endpoint}`;
    return authenticatedFetch(url, {
        ...options,
        method: 'DELETE',
    });
};
