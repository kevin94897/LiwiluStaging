// ============================================
// Tipos para AUTH
// ============================================

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    confirmEmail: string;      // ⬅ ahora existe
    password: string;
    confirmPassword: string;   // ⬅ ahora existe
    acceptTerms: boolean;
    receiveOffers: boolean;
}

export interface RegisterResponse {
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    data?: {
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role?: string;
        };
    };
}
