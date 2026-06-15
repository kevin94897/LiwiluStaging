# 🔧 FIX: Modal 3DS Se Queda Cargando

## 🔍 PROBLEMA DETECTADO

El modal de 3DS se abre pero se queda cargando indefinidamente mostrando:
```
"Procesando el pago con tu banco
Gracias por tu paciencia. Esto puede tomar un momento con conexiones lentas..."
```

### Causa Raíz
El modal de Culqi3DS **no está configurado correctamente** antes de llamar a `initAuthentication()`.

---

## ✅ SOLUCIÓN COMPLETA

### 1️⃣ Actualizar `lib/culqi.ts` - Configurar 3DS Correctamente

Reemplaza la función `configureCulqi3DS`:

```typescript
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

/**
 * Inicia la autenticación 3DS con configuración completa
 */
export const init3DSAuthentication = (token: string): void => {
    if (typeof window !== 'undefined' && window.Culqi3DS) {
        logger.log("🔐 [lib/culqi.ts] Iniciando autenticación 3DS para token:", token);
        
        // Asegurar que la configuración esté presente
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
        
        // Iniciar autenticación
        try {
            window.Culqi3DS.initAuthentication(token);
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
```

---

### 2️⃣ Actualizar `pages/checkout.tsx` - handleCulqiLoad

Modifica la función `handleCulqiLoad` para configurar 3DS correctamente:

```typescript
const handleCulqiLoad = () => {
  logger.log("📦 Script de Culqi cargado");

  // Debug availability
  if (typeof window !== "undefined") {
    logger.log("🔍 [handleCulqiLoad] window.Culqi:", !!window.Culqi);
    logger.log("🔍 [handleCulqiLoad] window.Culqi3DS:", !!window.Culqi3DS);
  }

  // Configurar Culqi Checkout
  const configured = configureCulqi();
  
  // Configurar Culqi 3DS
  configureCulqi3DS();

  setCulqiReady(configured);

  // ═══════════════════════════════════════════════════════════
  // CONFIGURAR CALLBACK PARA 3DS
  // ═══════════════════════════════════════════════════════════
  if (typeof window !== "undefined") {
    // @ts-ignore
    window.culqi3DS = async () => {
      logger.log("🔐 [3DS CALLBACK] Respuesta recibida de Culqi3DS");
      logger.log("📦 [3DS STATE] window.Culqi3DS:", {
        hasToken: !!window.Culqi3DS?.token,
        hasError: !!window.Culqi3DS?.error,
        token: window.Culqi3DS?.token,
        error: window.Culqi3DS?.error
      });

      if (window.Culqi3DS?.token) {
        const result = window.Culqi3DS.token;
        logger.log("🔐 [3DS] Autenticación completada con éxito:", result);

        // Reintentar pago con datos 3DS
        await handlePaymentWith3DS(result);
      } else if (window.Culqi3DS?.error) {
        logger.error("❌ [3DS] Error en autenticación:", window.Culqi3DS.error);
        showToast(
          window.Culqi3DS.error.user_message || "Error en autenticación 3DS",
          "error",
        );
        setProcessing(false);
        isProcessingRef.current = false;
      } else {
        logger.warn("⚠️ [3DS] Callback sin token ni error");
      }
    };

    // Listener para cierre del modal 3DS
    const handle3DSClosed = () => {
      logger.log("🚪 [3DS] Modal cerrado detectado");
      setProcessing(false);
      isProcessingRef.current = false;
    };

    window.addEventListener('culqi-3ds-closed', handle3DSClosed);

    // Cleanup
    return () => {
      window.removeEventListener('culqi-3ds-closed', handle3DSClosed);
    };
  }
};
```

---

### 3️⃣ Actualizar `pages/checkout.tsx` - handleCulqiToken

Modifica la sección donde se inicia 3DS:

```typescript
// Dentro de handleCulqiToken, reemplazar la sección de 3DS:

// ═══════════════════════════════════════════════════════════
// MANEJAR 3DS SI ES REQUERIDO
// ═══════════════════════════════════════════════════════════
if (payResponse.requires3DS) {
  logger.log("🔐 [3DS] Se requiere autenticación 3D Secure");
  logger.log("🔍 [3DS] Verificando disponibilidad:", {
    hasCulqi3DS: !!window.Culqi3DS,
    hasInitAuth: !!(window.Culqi3DS && window.Culqi3DS.initAuthentication),
    publicKey: window.Culqi3DS?.publicKey,
    hasOptions: !!window.Culqi3DS?.options
  });
  
  if (!window.Culqi3DS) {
    logger.error("❌ [3DS] window.Culqi3DS es undefined");
    throw new Error(
      "El módulo 3DS no está cargado. Por favor, recarga la página e intenta nuevamente.",
    );
  }

  if (typeof window.Culqi3DS.initAuthentication !== 'function') {
    logger.error("❌ [3DS] initAuthentication no es una función");
    throw new Error(
      "El módulo 3DS no está completamente inicializado. Recarga la página.",
    );
  }

  // Asegurar configuración antes de iniciar
  if (!window.Culqi3DS.publicKey) {
    logger.warn("⚠️ [3DS] Configurando publicKey antes de iniciar");
    window.Culqi3DS.publicKey = CULQI_PUBLIC_KEY;
  }

  if (!window.Culqi3DS.options) {
    logger.warn("⚠️ [3DS] Configurando options antes de iniciar");
    window.Culqi3DS.options = {
      showModal: true,
      showIcon: true,
      closeModalAction: () => {
        logger.log("🚪 [3DS] Modal cerrado");
        setProcessing(false);
        isProcessingRef.current = false;
      }
    };
  }

  try {
    logger.log("🔐 [3DS] Iniciando autenticación para token:", token.id);
    
    // Llamar a init3DSAuthentication desde lib/culqi.ts
    init3DSAuthentication(token.id);
    
    logger.log("✅ [3DS] Autenticación iniciada, esperando respuesta del banco...");
    
    // NO cerrar el processing overlay, mantenerlo visible
    // setProcessing(false); // ❌ NO hacer esto
    
    return; // Detener flujo y esperar callback window.culqi3DS
    
  } catch (error: any) {
    logger.error("❌ [3DS] Error al iniciar autenticación:", error);
    throw new Error(
      `Error al iniciar 3DS: ${error.message}`
    );
  }
}
```

---

### 4️⃣ Actualizar Scripts en el JSX

Asegúrate de que los scripts se carguen en el orden correcto:

```tsx
{/* 1. Primero Culqi 3DS */}
<Script
  src="https://3ds.culqi.com"
  strategy="afterInteractive"
  onLoad={() => {
    logger.log("📦 Script de Culqi 3DS cargado");
    if (typeof window !== "undefined" && window.Culqi3DS) {
      configureCulqi3DS();
    }
  }}
  onError={() => logger.error("❌ Error al cargar Culqi 3DS")}
/>

{/* 2. Luego Culqi Checkout */}
<Script
  src="https://checkout.culqi.com/js/v4"
  strategy="afterInteractive"
  onLoad={handleCulqiLoad}
  onError={() => logger.error("❌ Error al cargar Culqi Checkout")}
/>
```

---

### 5️⃣ Actualizar `lib/types/culqi.types.ts`

Asegúrate de que la interfaz de Culqi3DS esté completa:

```typescript
declare global {
    interface Window {
        Culqi: any;
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
            settings: (config: {
                publicKey: string;
                options?: any;
            }) => void;
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
```

---

## 🧪 TESTING

### Flujo de prueba:

1. **Abrir checkout** → Verificar logs:
   ```
   📦 Script de Culqi 3DS cargado
   📦 Script de Culqi cargado
   ✅ Culqi 3DS configurado correctamente con opciones
   ```

2. **Ingresar tarjeta que requiere 3DS**:
   - Número: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiración: `12/2030`

3. **Confirmar pago** → Verificar logs:
   ```
   🔐 [3DS] Se requiere autenticación 3D Secure
   🔐 [3DS] Iniciando autenticación para token: tkn_...
   ✅ [3DS] Autenticación iniciada
   ```

4. **Modal 3DS debe abrir** con la simulación del banco

5. **Después de completar 3DS** → Verificar logs:
   ```
   🔐 [3DS CALLBACK] Respuesta recibida
   🔐 [3DS] Autenticación completada con éxito
   [3DS] Reintentando pago con parametros de autenticacion...
   ✅ Pago confirmado para orden #...
   ```

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### Error 1: "Modal se queda cargando"
**Causa**: `options` no está configurado
**Solución**: Asegurar que `configureCulqi3DS()` se llama ANTES de `initAuthentication()`

### Error 2: "Callback no se ejecuta"
**Causa**: `window.culqi3DS` no definido o mal configurado
**Solución**: Verificar que se define en `handleCulqiLoad`

### Error 3: "Modal no se cierra"
**Causa**: `closeModalAction` no configurado
**Solución**: Agregar en `options.closeModalAction`

---

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] ✅ Scripts cargados en orden correcto (3DS primero, Checkout después)
- [ ] ✅ `configureCulqi3DS()` llamado al cargar scripts
- [ ] ✅ `window.culqi3DS` callback definido
- [ ] ✅ `options` configurado con `showModal: true`
- [ ] ✅ Logs de debugging activos
- [ ] ✅ Timeout o error handler para casos límite
- [ ] ✅ Processing overlay se mantiene durante 3DS

---

## 🎯 RESULTADO ESPERADO

**ANTES (Problema):**
```
[Modal cargando infinitamente] ⏳
❌ No hay respuesta del banco
❌ No se ejecuta callback
```

**DESPUÉS (Solución):**
```
✅ Modal 3DS se abre correctamente
✅ Muestra simulación del banco
✅ Usuario completa autenticación
✅ Callback se ejecuta
✅ Pago se confirma
🎉 Orden completada
```

---

**¡Modal 3DS funcionará correctamente!** 🔐
