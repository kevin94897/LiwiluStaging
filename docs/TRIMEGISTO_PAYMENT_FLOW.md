# Flujo de Pago Trimegisto

## Overview
Trimegisto es un método de pago que permite que los usuarios compren usando su saldo disponible en cuotas (1-3 cuotas máximo). El flujo **NO crea una orden final inmediatamente**, sino genera una **pre-orden** que requiere confirmación vía email antes de procesar el pago.

---

## Arquitectura del Flujo

### Fase 1: Iniciación de Pre-Orden (Checkout)
**Punto de entrada:** Página de checkout cuando el usuario selecciona Trimegisto

```
Usuario en checkout
    ↓
Selecciona método de pago: "Trimegisto"
    ↓
Valida formulario de datos personales
    ↓
Click en "Confirmar compra"
```

**Datos enviados a `/orders/trismegisto/initiate`:**
```json
{
  "balanceAmount": 18.00,          // Total a cobrar del saldo del usuario
  "installments": 2,                // Cantidad de cuotas (1, 2 o 3)
  "pendingOrderId": 476             // ID de la orden pendiente generada en checkout
}
```

**Headers requeridos:**
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Respuesta esperada del backend:**
```json
{
  "success": true,
  "preOrderId": "PRE-476-TRIMEGISTO",
  "message": "Email de confirmación enviado. Por favor verifica tu correo.",
  "expiresAt": "2026-03-13T12:34:56Z"  // Link válido por X minutos
}
```

### Fase 2: Confirmación por Email
**Acciones en el backend:**
1. Crea la pre-orden con estado "PENDIENTE_CONFIRMACION"
2. Genera un token único para confirmación
3. Envía email al usuario con link de confirmación

**Email contiene:**
```
Asunto: Confirma tu compra en Liwilu - Pedido #LW260306-0002

Cuerpo:
Hola [Nombre del Usuario],

Has iniciado una compra por S/. 18.00 en 2 cuotas usando tu saldo Trimegisto.

Para completar tu compra, haz click en el siguiente enlace:
[LINK] https://liwilu-dev.up.railway.app/orders/trismegisto/confirm/{{tokenCorreo}}

Este link es válido por 24 horas.

---
```

### Fase 3: Confirmación por Link
**Punto de entrada:** Usuario hace click en link del email

**Estructura del link:**
```
GET /orders/trismegisto/confirm/{{tokenCorreo}}
```

**Parámetros enviados automaticamente:**
- Token en la URL (extraído del email)

**Acciones en el backend:**
1. Valida que el token sea válido y no haya expirado
2. Verifica que la pre-orden aún esté en estado "PENDIENTE_CONFIRMACION"
3. Auto-procesa el pago usando el saldo del usuario
4. Crea la orden final
5. Devuelve respuesta con `redirectUrl`

**Respuesta esperada:**
```json
{
  "success": true,
  "autoProcessed": true,
  "orderNumber": "LW260306-0002",
  "message": "¡Compra exitosa! Tu pedido ha sido procesado automáticamente usando tu saldo.",
  "redirectUrl": "https://tienda.liwilu.com.pe/checkout/success?orderId=2000208"
}
```

### Fase 4: Redirección y Confirmación Visual
**En el frontend:**
1. Captura el `redirectUrl` de la respuesta
2. Redirige al usuario mediante `window.location.href = response.redirectUrl`
3. El usuario llega a la página de éxito con details de la orden

---

## Estados de la Pre-Orden

| Estado | Descripción | Acciones Posibles |
|--------|-------------|-------------------|
| `PENDIENTE_CONFIRMACION` | Email enviado, esperando confirmación del usuario | Confirmar, Cancelar |
| `CONFIRMADA` | Usuario hizo click en el link | Auto-procesar pago |
| `COMPLETADA` | Pago procesado exitosamente | Ver orden |
| `EXPIRADA` | Link expiró (24 horas) sin confirmación | Reintentar |
| `CANCELADA` | Usuario canceló o hubo error | Reintentar desde checkout |

---

## Variables Clave en el Carrito

El `CartContext` contiene:
```typescript
totals: {
  subtotal: number;           // Subtotal de productos
  shipping: number;           // Costo de envío
  total: number;              // Total a pagar
  discount?: number;          // Descuentos aplicados
  promoDiscount?: number;     // Descuentos por promociones
  trismegistoBalance?: number;// Saldo trimegisto disponible del usuario
  balanceAmount?: number;     // Cantidad a usar del saldo (en trimegisto)
  balanceInstallments?: number; // Cuotas seleccionadas (1-3)
}
```

---

## Ubicación de la Implementación

### Frontend
- **Endpoint de iniciación:** `lib/cart.ts` → Nueva función `initiateTrismegistoPayment()`
- **Manejo de confirmación:** `pages/checkout.tsx` → Detectar método de pago "trimegisto"
- **Página de confirmación:** Nueva ruta `pages/orders/trismegisto/confirm/[token].tsx`

### Backend
- **POST /orders/trismegisto/initiate** → Crea pre-orden y envía email
- **GET /orders/trismegisto/confirm/:tokenCorreo** → Confirma y procesa pago

---

## Casos de Uso

### Caso 1: Confirmación Exitosa
```
1. Usuario selecciona Trimegisto en checkout
2. Envía 2 cuotas, balance de S/. 18.00
3. Recibe email con link
4. Hace click en link
5. Backend procesa automáticamente
6. Usuario ve página de éxito
```

### Caso 2: Link Expirado
```
1. Usuario recibe email
2. Intenta hacer click después de 24 horas
3. Backend devuelve error: "Link expirado"
4. Usuario debe volver a iniciar en checkout
```

### Caso 3: Saldo Insuficiente
```
1. Usuario selecciona Trimegisto
2. Intenta pagar S/. 500 pero solo tiene S/. 18
3. Frontend DEBE validar balanceAmount <= trismegistoBalance
4. Bloquea el envío si no hay saldo suficiente
```

---

## Consideraciones de Seguridad

1. **Token en Email:** Usar JWT o token criptográfico único
2. **Expiración:** Links válidos por 24 horas máximo
3. **One-time use:** El token no puede ser usado más de una vez
4. **Validación de usuario:** El email debe ser reconfirmado antes de procesar
5. **Rate limiting:** Limitar intentos de confirmación fallidos
6. **Logs:** Registrar todas las transiciones de estado de la pre-orden

---

## Flujo de Datos (Variables)

```
pendingOrderId (checkout)
    ↓
→ Enviado a POST /orders/trismegisto/initiate
    ↓
→ Backend crea pre-orden con estado PENDIENTE_CONFIRMACION
    ↓
→ Email generado con token único
    ↓
→ Usuario hace click en email
    ↓
→ Token extraído de URL: /confirm/{{tokenCorreo}}
    ↓
→ Backend valida token y pre-orden
    ↓
→ Procesa pago automáticamente
    ↓
→ Retorna orderNumber y redirectUrl
    ↓
→ Frontend redirige a /checkout/success?orderId={{orderId}}
```

---

## Monitor de Estado

**En la interfaz de usuario:**
- Mostrar spinner/loading mientras se espera respuesta
- Mensaje: "Enviando solicitud de pago..."
- Después: "Email enviado. Revisa tu correo electrónico"
- En página de confirmación: "Procesando tu compra..."
- Error: Mostrar mensaje y botón "Reintentar"

---

## Tabla de Errores Posibles

| Código de Error | Descripción | Solución |
|-----------------|-------------|----------|
| `BALANCE_INSUFFICIENT` | Saldo insuficiente | Reducir monto o seleccionar otro pago |
| `INVALID_INSTALLMENTS` | Cuotas fuera de rango (1-3) | Validar en frontend |
| `PRE_ORDER_NOT_FOUND` | La pre-orden no existe | Crear nueva en checkout |
| `TOKEN_EXPIRED` | Link expirado (>24h) | Reintentar desde checkout |
| `TOKEN_INVALID` | Token incorrecto/manipulado | Pedir nuevo email |
| `INVALID_USER` | Usuario no autenticado | Loguearse |
| `ALREADY_CONFIRMED` | Pre-orden ya fue confirmada | Ver orden existente |

