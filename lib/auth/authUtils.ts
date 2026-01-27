// lib/auth/authUtils.ts
import { stopTokenRefresh } from './tokenManager';

/**
 * Unified User Interface
 */
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    electronicSignatureUrl?: string | null;
    emailVerified?: boolean;
    documentType?: string;
    documentNumber?: string;
    phone?: string;
}

/**
 * Robustly maps raw API user data to the standard User interface.
 * Handles both camelCase (firstName) and lowercase (firstname) field names.
 */
export const mapApiUserToUser = (userData: any): User | null => {
    // Si existe el campo genérico 'name' pero no firstName/lastName, intentamos dividirlo
    let firstName = userData.firstName || userData.firstname || '';
    let lastName = userData.lastName || userData.lastname || '';
    const fullName = userData.name || '';

    if (!firstName && fullName) {
        const parts = fullName.trim().split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
    }

    return {
        id: String(userData.id || userData.uuid || ''),
        email: userData.email || '',
        firstName: firstName,
        lastName: lastName,
        role: userData.role || '',
        electronicSignatureUrl: userData.electronicSignatureUrl || null,
        emailVerified: !!userData.emailVerified,
        documentType: userData.documentType || userData.tipoDocumento || userData.typeDocument || '',
        documentNumber: userData.documentNumber || userData.numeroDocumento || userData.dni || userData.ruc || userData.document || '',
        phone: userData.phone || userData.celular || userData.mobile || userData.telefono || ''
    };
};

/**
 * Saves user data and tokens via API route (sets httpOnly cookies)
 * Note: This is now handled by AuthContext and API routes
 */
export const saveSession = async (user: any, accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;

    try {
        // Call API route to set httpOnly cookies
        await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, accessToken, refreshToken }),
        });

        console.log('✅ Session saved via cookies');
    } catch (error) {
        console.error('❌ Error saving session:', error);
    }
};

/**
 * Partially updates user data in the existing session
 * Note: User data is stored in a non-httpOnly cookie for client access
 */
export const updateUserSession = (userData: Partial<User>) => {
    if (typeof window === 'undefined') return;

    try {
        // Get current user from cookie
        const userCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('user='));
        
        if (!userCookie) return;

        const currentUser = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        const updatedUser = mapApiUserToUser({ ...currentUser, ...userData });

        if (updatedUser) {
            // Update user cookie
            document.cookie = `user=${JSON.stringify(updatedUser)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
            console.log('🔄 User session updated:', updatedUser);

            // Dispatch event to notify other components/tabs
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'user',
                newValue: JSON.stringify(updatedUser)
            }));
        }
    } catch (error) {
        console.error('❌ Error updating user session:', error);
    }
};

/**
 * Clears all authentication data and stops background processes
 * Note: Uses API route to clear httpOnly cookies
 */
export const clearAuthSession = async () => {
    if (typeof window === 'undefined') return;

    stopTokenRefresh();

    try {
        // Clear cookies via API route
        await fetch('/api/auth/clear-session', { 
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        console.error('❌ Error clearing session:', error);
    }

    // Clear any localStorage remnants (for migration period)
    localStorage.clear();

    console.log('🧹 Total session and storage cleared');
};

/**
 * Robustly retrieves the current user from cookies
 */
export const getCurrentUser = (): User | null => {
    if (typeof window === 'undefined') return null;

    try {
        const userCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('user='));
        
        if (!userCookie) return null;

        const rawUser = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        return mapApiUserToUser(rawUser);
    } catch (error) {
        console.error('❌ Error parsing user from cookie:', error);
        return null;
    }
};

/**
 * Simple check for active session
 * Note: Checks for user cookie (tokens are in httpOnly cookies)
 */
export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!getCurrentUser();
};
