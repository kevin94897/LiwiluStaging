// lib/culqi.ts

import logger from './logger';

declare global {
    interface Window {
        Culqi: any;
        culqi: () => void;
    }
}

export const CULQI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_VEN0u2ywGdZ9Yvuy';

export interface CulqiOptions {
    title: string;
    currency: 'PEN' | 'USD';
    description: string;
    amount: number;
}

/**
 * Configura Culqi con la clave pública
 */
export const configureCulqi = () => {
    if (typeof window === 'undefined' || !window.Culqi) {
        logger.warn('Culqi no está disponible');
        return false;
    }

    window.Culqi.publicKey = CULQI_PUBLIC_KEY;
<<<<<<< HEAD
    logger.log('✅ Culqi configurado con clave pública');
=======
>>>>>>> prod/main
    return true;
};

/**
 * Abre el modal de Culqi con los parámetros especificados
 */
export const openCulqi = (options: CulqiOptions) => {
<<<<<<< HEAD
    logger.log('%c🚀 [CULQI-V6] INICIANDO...', 'background: #111; color: #00ff00; font-size: 14px; font-weight: bold; padding: 4px;');
=======
>>>>>>> prod/main

    if (typeof window === 'undefined' || !window.Culqi) {
        logger.error('❌ [CULQI-V6] Culqi no está cargado en el navegador');
        return;
    }

    try {
        // 1. LIMPIEZA TOTAL: Culqi v4 a veces mantiene el estado 'order' en su configuración interna
        // Intentamos resetear cualquier configuración previa
        if (window.Culqi.order) window.Culqi.order = null;
        if (window.Culqi.settings) {
            // Re-asignamos la función para asegurar que no hay closures con datos viejos
            // Aunque esto es interno, forzamos los settings nuevos
        }

        const amountCents = Math.round(options.amount * 100);
        const safeDescription = options.description.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 80);

        // 2. CONFIGURACIÓN DE LLAVE PÚBLICA (Obligatorio primero)
        window.Culqi.publicKey = CULQI_PUBLIC_KEY;

        // 3. SETTINGS: Solo enviamos parámetros de tokenización (No 'order')
        const settings = {
            title: options.title,
            currency: options.currency,
            description: safeDescription,
            amount: amountCents,
        };

<<<<<<< HEAD
        logger.log('📦 [CULQI-V6] Culqi.settings:', settings);
=======
>>>>>>> prod/main
        window.Culqi.settings(settings);

        // 4. OPTIONS: Configuración del modal
        const culqiOptions = {
            lang: 'auto',
            modal: true,
            installments: false,
            onClose: () => {
<<<<<<< HEAD
                logger.log('🚪 [CULQI] onClose callback ejecutado');
=======
>>>>>>> prod/main
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('culqi-modal-closed'));
                }
            }
        };
<<<<<<< HEAD
        logger.log('📦 [CULQI-V6] Culqi.options:', culqiOptions);
        window.Culqi.options(culqiOptions);

        // 5. APERTURA
        logger.log('🏁 [CULQI-V6] Ejecutando Culqi.open()...');
=======
        window.Culqi.options(culqiOptions);

        // 5. APERTURA
>>>>>>> prod/main
        window.Culqi.open();

        // 6. POLLING para detectar cierre del modal (fallback si onClose no funciona)
        let pollCount = 0;
        const maxPolls = 600; // 5 minutos máximo (600 * 500ms)
        const pollInterval = setInterval(() => {
            pollCount++;

            // Verificar si el modal sigue abierto
            const modalElement = document.querySelector('.culqi-container, #culqi-container, [class*="culqi"]');
            const isModalVisible = modalElement && window.getComputedStyle(modalElement).display !== 'none';

            if (!isModalVisible || pollCount >= maxPolls) {
<<<<<<< HEAD
                logger.log('🔍 [CULQI] Modal cerrado detectado por polling');
=======
>>>>>>> prod/main
                clearInterval(pollInterval);

                // Solo disparar evento si el modal se cerró sin procesar pago
                if (!window.Culqi.token && !window.Culqi.order) {
<<<<<<< HEAD
                    logger.log('🚪 [CULQI] Disparando evento culqi-modal-closed');
=======
>>>>>>> prod/main
                    window.dispatchEvent(new CustomEvent('culqi-modal-closed'));
                }
            }
        }, 500);

    } catch (error) {
        logger.error('❌ [CULQI-V6] Error crítico:', error);
    }
};

/**
 * Cierra el modal de Culqi
 */
export const closeCulqi = () => {
    if (typeof window !== 'undefined' && window.Culqi) {
        try {
            window.Culqi.close();
        } catch (error) {
            logger.warn('No se pudo cerrar Culqi:', error);
        }
    }
};
