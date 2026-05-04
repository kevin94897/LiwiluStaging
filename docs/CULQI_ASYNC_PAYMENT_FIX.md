# Corrección: Detección de Métodos de Pago Asíncronos en Culqi

## 📋 Problema

Cuando un usuario selecciona un método de pago asíncrono (PagoEfectivo, Yape, Billetera, etc.) en el modal de Culqi, la aplicación no puede determinar correctamente qué método seleccionó porque:

1. **Culqi no envía `payment_method_type`** en la respuesta de la orden
2. **Ambos códigos (QR y CIP) están presentes** en órdenes de PagoEfectivo
3. **La detección por URL no es suficiente** cuando hay ambos códigos

### Estado Actual del Error

```javascript
// Logs actuales:
🔍 [CAMPOS CLAVE]: {
  payment_method_type: undefined,  // ❌ No viene en la respuesta
  qr: "https://niubizqr.pagoefectivo.pe/...",  // ✅ Presente
  payment_code: "153161387"  // ✅ Presente
}
⚠️ Ambos códigos disponibles (QR y CIP), pero sin payment_method_type claro
✅ Método detectado: QR (ambos códigos, default QR)  // ❌ INCORRECTO
```

### Comportamiento Esperado

| Método Seleccionado | Debe Mostrar | Actualmente Muestra |
|---------------------|--------------|---------------------|
| Yape | QR | ✅ QR |
| Billetera Digital | QR | ✅ QR |
| PagoEfectivo | CIP | ❌ QR |
| Agente | CIP | ❌ QR |
| Banca Móvil | CIP | ❌ QR |
| Cuotéalo | CIP | ❌ QR |

---

## 🎯 Solución: Capturar el método desde el modal de Culqi

Ya que Culqi no envía `payment_method_type`, debemos **capturar el método que el usuario seleccionó ANTES de que se genere la orden**, directamente desde la interacción con el modal.

---

## 📝 Implementación

### Paso 1: Actualizar `lib/culqi.ts`

Reemplaza el archivo completo o agrega estas funciones:

```typescript
// lib/culqi.ts

import logger from './logger';
import { CulqiOptions } from './types/culqi.types';

export const CULQI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || "";

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

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN DE CULQI
// ═══════════════════════════════════════════════════════════
export const configureCulqi = (): boolean => {
  if (typeof window === 'undefined' || !window.Culqi) {
    logger.warn('⚠️ Culqi no está disponible');
    return false;
  }

  window.Culqi.publicKey = CULQI_PUBLIC_KEY;
  logger.log('✅ Culqi configurado con clave pública:', CULQI_PUBLIC_KEY.substring(0, 20) + '...');
  return true;
};

// ═══════════════════════════════════════════════════════════
// ABRIR MODAL PARA ÓRDENES ASÍNCRONAS
// ═══════════════════════════════════════════════════════════
export interface CulqiOrderOptions {
  title: string;
  currency: 'PEN' | 'USD';
  description: string;
  amount: number;
  orderId: string;
}

export const openCulqiForAsyncOrder = (options: CulqiOrderOptions): void => {
  logger.log('%c🚀 [CULQI-ORDER] Iniciando orden asíncrona...', 'background: #111; color: #FFD700; font-size: 14px; font-weight: bold; padding: 4px;');

  if (typeof window === 'undefined' || !window.Culqi) {
    logger.error('❌ [CULQI-ORDER] Culqi no está cargado');
    throw new Error('Culqi no está disponible');
  }

  if (!options.orderId) {
    logger.error('❌ [CULQI-ORDER] orderId es requerido');
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

    // 2. Settings
    const settings = {
      title: options.title,
      currency: options.currency,
      description: safeDescription,
      amount: amountCents,
      order: options.orderId,
    };

    logger.log('📦 [CULQI-ORDER] Settings:', settings);
    window.Culqi.settings(settings);

    // 3. Options del modal
    const culqiOptions: CulqiOptions = {
      lang: 'auto',
      modal: true,
      paymentMethods: {
        tarjeta: false, // Solo métodos asíncronos
        yape: true,
        billetera: true,
        bancaMovil: true,
        agente: true,
        cuotealo: true,
      },
      style: {
        logo: '',
        maincolor: '#0ec1c1',
        buttontext: 'Generar código',
        maintext: 'Selecciona tu método de pago',
        desctext: safeDescription,
      },
      onClose: () => {
        logger.log('🚪 [CULQI-ORDER] Modal cerrado');
        window.dispatchEvent(new CustomEvent('culqi-modal-closed'));
      }
    };

    logger.log('📦 [CULQI-ORDER] Options:', culqiOptions);
    window.Culqi.options(culqiOptions);

    // 4. Abrir modal
    logger.log('🏁 [CULQI-ORDER] Abriendo modal...');
    window.Culqi.open();

  } catch (error) {
    logger.error('❌ [CULQI-ORDER] Error crítico:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════
// DETECCIÓN DE MÉTODO DE PAGO
// ═══════════════════════════════════════════════════════════
export const detectAsyncPaymentMethod = (order: any): "qr" | "pagoefectivo" | null => {
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
  // PRIORIDAD 1: payment_method_type (si existe)
  // ═══════════════════════════════════════════════════════════
  if (order.payment_method_type) {
    logger.log(`📍 payment_method_type detectado: ${order.payment_method_type}`);
    
    if (order.payment_method_type === "yape" || order.payment_method_type === "billetera") {
      logger.log("✅ [culqi.ts] Método: QR (por payment_method_type)");
      return "qr";
    }

    if (
      order.payment_method_type === "pagoefectivo" ||
      order.payment_method_type === "agente" ||
      order.payment_method_type === "bancaMovil" ||
      order.payment_method_type === "cuotealo"
    ) {
      logger.log("✅ [culqi.ts] Método: CIP (por payment_method_type)");
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
    
    // PagoEfectivo (niubiz/pagoefectivo en URL)
    if (qrLower.includes('niubiz') || qrLower.includes('pagoefectivo')) {
      logger.log("✅ [culqi.ts] Método: CIP (PagoEfectivo detectado por URL)");
      return "pagoefectivo";
    }
    
    // Yape
    if (qrLower.includes('yape')) {
      logger.log("✅ [culqi.ts] Método: QR (Yape por URL)");
      return "qr";
    }
    
    // Otras billeteras
    if (qrLower.includes('plin') || qrLower.includes('tunki') || qrLower.includes('billetera')) {
      logger.log("✅ [culqi.ts] Método: QR (Billetera por URL)");
      return "qr";
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PRIORIDAD 3: Por códigos disponibles
  // ═══════════════════════════════════════════════════════════
  const hasQR = !!qrUrl;
  const hasCIP = !!cipCode;

  logger.log("📦 [culqi.ts] Códigos disponibles:", { hasQR, hasCIP });

  // Ambos presentes → PagoEfectivo
  if (hasQR && hasCIP) {
    logger.log("✅ [culqi.ts] Método: CIP (ambos códigos presentes = PagoEfectivo)");
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

  logger.error("❌ [culqi.ts] No se pudo detectar método de pago");
  return null;
};

// ═══════════════════════════════════════════════════════════
// OTRAS FUNCIONES EXISTENTES
// ═══════════════════════════════════════════════════════════
// Mantén todas tus otras funciones existentes:
// - configureCulqi3DS
// - init3DSAuthentication
// - openCulqiForTokenization
// - closeCulqi
// - resetCulqi
// etc.
```

---

### Paso 2: Actualizar `checkout.tsx`

En la función `handleCulqiOrder`, asegúrate de guardar el método capturado:

```typescript
const handleCulqiOrder = async (order: CulqiOrderResponse) => {
  logger.log("✅ [handleCulqiOrder] Order recibida:", order.id);
  logger.log("📦 [handleCulqiOrder] Order completa:", order);

  isProcessingRef.current = true;
  closeCulqi();

  try {
    if (!currentPendingOrderId) {
      throw new Error("No se encontró la orden pendiente");
    }

    // ✅ Detectar método (ahora usará el capturado del modal)
    const asyncPaymentMethod = detectAsyncPaymentMethod(order);

    if (!asyncPaymentMethod) {
      logger.error("❌ No se pudo detectar método de pago asíncrono");
      throw new Error("No se pudo determinar el método de pago");
    }

    logger.log(`✅ Método detectado: ${asyncPaymentMethod}`);

    // Extraer códigos
    const qrData = order.qr_string || order.qr || null;
    const cipCode = order.payment_code || order.cip_code || order.cip || null;

    logger.log("📦 Datos extraídos:", {
      hasQR: !!qrData,
      hasCIP: !!cipCode,
      method: asyncPaymentMethod
    });

    // Validar que tengamos el código correcto
    if (asyncPaymentMethod === "qr" && !qrData) {
      throw new Error("No se generó el código QR");
    }

    if (asyncPaymentMethod === "pagoefectivo" && !cipCode) {
      throw new Error("No se generó el código CIP");
    }

    // Guardar en localStorage
    const orderData = {
      orderId: order.id,
      paymentMethod: asyncPaymentMethod,
      pendingOrderId: currentPendingOrderId,
      amount: order.amount / 100,
      currency: order.currency_code || "PEN",
      expirationDate: order.expiration_date
        ? new Date(order.expiration_date * 1000).toISOString()
        : null,
      qr: qrData,
      paymentCode: cipCode,
      timestamp: Date.now(),
      clientDetails: order.client_details,
    };

    logger.log("💾 Guardando datos en localStorage:", orderData);
    localStorage.setItem("liwilu_last_culqi_order", JSON.stringify(orderData));

    // Pequeño delay y redirección
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    const redirectUrl = `/pago-pendiente?order=${currentPendingOrderId}&method=${asyncPaymentMethod}`;
    logger.log(`🔄 Redirigiendo a: ${redirectUrl}`);
    router.push(redirectUrl);

  } catch (error: any) {
    logger.error("❌ Error en handleCulqiOrder:", error);
    showToast(error.message || "Error al procesar el pago asíncrono", "error");
    setProcessing(false);
    isProcessingRef.current = false;
  }
};
```

---

## ✅ Resultado Esperado

Después de implementar estos cambios, los logs deberían verse así:

```
🎧 [culqi.ts] Configurando interceptor de método de pago...
✅ [culqi.ts] Modal de Culqi detectado, configurando interceptores de clicks...
🖱️ [culqi.ts] Click detectado en modal: {text: 'pagoefectivo', class: '...', id: '...'}
✅ [culqi.ts] Método capturado: CIP (PagoEfectivo/Agente/Banca)
✅ [handleCulqiOrder] Order recibida: ord_test_...
🔍 [culqi.ts] Detectando método de pago asíncrono:
✅ [culqi.ts] Usando método capturado del modal: pagoefectivo
✅ Método detectado: pagoefectivo
🔄 Redirigiendo a: /pago-pendiente?order=368&method=pagoefectivo
```

---

## 🧪 Testing

Prueba cada método de pago y verifica:

| Método | Modal Click | Código Mostrado | Estado |
|--------|-------------|-----------------|--------|
| Yape | "yape" | QR | ✅ |
| Billetera | "billetera" | QR | ✅ |
| PagoEfectivo | "pagoefectivo" | CIP | ✅ |
| Agente | "agente" | CIP | ✅ |
| Banca Móvil | "banca móvil" | CIP | ✅ |
| Cuotéalo | "cuotéalo" | CIP | ✅ |

---

## 🔧 Troubleshooting

### Si el interceptor no detecta clicks:

1. **Verifica que el modal se está cargando:**
   ```javascript
   // En la consola del navegador:
   document.querySelector('.culqi-container')
   ```

2. **Inspecciona la estructura del modal:**
   - Abre DevTools
   - Abre el modal de Culqi
   - Inspecciona los botones de método de pago
   - Anota sus clases, IDs y texto
   - Actualiza las condiciones en `setupPaymentMethodInterceptor`

3. **Verifica los logs:**
   - Deberías ver `🖱️ Click detectado en modal`
   - Si no lo ves, el selector del botón puede estar incorrecto

### Si los mensajes postMessage no funcionan:

- Es normal, Culqi puede no enviar mensajes
- El interceptor de clicks es más confiable
- Mantenlo como fallback

---

## 📚 Notas Adicionales

- **¿Por qué usar una variable global?** Porque necesitamos persistir el método seleccionado entre el click del usuario y la respuesta de Culqi
- **¿Por qué useCapture: true?** Para capturar el evento antes de que Culqi lo procese
- **¿Por qué el timeout de 5s?** Para no dejar el interval corriendo indefinidamente si el modal no se abre

---

## 🎯 Checklist de Implementación

- [ ] Actualizar `lib/culqi.ts` con las nuevas funciones
- [ ] Actualizar `checkout.tsx` para llamar a los interceptores
- [ ] Probar con PagoEfectivo → Debe mostrar CIP
- [ ] Probar con Yape → Debe mostrar QR
- [ ] Probar con Billetera → Debe mostrar QR
- [ ] Probar con Agente → Debe mostrar CIP
- [ ] Verificar logs en consola
- [ ] Verificar que la redirección usa el método correcto

---

## 📞 Soporte

Si después de implementar esto sigue sin funcionar:

1. Comparte los logs completos de la consola
2. Comparte una captura del modal de Culqi (para ver la estructura HTML)
3. Comparte el valor de `document.querySelector('.culqi-container')` después de abrir el modal

---

**Versión:** 1.0  
**Fecha:** 2026-02-12  
**Autor:** Asistente Claude
