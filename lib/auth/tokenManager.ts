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
 */
export const refreshAccessToken = async (): Promise<boolean> => {
    // 🆕 Prevenir múltiples renovaciones simultáneas
    if (isRefreshing) {
        console.log('⏳ Ya hay una renovación en progreso...');
        return false;
    }

    try {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            console.warn('⚠️ No hay refreshToken disponible');
            return false;
        }

        console.log('🔄 Renovando accessToken...');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            console.error('❌ Error al renovar token:', response.status);

            // Si el refresh token expiró, cerrar sesión
            if (response.status === 401 || response.status === 403) {
                console.log('🔒 RefreshToken expirado, cerrando sesión...');
                clearSession();
                window.location.href = '/';
            }
            return false;
        }

        const result: RefreshResponse = await response.json();

        if (result.success && result.data) {
            // Actualizar tokens en localStorage
            localStorage.setItem('accessToken', result.data.accessToken);
            localStorage.setItem('refreshToken', result.data.refreshToken);

            console.log('✅ AccessToken renovado exitosamente');
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
 */
export const scheduleTokenRefresh = () => {
    // Limpiar timeout anterior si existe
    if (refreshTokenTimeout) {
        clearTimeout(refreshTokenTimeout);
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        console.warn('⚠️ No hay accessToken para programar renovación');
        return;
    }

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
                    window.location.href = '/';
                }
            }, 5000);
        }
    }, refreshTime);

    const minutesUntilRefresh = Math.floor(refreshTime / 60000);
    console.log(`⏰ Próxima renovación en ${minutesUntilRefresh} minutos (${refreshTime / 1000}s)`);
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
export const startTokenRefresh = () => {
    console.log('🚀 Iniciando sistema de renovación automática de tokens');
    scheduleTokenRefresh();
};

/**
 * Limpia la sesión del usuario
 */
export const clearSession = () => {
    stopTokenRefresh();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('🧹 Sesión limpiada completamente');
};

/**
 * 🆕 Verifica si el token está próximo a expirar (menos de 3 minutos)
 */
export const isTokenExpiringSoon = (): boolean => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return true;

    const timeUntilExpiration = getTokenExpirationTime(accessToken);
    if (!timeUntilExpiration) return true;

    // Considerar "expirando pronto" si quedan menos de 3 minutos
    return timeUntilExpiration < 180000; // 3 minutos
};

/**
 * Verifica si hay una sesión activa e inicia la renovación automática
 */
export const initializeAuth = () => {
    if (typeof window === 'undefined') return;

    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
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
            // 🆕 NO limpiar sesión aquí, dejar que ProtectedRoute lo maneje
        }
    } else {
        console.log('🔓 No hay sesión activa');
    }
};

/**
 * Deshabilita el refreshToken en el servidor (logout)
 */
export const revokeRefreshToken = async (): Promise<boolean> => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const accessToken = localStorage.getItem('accessToken');

        if (!refreshToken || !accessToken) {
            return false;
        }

        console.log('🔒 Deshabilitando refreshToken en el servidor...');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refreshToken }),
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