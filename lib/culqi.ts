// lib/culqi.ts - Improved version with proper Culqi Checkout v4 integration
import logger from './logger';
import { CulqiOptions } from './types/culqi.types';




export const CULQI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || "";


// Interfaces para 3DS
export interface Culqi3DSResult {
    eci?: string;
    xid?: string;
    cavv?: string;
    protocolVersion?: string;
    directoryServerTransactionId?: string;
}

export interface CulqiTokenOptions {
    title: string;
    currency: 'PEN' | 'USD';
    description: string;
    amount: number;
}

export interface CulqiOrderOptions {
    title: string;
    currency: 'PEN' | 'USD';
    description: string;
    amount: number;
    orderId: string; // Culqi order ID obtenido del backend
}

/**
 * Configura Culqi con la clave pública
 */
export const configureCulqi = (): boolean => {
    if (typeof window === 'undefined' || !window.Culqi) {
        logger.warn('⚠️ Culqi no está disponible');
        return false;
    }

    window.Culqi.publicKey = CULQI_PUBLIC_KEY;
    logger.log('✅ Culqi configurado con clave pública:', CULQI_PUBLIC_KEY.substring(0, 20) + '...');
    return true;
};

/**
 * Abre el modal de Culqi para TOKENIZACIÓN (Tarjetas de crédito/débito)
 * Este método solo genera tokens para procesamiento inmediato
 */
export const openCulqiForTokenization = (options: CulqiTokenOptions): void => {
    logger.log('%c🚀 [CULQI-TOKEN] Iniciando tokenización de tarjeta...', 'background: #111; color: #00ff00; font-size: 14px; font-weight: bold; padding: 4px;');

    if (typeof window === 'undefined' || !window.Culqi) {
        logger.error('❌ [CULQI-TOKEN] Culqi no está cargado');
        throw new Error('Culqi no está disponible');
    }

    try {
        const amountCents = Math.round(options.amount * 100);
        const safeDescription = options.description
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .substring(0, 80)
            .trim();

        // 1. Configurar clave pública
        window.Culqi.publicKey = CULQI_PUBLIC_KEY;

        // 2. Settings para TOKENIZACIÓN (sin orderId)
        const settings = {
            title: options.title,
            currency: options.currency,
            description: safeDescription,
            amount: amountCents,
        };

        logger.log('📦 [CULQI-TOKEN] Settings:', settings);
        window.Culqi.settings(settings);

        // 3. Options del modal - SOLO tarjetas y Yape
        const culqiOptions: CulqiOptions = {
            lang: 'auto',
            modal: true,
            installments: false,
            paymentMethods: {
                tarjeta: true,
                yape: true, // Habilitar Yape con código
                billetera: false,
                bancaMovil: false,
                agente: false,
                cuotealo: false,
            },
            style: {
                logo: '', // Tu logo si lo tienes
                maincolor: '#0ec1c1', // Color primario de tu marca
                buttontext: 'Pagar',
                maintext: 'Ingresa los datos de tu tarjeta',
                desctext: safeDescription,
            },
            onClose: () => {
                logger.log('🚪 [CULQI-TOKEN] Modal cerrado por el usuario');
                window.dispatchEvent(new CustomEvent('culqi-modal-closed'));
            }
        };

        logger.log('📦 [CULQI-TOKEN] Options:', culqiOptions);
        window.Culqi.options(culqiOptions);

        // 4. Abrir modal
        logger.log('🏁 [CULQI-TOKEN] Ejecutando Culqi.open()...');
        window.Culqi.open();

        // 5. Polling para detectar cierre manual
        setupModalCloseDetection();

    } catch (error) {
        logger.error('❌ [CULQI-TOKEN] Error crítico:', error);
        throw error;
    }
};

/**
 * Abre el modal de Culqi para ÓRDENES ASÍNCRONAS
 * (Yape, Billetera Móvil, Agente, Banca Móvil, Cuotéalo)
 * 
 * IMPORTANTE: Debes crear la orden en Culqi desde tu backend ANTES de llamar esta función
 */
export const openCulqiForAsyncOrder = (options: CulqiOrderOptions): void => {
    logger.log('%c🚀 [CULQI-ORDER] Iniciando orden asíncrona...', 'background: #111; color: #FFD700; font-size: 14px; font-weight: bold; padding: 4px;');

    if (typeof window === 'undefined' || !window.Culqi) {
        logger.error('❌ [CULQI-ORDER] Culqi no está cargado');
        throw new Error('Culqi no está disponible');
    }

    if (!options.orderId) {
        logger.error('❌ [CULQI-ORDER] orderId es requerido para órdenes asíncronas');
        throw new Error('orderId es requerido para órdenes asíncronas');
    }

    try {
        const amountCents = Math.round(options.amount * 100);
        const safeDescription = options.description
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .substring(0, 80)
            .trim();

        // 1. Configurar clave pública
        window.Culqi.publicKey = CULQI_PUBLIC_KEY;

        // 2. Settings para ORDEN ASÍNCRONA (CON orderId)
        const settings = {
            title: options.title,
            currency: options.currency,
            description: safeDescription,
            amount: amountCents,
            order: options.orderId, // CLAVE: El order ID de Culqi
        };

        logger.log('📦 [CULQI-ORDER] Settings:', settings);
        window.Culqi.settings(settings);

        // 3. Options del modal - Métodos asíncronos
        const culqiOptions: CulqiOptions = {
            lang: 'auto',
            modal: true,
            paymentMethods: {
                tarjeta: false, // Desactivar tarjetas en modo orden
                yape: true,
                billetera: true,
                bancaMovil: true,
                agente: true,
                cuotealo: true,
            },
            style: {
                logo: '',
                maincolor: '#0ec1c1',
                buttontext: 'Continuar',
                maintext: 'Selecciona tu método de pago',
                desctext: safeDescription,
            },
            onClose: () => {
                logger.log('🚪 [CULQI-ORDER] Modal cerrado por el usuario');
                window.dispatchEvent(new CustomEvent('culqi-modal-closed'));
            }
        };

        logger.log('📦 [CULQI-ORDER] Options:', culqiOptions);
        window.Culqi.options(culqiOptions);

        // 4. Abrir modal
        logger.log('🏁 [CULQI-ORDER] Ejecutando Culqi.open()...');
        window.Culqi.open();

        // 5. Polling para detectar cierre
        setupModalCloseDetection();

    } catch (error) {
        logger.error('❌ [CULQI-ORDER] Error crítico:', error);
        throw error;
    }
};

/**
 * Polling para detectar cierre del modal (fallback si onClose falla)
 */
const setupModalCloseDetection = (): void => {
    let pollCount = 0;
    const maxPolls = 600; // 5 minutos máximo
    
    const pollInterval = setInterval(() => {
        pollCount++;

        // Verificar si el modal sigue abierto
        const modalElement = document.querySelector(
            '.culqi-container, #culqi-container, [class*="culqi-modal"]'
        );
        const isModalVisible = modalElement && 
            window.getComputedStyle(modalElement).display !== 'none';

        if (!isModalVisible || pollCount >= maxPolls) {
            logger.log('🔍 [CULQI] Modal cerrado detectado por polling');
            clearInterval(pollInterval);

            // Solo disparar evento si no hay token ni orden procesada
            if (!window.Culqi?.token && !window.Culqi?.order) {
                logger.log('🚪 [CULQI] Disparando evento culqi-modal-closed');
                window.dispatchEvent(new CustomEvent('culqi-modal-closed'));
            }
        }
    }, 500);
};

/**
 * Configura Culqi 3DS
 */
/**
 * Configura Culqi 3DS con opciones completas
 */
export const configureCulqi3DS = (): void => {
    if (typeof window !== 'undefined') {
        if (window.Culqi3DS) {
            // Configurar clave pública
            window.Culqi3DS.publicKey = CULQI_PUBLIC_KEY;
            
            // Configurar opciones del modal 3DS
            window.Culqi3DS.options = {
                showModal: true,
                showIcon: true,
                closeModalAction: () => {
                    logger.log("🚪 [3DS] Modal cerrado por el usuario");
                    // Limpiar estado
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('culqi-3ds-closed'));
                    }
                },
                style: {
                    logo: '', // Tu logo (opcional)
                }
            };
            
            logger.log("✅ [lib/culqi.ts] Culqi 3DS configurado correctamente con opciones");
        } else {
            logger.warn("⚠️ [lib/culqi.ts] window.Culqi3DS no está definido todavía");
        }
    }
};

export interface Culqi3DSInitOptions {
    token: string;
    amount: number;
    email: string;
}

/**
 * Inicia la autenticación 3DS con configuración completa de cargo y tarjeta
 */
export const init3DSAuthentication = (options: Culqi3DSInitOptions): void => {
    if (typeof window !== 'undefined' && window.Culqi3DS) {
        logger.log("🔐 [lib/culqi.ts] Preparando settings de 3DS para token:", options.token);
        
        // 1. Configurar Settings (Paso 1 de la documentación de Culqi 3DS)
        // Convertimos monto a centavos si es necesario? 
        // La documentación dice "totalAmount: 300" para un cargo de 3.00, así que son centavos.
        const amountCents = Math.round(options.amount * 100);
        
        window.Culqi3DS.settings = {
            charge: {
                totalAmount: amountCents,
                returnUrl: window.location.href // O una URL específica de retorno
            },
            card: {
                email: options.email
            }
        };
        
        // 2. Asegurar que la configuración de opciones esté presente
        if (!window.Culqi3DS.publicKey) {
            window.Culqi3DS.publicKey = CULQI_PUBLIC_KEY;
        }
        
        if (!window.Culqi3DS.options) {
            window.Culqi3DS.options = {
                showModal: true,
                showIcon: true,
                closeModalAction: () => {
                    logger.log("🚪 [3DS] Modal cerrado");
                    window.dispatchEvent(new CustomEvent('culqi-3ds-closed'));
                }
            };
        }
        
        // 3. Iniciar autenticación
        try {
            logger.log("🏁 [lib/culqi.ts] Ejecutando window.Culqi3DS.initAuthentication...");
            window.Culqi3DS.initAuthentication(options.token);
            logger.log("✅ [lib/culqi.ts] Autenticación 3DS iniciada exitosamente");
        } catch (error) {
            logger.error("❌ [lib/culqi.ts] Error al iniciar 3DS:", error);
            throw error;
        }
    } else {
        logger.error("❌ [lib/culqi.ts] Culqi3DS no está disponible");
        throw new Error("Culqi3DS no está inicializado");
    }
};

/**
 * Cierra el modal de Culqi
 */
export const closeCulqi = (): void => {
    if (typeof window !== 'undefined' && window.Culqi) {
        try {
            logger.log('🔒 [CULQI] Cerrando modal...');
            window.Culqi.close();
        } catch (error) {
            logger.warn('⚠️ No se pudo cerrar Culqi:', error);
        }
    }
};

/**
 * Resetea el estado de Culqi para evitar datos residuales
 */
export const resetCulqi = (): void => {
    if (typeof window !== 'undefined' && window.Culqi) {
        try {
            // Limpiar token y order previos
            if (window.Culqi.token) {
                delete window.Culqi.token;
            }
            if (window.Culqi.order) {
                delete window.Culqi.order;
            }
            if (window.Culqi.error) {
                delete window.Culqi.error;
            }
            logger.log('🧹 [CULQI] Estado reseteado');
        } catch (error) {
            logger.warn('⚠️ Error al resetear Culqi:', error);
        }
    }
};

/**
 * Detecta el tipo de pago asíncrono desde la respuesta de Culqi Order
 */
export const detectAsyncPaymentMethod = (
  order: any
): "qr" | "pagoefectivo" | null => {
  logger.log("🔍 [culqi.ts] Detectando método de pago asíncrono:", JSON.stringify(order, null, 2));

  // QR (Yape, Billetera Móvil)
  if (
    order.qr_string ||
    order.qr ||
    order.payment_method_type === "yape" ||
    order.payment_method_type === "billetera"
  ) {
    logger.log("✅ [culqi.ts] Método detectado: QR (Yape/Billetera)", {
        qr_string: !!order.qr_string,
        qr: !!order.qr,
        payment_method_type: order.payment_method_type
    });
    return "qr";
  }

  // PagoEfectivo/Agente (CIP)
  if (
    order.payment_code ||
    order.cip_code ||
    order.cip ||
    order.payment_method_type === "pagoefectivo" ||
    order.payment_method_type === "agente"
  ) {
    logger.log("✅ [culqi.ts] Método detectado: PagoEfectivo/Agente", {
        payment_code: !!order.payment_code,
        cip_code: !!order.cip_code,
        cip: !!order.cip,
        payment_method_type: order.payment_method_type
    });
    return "pagoefectivo";
  }

  logger.warn("⚠️ [culqi.ts] No se pudo detectar método de pago asíncrono", order);
  return null;
};