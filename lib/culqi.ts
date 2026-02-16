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


// ═══════════════════════════════════════════════════════════
// VARIABLE GLOBAL PARA RASTREAR EL MÉTODO SELECCIONADO
// ═══════════════════════════════════════════════════════════
let selectedPaymentMethod: 'qr' | 'pagoefectivo' | null = null;

/**
 * Obtiene el método de pago seleccionado (capturado del modal)
 */
export const getSelectedPaymentMethod = (): 'qr' | 'pagoefectivo' | null => {
    return selectedPaymentMethod;
};

/**
 * Resetea el método de pago seleccionado
 */
export const resetSelectedPaymentMethod = (): void => {
    selectedPaymentMethod = null;
    logger.log('🔄 [culqi.ts] Método de pago reseteado');
};

// ═══════════════════════════════════════════════════════════
// INTERCEPTOR DE CLICKS EN EL MODAL DE CULQI
// ═══════════════════════════════════════════════════════════
/**
 * Configura interceptores para detectar el método seleccionado en el modal
 */
export const setupPaymentMethodInterceptor = (): void => {
    if (typeof window === 'undefined') return;

    logger.log('🎧 [culqi.ts] Configurando interceptor de método de pago...');

    // Esperar a que el modal de Culqi se renderice
    const checkModal = setInterval(() => {
        // Buscar el contenedor del modal de Culqi
        const culqiModal = document.querySelector(
            '.culqi-container, #culqi-container, [class*="culqi-modal"], iframe[src*="culqi"]'
        );

        if (culqiModal) {
            logger.log('✅ [culqi.ts] Modal de Culqi detectado, configurando interceptores de clicks...');
            clearInterval(checkModal);

            // Agregar listeners a todos los clicks dentro del modal
            culqiModal.addEventListener('click', (event) => {
                const target = event.target as HTMLElement;

                // Buscar el botón clickeado o su contenedor padre
                const button = target.closest('button, [role="button"], .payment-method, .payment-option, [class*="payment"]');

                if (button) {
                    const buttonText = button.textContent?.toLowerCase().trim() || '';
                    const buttonClass = button.className?.toLowerCase() || '';
                    const buttonId = button.id?.toLowerCase() || '';
                    const dataAttributes = Array.from(button.attributes)
                        .filter(attr => attr.name.startsWith('data-'))
                        .map(attr => `${attr.name}:${attr.value}`)
                        .join(' ')
                        .toLowerCase();

                    logger.log('🖱️ [culqi.ts] Click detectado en modal:', {
                        text: buttonText,
                        class: buttonClass,
                        id: buttonId,
                        data: dataAttributes
                    });

                    // Combinar todos los indicadores
                    const combined = `${buttonText} ${buttonClass} ${buttonId} ${dataAttributes}`;

                    // ═══════════════════════════════════════════════════════════
                    // DETECCIÓN POR PALABRAS CLAVE
                    // ═══════════════════════════════════════════════════════════

                    // Métodos QR
                    if (
                        combined.includes('yape') ||
                        combined.includes('plin') ||
                        combined.includes('billetera') ||
                        combined.includes('wallet') ||
                        (combined.includes('qr') && !combined.includes('pagoefectivo'))
                    ) {
                        selectedPaymentMethod = 'qr';
                        logger.log('✅ [culqi.ts] Método capturado: QR (Yape/Billetera)');
                        return;
                    }

                    // Métodos CIP
                    if (
                        combined.includes('pagoefectivo') ||
                        combined.includes('pago efectivo') ||
                        combined.includes('agente') ||
                        combined.includes('banca') ||
                        combined.includes('móvil') ||
                        combined.includes('movil') ||
                        combined.includes('cuotéalo') ||
                        combined.includes('cuotealo') ||
                        combined.includes('cip') ||
                        combined.includes('efectivo')
                    ) {
                        selectedPaymentMethod = 'pagoefectivo';
                        logger.log('✅ [culqi.ts] Método capturado: CIP (PagoEfectivo/Agente/Banca)');
                        return;
                    }
                }
            }, true); // useCapture = true para capturar antes que otros handlers
        }
    }, 100); // Revisar cada 100ms

    // Timeout de seguridad: dejar de buscar después de 5 segundos
    setTimeout(() => {
        clearInterval(checkModal);
        logger.log('⏱️ [culqi.ts] Timeout del interceptor alcanzado');
    }, 5000);
};

// ═══════════════════════════════════════════════════════════
// LISTENER DE MENSAJES DE CULQI (FALLBACK)
// ═══════════════════════════════════════════════════════════
/**
 * Configura listener de mensajes postMessage desde el iframe de Culqi
 */
export const setupPaymentMethodMessageListener = (): void => {
    if (typeof window === 'undefined') return;

    logger.log('🎧 [culqi.ts] Configurando listener de mensajes postMessage...');

    const handleCulqiMessage = (event: MessageEvent) => {
        // Solo procesar mensajes de Culqi
        if (!event.origin.includes('culqi.com') && !event.origin.includes('checkout.culqi')) {
            return;
        }

        logger.log('📨 [culqi.ts] Mensaje recibido de Culqi:', {
            origin: event.origin,
            data: event.data
        });

        // Intentar detectar el método del mensaje
        if (event.data && typeof event.data === 'object') {
            const data = event.data;

            // Buscar en diferentes posibles campos
            const methodField =
                data.paymentMethod ||
                data.payment_method ||
                data.method ||
                data.type ||
                data.selectedMethod;

            if (methodField) {
                const methodLower = String(methodField).toLowerCase();
                logger.log('📍 [culqi.ts] Campo de método encontrado:', methodLower);

                if (methodLower.includes('yape') || methodLower.includes('billetera') || methodLower === 'qr') {
                    selectedPaymentMethod = 'qr';
                    logger.log('✅ [culqi.ts] Método capturado por mensaje: QR');
                } else if (
                    methodLower.includes('pagoefectivo') ||
                    methodLower.includes('agente') ||
                    methodLower.includes('banca') ||
                    methodLower.includes('cuotealo') ||
                    methodLower === 'cip'
                ) {
                    selectedPaymentMethod = 'pagoefectivo';
                    logger.log('✅ [culqi.ts] Método capturado por mensaje: CIP');
                }
            }

            // También buscar en action
            if (data.action) {
                const actionLower = String(data.action).toLowerCase();
                if (actionLower.includes('yape') || actionLower.includes('qr')) {
                    selectedPaymentMethod = 'qr';
                    logger.log('✅ [culqi.ts] Método capturado por action: QR');
                } else if (actionLower.includes('pagoefectivo') || actionLower.includes('cip')) {
                    selectedPaymentMethod = 'pagoefectivo';
                    logger.log('✅ [culqi.ts] Método capturado por action: CIP');
                }
            }
        }
    };

    // Agregar listener (solo una vez)
    window.removeEventListener('message', handleCulqiMessage);
    window.addEventListener('message', handleCulqiMessage);
    logger.log('✅ [culqi.ts] Listener de mensajes configurado');
};

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
                yape: false,
                billetera: false,
                bancaMovil: false,
                agente: false,
                // cuotealo: false,
            },
            style: {
                logo: 'https://liwilu-staging.vercel.app/images/faviconliwilu.png', // Tu logo si lo tienes
                maincolor: '#0ec1c1', // Color primario de tu marca
                buttontext: 'Pagar',
                maintext: 'Liwilu - Finalizar Compra',
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
        // ✅ RESETEAR Y CONFIGURAR INTERCEPTORES
        resetSelectedPaymentMethod();
        setupPaymentMethodInterceptor();
        setupPaymentMethodMessageListener();

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
                tarjeta: false, // Deshabilitado - solo métodos asíncronos
                yape: true,
                billetera: true,
                bancaMovil: true,
                agente: true,
                cuotealo: false,
            },
            style: {
                logo: 'https://liwilu-staging.vercel.app/images/faviconliwilu.png',
                maincolor: '#0ec1c1',
                buttontext: 'Pagar ahora',
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
            // 1. Configurar clave pública PRIMERO usando el método correcto
            try {
                if (typeof window.Culqi3DS.setKeys === 'function') {
                    window.Culqi3DS.setKeys(CULQI_PUBLIC_KEY);
                    logger.log("🔑 [lib/culqi.ts] Culqi3DS.setKeys() ejecutado con éxito");
                } else {
                    // Fallback a asignación directa
                    window.Culqi3DS.publicKey = CULQI_PUBLIC_KEY;
                    logger.log("🔑 [lib/culqi.ts] Culqi3DS.publicKey asignado directamente");
                }
            } catch (error) {
                logger.warn("⚠️ [lib/culqi.ts] Error configurando publicKey:", error);
                // Intentar asignación directa como fallback
                window.Culqi3DS.publicKey = CULQI_PUBLIC_KEY;
            }

            // 2. Configurar opciones del modal 3DS
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

            logger.log("✅ [lib/culqi.ts] Culqi 3DS configurado correctamente", {
                hasPublicKey: !!window.Culqi3DS.publicKey,
                hasOptions: !!window.Culqi3DS.options
            });
        } else {
            logger.warn("⚠️ [lib/culqi.ts] window.Culqi3DS no está definido todavía");
        }
    }
};

export interface Culqi3DSInitOptions {
    token: string;
    amount: number; // Monto en CÉNTIMOS (ej: 1000 para 10.00)
    email: string;
}

/**
 * Inicia la autenticación 3DS con configuración completa de cargo y tarjeta
 */
export const init3DSAuthentication = (options: Culqi3DSInitOptions): void => {
    if (typeof window !== 'undefined' && window.Culqi3DS) {
        logger.log("🔐 [lib/culqi.ts] Preparando settings de 3DS para token:", options.token);

        // 1. Configurar la clave pública usando el método correcto
        try {
            if (typeof window.Culqi3DS.setKeys === 'function') {
                window.Culqi3DS.setKeys(CULQI_PUBLIC_KEY);
                logger.log("🔑 [lib/culqi.ts] Public key configurada con setKeys()");
            } else {
                // Fallback a asignación directa
                window.Culqi3DS.publicKey = CULQI_PUBLIC_KEY;
                logger.log("🔑 [lib/culqi.ts] Public key configurada directamente");
            }
        } catch (error) {
            logger.warn("⚠️ [lib/culqi.ts] Error configurando publicKey:", error);
        }

        // 2. Configurar Settings (Paso 1 de la documentación de Culqi 3DS)
        const amountCents = Math.round(options.amount * 100);

        window.Culqi3DS.settings = {
            charge: {
                totalAmount: amountCents,
                returnUrl: window.location.href
            },
            card: {
                email: options.email
            }
        };

        logger.log("⚙️ [lib/culqi.ts] Settings configurados:", {
            amount: amountCents,
            email: options.email
        });

        // 3. Configurar opciones del modal
        if (!window.Culqi3DS.options) {
            window.Culqi3DS.options = {
                showModal: true,
                showIcon: true,
                closeModalAction: () => {
                    logger.log("🚪 [3DS] Modal cerrado");
                    window.dispatchEvent(new CustomEvent('culqi-3ds-closed'));
                }
            };
            logger.log("🎨 [lib/culqi.ts] Opciones del modal configuradas");
        }

        // 4. Verificar configuración antes de iniciar
        // 4. Verificar configuración antes de iniciar
        logger.log("🔍 [lib/culqi.ts] Iniciando autenticación (publicKey asignada préviamente)", {
            publicKeyConfigured: true,
            hasSettings: !!window.Culqi3DS.settings,
            hasOptions: !!window.Culqi3DS.options
        });

        // 5. Iniciar autenticación
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
/**
 * Detecta el tipo de pago asíncrono desde la respuesta de Culqi Order
 * PRIORIDAD: payment_method_type > presencia de códigos
 */
/**
 * Detecta el tipo de pago asíncrono desde la respuesta de Culqi Order
 * MEJORADO: Detecta PagoEfectivo por URL del QR
 */
export const detectAsyncPaymentMethod = (
    order: any
): "qr" | "pagoefectivo" | null => {
    logger.log("🔍 [culqi.ts] Detectando método de pago asíncrono:");

    // ═══════════════════════════════════════════════════════════
    // PRIORIDAD 0: Método capturado del modal (MÁS CONFIABLE)
    // ═══════════════════════════════════════════════════════════
    if (selectedPaymentMethod) {
        logger.log(`✅ [culqi.ts] Usando método capturado del modal: ${selectedPaymentMethod}`);
        return selectedPaymentMethod;
    }

    logger.log("📦 [culqi.ts] No hay método capturado, usando detección por orden...");

    // ═══════════════════════════════════════════════════════════
    // LOG DETALLADO PARA DEBUGGING
    // ═══════════════════════════════════════════════════════════
    logger.log("📦 [culqi.ts] Campos relevantes:", {
        payment_method_type: order.payment_method_type,
        state: order.state,
        hasQR: !!(order.qr_string || order.qr),
        hasCIP: !!(order.payment_code || order.cip_code || order.cip),
        qr_url: order.qr || order.qr_string,
        payment_code: order.payment_code || order.cip_code || order.cip,
    });

    // ═══════════════════════════════════════════════════════════
    // PRIORIDAD 1: payment_method_type (si está disponible)
    // ═══════════════════════════════════════════════════════════
    if (order.payment_method_type) {
        logger.log(`📍 payment_method_type detectado: ${order.payment_method_type}`);

        // Métodos QR
        if (
            order.payment_method_type === "yape" ||
            order.payment_method_type === "billetera"
        ) {
            logger.log("✅ [culqi.ts] Método: QR (yape/billetera)");
            return "qr";
        }

        // Métodos CIP
        if (
            order.payment_method_type === "pagoefectivo" ||
            order.payment_method_type === "agente" ||
            order.payment_method_type === "bancaMovil" ||
            order.payment_method_type === "cuotealo"
        ) {
            logger.log("✅ [culqi.ts] Método: CIP (pagoefectivo/agente/banca/cuotealo)");
            return "pagoefectivo";
        }
    }

    // ═══════════════════════════════════════════════════════════
    // PRIORIDAD 2: Análisis de URL del QR
    // ═══════════════════════════════════════════════════════════
    const qrUrl = order.qr || order.qr_string;
    const cipCode = order.payment_code || order.cip_code || order.cip;

    if (qrUrl) {
        const qrLower = qrUrl.toLowerCase();

        logger.log("🔍 [culqi.ts] Analizando URL del QR:", qrUrl.substring(0, 60) + "...");

        // ✅ PagoEfectivo: URL contiene 'niubiz' o 'pagoefectivo'
        if (qrLower.includes('niubiz') || qrLower.includes('pagoefectivo')) {
            logger.log("✅ [culqi.ts] Método: CIP (PagoEfectivo detectado por URL)");
            return "pagoefectivo";
        }

        // ✅ Yape: URL contiene 'yape'
        if (qrLower.includes('yape')) {
            logger.log("✅ [culqi.ts] Método: QR (Yape detectado por URL)");
            return "qr";
        }

        // ✅ Otras billeteras digitales
        if (qrLower.includes('plin') || qrLower.includes('tunki') || qrLower.includes('billetera')) {
            logger.log("✅ [culqi.ts] Método: QR (Billetera digital detectada por URL)");
            return "qr";
        }
    }

    // ═══════════════════════════════════════════════════════════
    // PRIORIDAD 3: Análisis por códigos disponibles
    // ═══════════════════════════════════════════════════════════
    const hasQR = !!qrUrl;
    const hasCIP = !!cipCode;

    logger.log("📦 [culqi.ts] Códigos disponibles:", { hasQR, hasCIP });

    // Si ambos están presentes (sin detección por URL), asumir PagoEfectivo
    if (hasQR && hasCIP) {
        logger.log("✅ [culqi.ts] Método: CIP (ambos códigos presentes)");
        return "pagoefectivo";
    }

    // Solo QR
    if (hasQR && !hasCIP) {
        logger.log("✅ [culqi.ts] Método: QR (solo QR disponible)");
        return "qr";
    }

    // Solo CIP
    if (hasCIP && !hasQR) {
        logger.log("✅ [culqi.ts] Método: CIP (solo CIP disponible)");
        return "pagoefectivo";
    }

    // No se pudo detectar
    logger.error("❌ [culqi.ts] No se pudo detectar método de pago");
    return null;
};