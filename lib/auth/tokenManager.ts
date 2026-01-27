// lib/auth/tokenManager.ts

interface RefreshResponse {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
    };
}

// 🆕 Decodificar JWT para obtener tiempo de expiración
const decodeJWT = (token: string): { exp: number } | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('❌ Error decodificando JWT:', error);
        return null;
    }
};

// 🆕 Calcular tiempo restante hasta expiración (en ms)
const getTokenExpirationTime = (token: string): number | null => {
    const decoded = decodeJWT(token);

    // 🆕 Si no tiene 'exp', asumir 15 minutos desde ahora
    if (!decoded || !decoded.exp) {
        console.warn('⚠️ Token sin campo "exp", asumiendo 15 minutos de validez');
        return 15 * 60 * 1000; // 15 minutos en ms
    }

    const expirationTime = decoded.exp * 1000; // Convertir a ms
    const currentTime = Date.now();
    const remaining = expirationTime - currentTime;

    // 🆕 Si el tiempo es negativo o muy corto, asumir 15 minutos
    if (remaining <= 0) {
        console.warn('⚠️ Token expirado según "exp", asumiendo 15 minutos de validez');
        return 15 * 60 * 1000;
    }

    return remaining;
};

let refreshTokenTimeout: NodeJS.Timeout | null = null;
let isRefreshing = false; // 🆕 Prevenir múltiples renovaciones simultáneas

/**
 * Renueva el accessToken usando el refreshToken
 * Note: Tokens are now in httpOnly cookies, managed via API routes
 */
export const refreshAccessToken = async (): Promise<boolean> => {
    // 🆕 Prevenir múltiples renovaciones simultáneas
    if (isRefreshing) {
        console.log('⏳ Ya hay una renovación en progreso...');
        return false;
    }

    try {
        isRefreshing = true;
        console.log('🔄 Renovando accessToken...');

        // Call local API route which handles httpOnly cookies securely
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include', // Send httpOnly cookies
        });

        if (!response.ok) {
            console.error('❌ Error al renovar token:', response.status);

            // Si el refresh token expiró, cerrar sesión
            if (response.status === 401 || response.status === 403) {
                console.log('🔒 RefreshToken expirado, cerrando sesión...');
                await clearSession();
                if (typeof window !== 'undefined') {
                    window.location.href = '/';
                }
            }
            return false;
        }

        const result = await response.json();

        if (result.success) {
            // New accessToken is already set in cookies by the API route
            console.log('✅ Token renovado exitosamente (via cookies)');
            // Notify other tabs if necessary (though the user cookie didn't change)
            return true;
        }

        return false;
    } catch (error) {
        console.error('❌ Error al renovar token:', error);
        return false;
    } finally {
        isRefreshing = false;
    }
};

/**
 * 🆕 Programa la renovación automática basada en el tiempo de expiración del token
 * Renueva 2 minutos ANTES de que expire
 * Note: Gets token from API route since it's in httpOnly cookie
 */
export const scheduleTokenRefresh = async () => {
    // Limpiar timeout anterior si existe
    if (refreshTokenTimeout) {
        clearTimeout(refreshTokenTimeout);
    }

    try {
        // Get tokens from API route (they're in httpOnly cookies)
        const response = await fetch('/api/auth/get-tokens', {
            credentials: 'include',
        });

        if (!response.ok) {
            console.warn('⚠️ No hay accessToken para programar renovación');
            return;
        }

        const { data } = await response.json();
        const accessToken = data.accessToken;

        // 🆕 Calcular tiempo hasta expiración
        const timeUntilExpiration = getTokenExpirationTime(accessToken);

        if (!timeUntilExpiration || timeUntilExpiration <= 0) {
            console.warn('⚠️ Token ya expirado o inválido');
            refreshAccessToken().then(success => {
                if (success) scheduleTokenRefresh();
            });
            return;
        }

        // 🆕 Renovar 2 minutos ANTES de que expire (120 segundos = 120000 ms)
        const BUFFER_TIME = 120000; // 2 minutos
        const refreshTime = Math.max(timeUntilExpiration - BUFFER_TIME, 5000); // Mínimo 5 segundos

        refreshTokenTimeout = setTimeout(async () => {
            console.log('⏰ Ejecutando renovación programada...');
            const success = await refreshAccessToken();

            if (success) {
                // Si la renovación fue exitosa, programar la próxima
                scheduleTokenRefresh();
            } else {
                console.error('❌ Fallo la renovación programada');
                // 🆕 Intentar una vez más después de 5 segundos
                setTimeout(async () => {
                    const retrySuccess = await refreshAccessToken();
                    if (retrySuccess) {
                        scheduleTokenRefresh();
                    } else {
                        console.error('❌ Fallo el reintento, cerrando sesión');
                        clearSession();
                        if (typeof window !== 'undefined') {
                            window.location.href = '/';
                        }
                    }
                }, 5000);
            }
        }, refreshTime);

        const minutesUntilRefresh = Math.floor(refreshTime / 60000);
        console.log(`⏰ Próxima renovación en ${minutesUntilRefresh} minutos (${refreshTime / 1000}s)`);
    } catch (error) {
        console.error('❌ Error al programar renovación:', error);
    }
};

/**
 * Detiene la renovación automática de tokens
 */
export const stopTokenRefresh = () => {
    if (refreshTokenTimeout) {
        clearTimeout(refreshTokenTimeout);
        refreshTokenTimeout = null;
        console.log('⏹️ Renovación automática de tokens detenida');
    }
};

/**
 * Inicia el sistema de renovación automática de tokens
 */
export const startTokenRefresh = async () => {
    console.log('🚀 Iniciando sistema de renovación automática de tokens');
    await scheduleTokenRefresh();
};

/**
 * Limpia la sesión del usuario
 * Note: Cookies are cleared via API route
 */
export const clearSession = async () => {
    stopTokenRefresh();
    
    // Clear cookies via API route
    try {
        await fetch('/api/auth/clear-session', { 
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        console.error('❌ Error clearing session cookies:', error);
    }
    
    // Clear any localStorage remnants (for migration period)
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
    
    console.log('🧹 Sesión limpiada completamente');
};

/**
 * 🆕 Verifica si el token está próximo a expirar (menos de 3 minutos)
 * Note: Gets token from API route since it's in httpOnly cookie
 */
export const isTokenExpiringSoon = async (): Promise<boolean> => {
    try {
        const response = await fetch('/api/auth/get-tokens', {
            credentials: 'include',
        });

        if (!response.ok) return true;

        const { data } = await response.json();
        const accessToken = data.accessToken;

        if (!accessToken) return true;

        const timeUntilExpiration = getTokenExpirationTime(accessToken);
        if (!timeUntilExpiration) return true;

        // Considerar "expirando pronto" si quedan menos de 3 minutos
        return timeUntilExpiration < 180000; // 3 minutos
    } catch (error) {
        console.error('❌ Error checking token expiration:', error);
        return true;
    }
};

/**
 * Verifica si hay una sesión activa e inicia la renovación automática
 * Note: Checks for cookies via API route
 */
export const initializeAuth = async () => {
    if (typeof window === 'undefined') return;

    try {
        const response = await fetch('/api/auth/get-tokens', {
            credentials: 'include',
        });

        if (!response.ok) {
            console.log('🔓 No hay sesión activa');
            return;
        }

        const { data } = await response.json();
        const accessToken = data.accessToken;

        console.log('🔐 Sesión activa detectada');

        // 🆕 Verificar si el token ya expiró
        const timeUntilExpiration = getTokenExpirationTime(accessToken);

        if (timeUntilExpiration && timeUntilExpiration > 0) {
            const minutesRemaining = Math.floor(timeUntilExpiration / 60000);
            console.log(`⏱️ Token válido por ${minutesRemaining} minutos más`);

            // 🆕 Solo iniciar renovación automática si quedan más de 2 minutos
            if (minutesRemaining > 2) {
                startTokenRefresh();
            } else {
                console.log('⚠️ Token próximo a expirar, renovando inmediatamente...');
                refreshAccessToken().then(success => {
                    if (success) {
                        startTokenRefresh();
                    } else {
                        console.error('❌ No se pudo renovar el token en initializeAuth');
                    }
                });
            }
        } else {
            console.log('⚠️ Token expirado o inválido');
        }
    } catch (error) {
        console.error('❌ Error initializing auth:', error);
    }
};

/**
 * Deshabilita el refreshToken en el servidor (logout)
 * Note: Tokens are in httpOnly cookies, sent automatically
 */
export const revokeRefreshToken = async (): Promise<boolean> => {
    try {
        console.log('🔒 Deshabilitando refreshToken en el servidor...');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Send httpOnly cookies
        });

        if (response.ok) {
            console.log('✅ RefreshToken deshabilitado en el servidor');
            return true;
        }

        console.warn('⚠️ No se pudo deshabilitar el refreshToken en el servidor');
        return false;
    } catch (error) {
        console.error('❌ Error al deshabilitar refreshToken:', error);
        return false;
    }
};