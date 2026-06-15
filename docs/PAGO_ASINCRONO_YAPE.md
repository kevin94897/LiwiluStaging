# Prompt para Agente IA: Correcciones en Flujo de Pago Checkout

## Contexto
Estás trabajando en un sistema de checkout con Culqi que maneja dos tipos de pago:
1. **Pago con tarjeta** (card): Tokenización inmediata con posible 3DS
2. **Pago asíncrono** (async): QR, PagoEfectivo, Yape con código

El sistema tiene órdenes pendientes (pending orders) que pueden tener múltiples estados.

## Problema Actual
El flujo está creando órdenes duplicadas porque:
1. Crea una nueva orden ANTES de verificar si existe una previa
2. No valida correctamente el estado de órdenes existentes
3. No maneja la expiración de órdenes pendientes

## Tareas a Realizar

### TAREA 1: Corregir el orden de operaciones en `handleProcesarPago`

**Ubicación**: `pages/checkout.tsx` función `handleProcesarPago`

**Cambio requerido**:
```typescript
// ❌ ANTES (Incorrecto):
// 1. Crear orden nueva con createOrder()
// 2. Buscar orden previa con getPendingOrderAttempt()
// 3. Usar la encontrada si existe (conflicto)

// ✅ AHORA (Correcto):
// 1. Verificar si existe orden AWAITING_PAYMENT (solo para método async)
// 2. Validar estado de orden encontrada
// 3. Solo crear nueva si no existe o está expirada/fallida
```

**Pseudocódigo**:
```
SI metodoPago === "async":
    pendingOrderId = null
    shouldCreateNewOrder = false
    
    INTENTAR:
        buscar orden con getPendingOrderAttempt("AWAITING_PAYMENT")
        
        SI orden encontrada:
            verificar estado con checkAsyncPaymentStatus(ordenId)
            
            SI estado === "paid":
                redirigir a éxito inmediatamente
                SALIR
            
            SI estado === "expired" O "failed":
                shouldCreateNewOrder = true
            
            SI estado === "waiting":
                SI tiene expirationDate Y está expirada:
                    shouldCreateNewOrder = true
                SINO:
                    pendingOrderId = ordenId encontrada
                    (reutilizar orden válida)
        SINO:
            shouldCreateNewOrder = true
    
    SI shouldCreateNewOrder O pendingOrderId es null:
        crear nueva orden con createOrder()
        pendingOrderId = nueva orden creada

SINO (método === "card"):
    SIEMPRE crear nueva orden
    pendingOrderId = nueva orden creada

continuar con flujo de pago usando pendingOrderId
```

### TAREA 2: Añadir validación de expiración

**Crear función helper**:
```typescript
/**
 * Verifica si una orden está expirada
 * @param expirationDate - Fecha de expiración en formato ISO
 * @returns true si la orden está expirada
 */
const isOrderExpired = (expirationDate: string | null | undefined): boolean => {
  if (!expirationDate) return false;
  
  try {
    const expDate = new Date(expirationDate);
    const now = new Date();
    return expDate <= now;
  } catch {
    return false;
  }
};
```

**Usar en el flujo**:
```typescript
if (statusResp.data.expirationDate) {
  if (isOrderExpired(statusResp.data.expirationDate)) {
    logger.warn("⏰ Orden expirada, se creará nueva");
    shouldCreateNewOrder = true;
  }
}
```

### TAREA 3: Mejorar manejo de estados en flujo asíncrono

**Ubicación**: Dentro de `metodoPago === "async"` en `handleProcesarPago`

**Estructura requerida**:
```typescript
if (metodoPago === "async") {
  setProcessingStage("completing");
  
  try {
    // 1. Obtener estado actual
    const asyncStatusResp = await checkAsyncPaymentStatus(pendingOrderId);
    
    if (asyncStatusResp.success && asyncStatusResp.data) {
      const { status, culqiOrderId } = asyncStatusResp.data;
      
      // 2. Manejar caso: Ya pagada
      if (status === 'paid' && asyncStatusResp.data.orderId) {
        await handlePaymentSuccess(asyncStatusResp.data.orderId);
        return;
      }
      
      // 3. Manejar caso: Tiene culqiOrderId válido
      if (culqiOrderId && (status === 'waiting' || !status)) {
        // Validar expiración si existe
        if (asyncStatusResp.data.expirationDate) {
          if (isOrderExpired(asyncStatusResp.data.expirationDate)) {
            // Crear nuevo culqiOrder
            throw new Error('EXPIRED_ORDER');
          }
        }
        
        // Reutilizar orden existente
        setCulqiOrderId(culqiOrderId);
        openCulqiForAsyncOrder({
          title: "Liwilu",
          currency: asyncStatusResp.data.currency || "PEN",
          description: `Pedido ${pendingOrderId} - Liwilu Shop`,
          amount: asyncStatusResp.data.total || Math.round(totals.total * 100),
          orderId: culqiOrderId,
        });
        setProcessing(false);
        return;
      }
    }
    
    // 4. Si no hay culqiOrderId válido, crear uno
    const createCulqiResp = await createCulqiOrder(pendingOrderId, email);
    
    if (createCulqiResp.success && createCulqiResp.data?.culqiOrderId) {
      setCulqiOrderId(createCulqiResp.data.culqiOrderId);
      openCulqiForAsyncOrder({
        title: "Liwilu",
        currency: createCulqiResp.data.currency || "PEN",
        description: `Pedido ${pendingOrderId} - Liwilu Shop`,
        amount: createCulqiResp.data.amount || Math.round(totals.total * 100),
        orderId: createCulqiResp.data.culqiOrderId,
      });
      setProcessing(false);
    } else {
      throw new Error(createCulqiResp.message || "No se pudo crear la orden");
    }
    
  } catch (asyncError: any) {
    // Manejar error específico de orden expirada
    if (asyncError.message === 'EXPIRED_ORDER') {
      const createCulqiResp = await createCulqiOrder(pendingOrderId, email);
      // ... continuar con nuevo culqiOrder
    } else {
      throw asyncError;
    }
  }
}
```

### TAREA 4: Agregar logs descriptivos

Añadir los siguientes logs en puntos clave:
```typescript
// Al inicio de búsqueda de orden previa
logger.log("🔍 Buscando orden pendiente previa (AWAITING_PAYMENT)...");

// Al encontrar orden
logger.log("✅ Orden pendiente encontrada:", existingOrderId);
logger.log("📊 Estado de orden pendiente:", status);

// Al decidir crear nueva
logger.log("📝 Creando nueva orden pendiente...");
logger.log("✅ Nueva orden creada:", pendingOrderId);

// Al reutilizar orden
logger.log("✅ Reutilizando orden válida:", pendingOrderId);

// Al validar expiración
logger.warn("⏰ Orden expirada por tiempo, se creará nueva");

// Al usar culqiOrder existente
logger.log("✅ Usando Culqi Order existente:", culqiOrderId);

// Al crear nuevo culqiOrder
logger.log("🔄 Creando nuevo Culqi Order...");
logger.log("✅ Culqi Order creado:", newCulqiOrderId);
```

### TAREA 5: Mejorar manejo de errores

**Agregar try-catch específicos**:
```typescript
// Al buscar orden previa
try {
  const pendingAttemptResp = await getPendingOrderAttempt("AWAITING_PAYMENT");
  // ... procesar
} catch (e) {
  logger.warn("⚠️ Error al buscar orden pendiente:", e);
  shouldCreateNewOrder = true; // Fallback seguro
}

// Al verificar estado
try {
  const statusResp = await checkAsyncPaymentStatus(existingOrderId);
  // ... procesar
} catch (statusError) {
  logger.error("❌ Error al verificar estado:", statusError);
  shouldCreateNewOrder = true; // Crear nueva si falla verificación
}

// Al crear culqiOrder
try {
  const createCulqiResp = await createCulqiOrder(pendingOrderId, email);
  // ... procesar
} catch (culqiError: any) {
  logger.error("❌ Error creando Culqi Order:", culqiError);
  
  // Si es error 409 (ya existe), intentar obtener el existente
  if (culqiError.message?.includes('409') || 
      culqiError.message?.includes('ya existe')) {
    const statusResp = await checkAsyncPaymentStatus(pendingOrderId);
    if (statusResp.data?.culqiOrderId) {
      // Usar el existente
      return statusResp.data.culqiOrderId;
    }
  }
  throw culqiError;
}
```

### TAREA 6: Actualizar interfaces de TypeScript

**En `lib/cart.ts`**, verificar que estas interfaces estén completas:
```typescript
export interface CheckAsyncPaymentStatusResponse {
  success: boolean;
  data?: {
    status: 'waiting' | 'paid' | 'expired' | 'failed';
    pendingOrderId: number;
    culqiOrderId?: string;
    orderId?: number; // ID de orden real si está pagada
    total?: number;
    currency?: string;
    createdAt?: string;
    expirationDate?: string; // ← CRÍTICO: Debe existir
    paymentMethod?: 'qr' | 'pagoefectivo';
    paymentMethodType?: string;
    qr?: string;
    paymentCode?: string;
  };
  message?: string;
}
```

### TAREA 7: Validar respuestas del backend

Asegurarse de que el endpoint `GET /payments/pending-orders/:id/async-status` retorne:
```json
{
  "success": true,
  "data": {
    "status": "waiting",
    "pendingOrderId": 123,
    "culqiOrderId": "ord_live_xxx",
    "total": 15000,
    "currency": "PEN",
    "expirationDate": "2024-02-17T10:30:00Z",
    "paymentMethod": "qr",
    "paymentMethodType": "yape"
  }
}
```

## Orden de Implementación

1. ✅ Primero: Crear función `isOrderExpired` helper
2. ✅ Segundo: Modificar inicio de `handleProcesarPago` (verificación antes de crear)
3. ✅ Tercero: Actualizar flujo async con validación de estados
4. ✅ Cuarto: Añadir logs descriptivos
5. ✅ Quinto: Mejorar manejo de errores
6. ✅ Sexto: Verificar interfaces TypeScript
7. ✅ Séptimo: Testear flujos completos

## Casos de Prueba Requeridos

Después de implementar, verificar:

1. **Usuario nuevo con async**: Debe crear orden y culqiOrder nuevos
2. **Usuario cierra modal y vuelve**: Debe reutilizar misma orden si no expiró
3. **Usuario espera >24h y vuelve**: Debe crear nueva orden (expirada)
4. **Orden ya pagada**: Debe redirigir a éxito sin mostrar pago
5. **Usuario con tarjeta**: Siempre debe crear nueva orden
6. **Error de red al verificar**: Debe crear nueva orden como fallback
7. **CulqiOrder ya existe (409)**: Debe obtener y usar el existente

## Resultado Esperado

- ✅ No duplicación de órdenes pendientes
- ✅ Reutilización inteligente de órdenes válidas
- ✅ Detección automática de órdenes expiradas
- ✅ Logs claros para debugging
- ✅ Manejo robusto de errores
- ✅ Experiencia de usuario fluida (puede cerrar y volver)

## Archivos a Modificar

1. `pages/checkout.tsx` - Función `handleProcesarPago` (principal)
2. `lib/cart.ts` - Verificar interfaces (opcional)
3. No modificar `lib/culqi.ts` ni callbacks de Culqi

## Notas Adicionales

- **No modificar** la lógica de pago con tarjeta (3DS) ya funciona
- **Mantener** todos los logs existentes, solo agregar los nuevos
- **Preservar** el manejo de `processingToken.current` y refs
- **No cambiar** la estructura de callbacks de Culqi (`window.culqi`, `window.culqi3DS`)