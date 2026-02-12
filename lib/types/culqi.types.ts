// lib/types/culqi.types.ts - Type definitions for Culqi integration

/**
 * Tipo de método de pago
 */
export type PaymentMethodType = 'card' | 'async';

/**
 * Métodos de pago asíncrono soportados
 */
export type AsyncPaymentMethod = 'qr' | 'pagoefectivo';

/**
 * Token response de Culqi (para tarjetas)
 */
export interface CulqiTokenResponse {
    id: string;
    object: 'token';
    type: 'card';
    creation_date: number;
    email: string;
    card_number: string;
    last_four: string;
    active: boolean;
    iin: {
        object: string;
        bin: string;
        card_brand: string;
        card_type: string;
        card_category: string;
        issuer: {
            name: string;
            country: string;
            country_code: string;
            website: string | null;
            phone_number: string | null;
        };
        installments_allowed: number[];
    };
    client: {
        ip: string;
        ip_country: string;
        ip_country_code: string;
        browser: string;
        device_fingerprint: string | null;
        device_type: string;
    };
    metadata: Record<string, any>;
}

/**
 * Order response de Culqi (para pagos asíncronos)
 */
export interface CulqiOrderResponse {
    id: string;
    object: 'order';
    amount: number;
    currency_code: string;
    description: string;
    order_number: string;
    state: 'pending' | 'paid' | 'expired' | 'cancelled';
    client_details: {
        email: string;
        first_name?: string;
        last_name?: string;
        phone_number?: string;
    };
    payment_code?: string; // CIP para PagoEfectivo/Agentes
    cip_code?: string; // Alias de payment_code
    cip?: string; // Otro alias
    qr_string?: string; // String QR para Yape/Billetera
    qr?: string; // Alias de qr_string
    payment_method_type?: 'yape' | 'billetera' | 'pagoefectivo' | 'agente' | 'bancaMovil' | 'cuotealo';
    expiration_date?: number; // Timestamp de expiración
    creation_date: number;
    updated_date?: number;
    metadata?: Record<string, any>;
}

/**
 * Error response de Culqi
 */
export interface CulqiErrorResponse {
    object: 'error';
    type: string;
    merchant_message: string;
    user_message: string;
    code: string;
}

/**
 * Culqi Window Global Interface
 */
export interface CulqiGlobal {
    publicKey: string;
    token?: CulqiTokenResponse;
    order?: CulqiOrderResponse;
    error?: CulqiErrorResponse;
    settings: (config: CulqiSettings) => void;
    options: (config: CulqiOptions) => void;
    open: () => void;
    close: () => void;
}

/**
 * Culqi Settings (parámetros de la transacción)
 */
export interface CulqiSettings {
    title: string;
    currency: 'PEN' | 'USD';
    description: string;
    amount: number; // En centavos
    order?: string; // Order ID de Culqi (requerido para pagos asíncronos)
}

/**
 * Culqi Options (configuración del modal)
 */
export interface CulqiOptions {
    lang?: 'es' | 'en' | 'auto';
    modal?: boolean;
    installments?: boolean;
    paymentMethods?: {
        tarjeta?: boolean;
        yape?: boolean;
        billetera?: boolean;
        bancaMovil?: boolean;
        agente?: boolean;
        cuotealo?: boolean;
    };
    style?: {
        logo?: string;
        maincolor?: string;
        buttontext?: string;
        maintext?: string;
        desctext?: string;
    };
    onClose?: () => void;
}

/**
 * Extender Window interface
 */
declare global {
    interface Window {
        Culqi: any; // Cambiar a any para flexibilidad o mantener CulqiGlobal si coincide
        culqi: () => void;
        Culqi3DS: {
            publicKey: string;
            options: {
                showModal: boolean;
                showIcon: boolean;
                closeModalAction: () => void;
                style?: {
                    logo?: string;
                };
            };
            initAuthentication: (token: string) => void;
            settings: {
                charge: {
                    totalAmount: number;
                    returnUrl: string;
                };
                card: {
                    email: string;
                };
            };
            generateDevice: () => string;
            token?: {
                eci: string;
                xid: string;
                cavv: string;
                protocolVersion: string;
                directoryServerTransactionId: string;
            };
            error?: {
                merchant_message: string;
                user_message: string;
                code: string;
            };
        };
        culqi3DS?: () => void;
    }
}

export {};