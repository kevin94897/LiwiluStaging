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

    // Normalizar tipo de documento para el frontend
    const normalizeDocumentType = (type: string): string => {
        if (!type) return '';
        const upperType = String(type).toUpperCase();
        if (upperType === 'DNI') return 'DNI';
        if (upperType === 'RUC') return 'RUC';
        if (upperType === 'CE' || upperType === 'CARNET_EXTRANJERIA' || upperType === 'CARNET DE EXTRANJERIA') return 'CE';
        if (upperType === 'PASAPORTE') return 'Pasaporte';
        return type;
    };

    return {
        id: String(userData.id || userData.uuid || ''),
        email: userData.email || '',
        firstName: firstName,
        lastName: lastName,
        role: userData.role || '',
        electronicSignatureUrl: userData.electronicSignatureUrl || null,
        emailVerified: !!userData.emailVerified,
        documentType: normalizeDocumentType(userData.documentType || userData.tipoDocumento || userData.typeDocument || ''),
        documentNumber: userData.documentNumber || userData.numeroDocumento || userData.dni || userData.ruc || userData.document || '',
        phone: userData.phone || userData.celular || userData.mobile || userData.telefono || ''
    };
};


/**
 * Saves user data and tokens to localStorage
 */
export const saveSession = (user: any, accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;

    const mappedUser = mapApiUserToUser(user);
    if (mappedUser) {
        localStorage.setItem('user', JSON.stringify(mappedUser));
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

/**
 * Partially updates user data in the existing session
 */
export const updateUserSession = (userData: Partial<User>) => {
    if (typeof window === 'undefined') return;

    const currentStr = localStorage.getItem('user');
    let currentUser = currentStr ? JSON.parse(currentStr) : {};

    // Merge logic: ensure we use the normalization of mapApiUserToUser
    const updatedUser = mapApiUserToUser({ ...currentUser, ...userData });

    if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Dispatch event to notify other components/tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'user',
            newValue: JSON.stringify(updatedUser)
        }));
    }
};

/**
 * Clears all authentication data from localStorage and stops background processes
 */
export const clearAuthSession = () => {
    if (typeof window === 'undefined') return;

    stopTokenRefresh();

    // Total wipe for maximum security and fresh state
    localStorage.clear();
};

/**
 * Robustly retrieves the current user from localStorage
 */
export const getCurrentUser = (): User | null => {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
        const rawUser = JSON.parse(userStr);
        // Even if it's already in localStorage, we run it through the mapper 
        // to ensure it's always in the correct format.
        return mapApiUserToUser(rawUser);
    } catch (error) {
        console.error('❌ Error parsing user from localStorage:', error);
        return null;
    }
};

/**
 * Simple check for active session
 */
export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
};
