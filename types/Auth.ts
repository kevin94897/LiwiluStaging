// ============================================
// Tipos para AUTH
// ============================================

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    confirmEmail: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
    receiveOffers: boolean;
    documentType?: string;
    documentNumber?: string;
    phone?: string;
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
