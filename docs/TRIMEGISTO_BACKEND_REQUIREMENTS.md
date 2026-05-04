# 🔧 TRIMEGISTO - REQUERIMIENTOS DE BACKEND

> Documento técnico dirigido al equipo de backend con todas las mejoras y requisitos necesarios para que el flujo Trimegisto funcione correctamente con el frontend actual.

---

## 🚨 Estado Actual del Flujo

El frontend ya está completamente implementado. El equipo de backend debe **revisar y ajustar** sus endpoints para que las respuestas y comportamientos coincidan exactamente con lo que el frontend espera.

El flujo actual funciona de la siguiente manera:

```
[FRONTEND/CARRITO]
    │
    ├─ 1. POST /orders/trismegisto/initiate
    │      → Backend crea pre-orden + envía email al usuario
    │
    │  [Usuario recibe email y hace click en el link]
    │  Link email: https://tienda.liwilu.com.pe/confirmar-pedido-trismegisto?token=xxxxx
    │
    ├─ 2. GET /orders/trismegisto/confirm/{token}
    │      → Backend valida token, descuenta saldo, crea orden final
    │      → Devuelve redirectUrl (checkout o éxito)
    │
    └─ 3. Frontend redirige al usuario a la URL retornada
```

---

## 📌 ENDPOINT 1: POST /orders/trismegisto/initiate

### Qué hace el frontend

El frontend llama a este endpoint desde `lib/cart.ts → initiateTrimegistoPreOrder()` sin `pendingOrderId`, enviando **únicamente** el monto y las cuotas:

```json
POST /orders/trismegisto/initiate
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "balanceAmount": 18.00,
  "installments": 2
}
```

### ✅ Respuesta esperada (éxito)

```json
HTTP 200 OK
{
  "success": true,
  "message": "Pre-orden iniciada. Revisa tu correo para confirmar la compra.",
  "data": {
    "preOrderId": "da962151-c340-411d-9c89-ad9cb8d3a4e5",
    "expiresAt": "2026-03-10T11:44:37-05:00"
  }
}
```

> ⚠️ **El frontend actualmente espera `response.success` y `response.data.preOrderId`**.
> Si el backend retorna una estructura diferente (como `{ preOrderId: ... }` directamente sin `data`), el frontend fallará silenciosamente.

### ❌ Respuesta de error

```json
HTTP 400 Bad Request
{
  "message": "Saldo insuficiente. Disponible: S/. 10.00, Solicitado: S/. 18.00",
  "error": "BALANCE_INSUFFICIENT",
  "statusCode": 400
}
```

El frontend muestra `errorData.message` al usuario directamente via toast.

### 📧 Email que debe enviar el backend

El email de confirmación debe incluir un link con la siguiente estructura **exacta**:

```
https://tienda.liwilu.com.pe/confirmar-pedido-trismegisto?token={TOKEN_UNICO}
```

> ⚠️ **CRÍTICO:** El frontend tiene la ruta `pages/confirmar-pedido-trismegisto.tsx` que lee el token del query string (`?token=`). Si el backend envía el link con otra estructura (como `/orders/trismegisto/confirm/{token}`), el flujo de confirmación **no funcionará**.

### Validaciones requeridas en el backend

| Campo | Regla |
|-------|-------|
| `balanceAmount` | Debe ser `> 0` y `<= saldo disponible del usuario` |
| `installments` | Debe ser entre `1` y `3` (entero) |
| `Authorization` | Token JWT válido, usuario autenticado |
| Usuario | Debe tener rol TRIMEGISTO o TRISMEGISMO |
| Saldo | `balanceAmount` no puede exceder `saldo_disponible` |

### Qué debe hacer el backend al recibir la petición

1. Validar autenticación y permisos
2. Verificar que `balanceAmount <= saldo_disponible_usuario`
3. Verificar que `installments` esté entre 1-3
4. Crear registro de pre-orden en BD con estado `PENDIENTE_CONFIRMACION`
5. Generar token criptográfico único (SHA-256 recomendado, mínimo 32 bytes)
6. Establecer expiración de 24 horas desde la creación
7. Enviar email al usuario con el link: `https://tienda.liwilu.com.pe/confirmar-pedido-trismegisto?token={token}`
8. **NO crear la orden final aún** — la orden se crea solo al confirmar
9. Retornar la estructura de `data` con `preOrderId` y `expiresAt`

---

## 📌 ENDPOINT 2: GET /orders/trismegisto/confirm/{token}

### Qué hace el frontend

El frontend llama a este endpoint desde `lib/trimegisto.ts → confirmTrismegistoPayment()` cuando el usuario accede a la página de confirmación vía el link del email:

```
GET /orders/trismegisto/confirm/{token}
```

No requiere autenticación (`Authorization` header) porque el acceso es vía token de email.

### ✅ Respuesta exitosa — Redirigir al checkout de pago

Si el backend necesita que el usuario complete el pago con otro método adicional (como una diferencia pendiente):

```json
HTTP 200 OK
{
  "success": true,
  "autoProcessed": false,
  "orderNumber": "LW260313-0005",
  "message": "Pago pendiente por completar",
  "orderId": 2000208,
  "redirectUrl": "checkout"
}
```

> El frontend identifica `"checkout"` como señal de continuar al flujo de pago estándar.

### ✅ Respuesta exitosa — Orden completada (pago ya procesado)

Si el pago fue procesado automáticamente con el saldo Trimegisto completo:

```json
HTTP 200 OK
{
  "success": true,
  "autoProcessed": true,
  "orderNumber": "LW260313-0005",
  "message": "¡Compra exitosa! Tu pedido ha sido procesado automáticamente.",
  "orderId": 2000208,
  "redirectUrl": "https://tienda.liwilu.com.pe/checkout/success?orderId=2000208"
}
```

> El frontend lee `redirectUrl`:
> - Si es `"checkout"` → continúa al flujo de pago en la tienda
> - Si contiene `/checkout/success?orderId=...` → el usuario ya pagó, redirige a la página de éxito en `/pedido-exitoso` (la cual existe en el frontend, y hay un redirect de `/checkout/success` → `/pedido-exitoso` configurado en `next.config.mjs`)

### ❌ Respuestas de error

El frontend muestra el mensaje de error **exactamente** como viene del backend. Son críticos los siguientes casos:

#### Token expirado (después de 24 horas)

```json
HTTP 400 Bad Request
{
  "message": "El link de confirmación ha expirado. Por favor intenta nuevamente.",
  "error": "Bad Request",
  "statusCode": 400
}
```

> El frontend muestra el estado `expired` si el mensaje contiene palabras como `"expirado"`, `"expired"`, `"vencido"`, o `"inválido"`.

#### Pre-orden ya procesada

```json
HTTP 400 Bad Request
{
  "message": "Esta pre-orden ya ha sido procesada o confirmada.",
  "error": "Bad Request",
  "statusCode": 400
}
```

#### Token no encontrado

```json
HTTP 404 Not Found
{
  "message": "Token no encontrado o inválido.",
  "error": "Not Found",
  "statusCode": 404
}
```

#### Error interno del servidor

```json
HTTP 500 Internal Server Error
{
  "message": "Error interno al procesar el pago.",
  "error": "Internal Server Error",
  "statusCode": 500
}
```

### Validaciones requeridas en el backend

| Campo | Regla |
|-------|-------|
| `token` | Debe existir en BD y no haber expirado |
| Estado pre-orden | Debe ser `PENDIENTE_CONFIRMACION` (no usada antes) |
| Token one-time | Una vez usado, invalidar inmediatamente |

### Qué debe hacer el backend al recibir la petición

1. Buscar el token en la BD de pre-órdenes
2. Verificar que el token no ha expirado (`expiresAt > ahora`)
3. Verificar que la pre-orden esté en estado `PENDIENTE_CONFIRMACION`
4. Marcar el token como usado (one-time use) para evitar doble uso
5. Cambiar estado a `CONFIRMADA`
6. **Crear la orden final** con los datos del carrito
7. Descontar el saldo del usuario
8. Cambiar estado a `COMPLETADA`
9. Asignar `orderId` y `orderNumber` en la pre-orden
10. Retornar respuesta con `redirectUrl`

---

## 📌 ENDPOINT 3: GET /so-tp/consultar-saldo

### Qué hace el frontend

El frontend llama a este endpoint desde `lib/trimegisto.ts → getTrismegistoBalance()` para mostrar el saldo disponible en el carrito:

```
GET /so-tp/consultar-saldo
Authorization: Bearer {accessToken}
```

### ✅ Respuesta esperada

```json
HTTP 200 OK
{
  "available": 50.00,
  "used": 0.00,
  "pending": 0.00,
  "maxInstallments": 3
}
```

> Si el endpoint retorna una estructura diferente, el frontend no podrá mostrar el saldo y ocultará la opción de pago.

---

## 🔑 Resumen de Puntos Críticos para el Backend

| # | Punto Crítico | Impacto |
|---|---------------|---------|
| 1 | **Link del email debe usar `?token=`** — URL: `/confirmar-pedido-trismegisto?token={token}` | 🔴 CRÍTICO — Sin esto el usuario no puede confirmar |
| 2 | **Respuesta de `initiate` debe tener estructura `{ success, data: { preOrderId, expiresAt } }`** | 🔴 CRÍTICO — Sin esto el frontend no detecta éxito |
| 3 | **Respuesta de `confirm` debe incluir `redirectUrl`** que sea `"checkout"` o la URL completa a `/checkout/success?orderId=...` | 🔴 CRÍTICO — Sin esto el usuario no es redirigido |
| 4 | **Los errores deben retornar un campo `message` con texto en español** legible para el usuario | 🟠 IMPORTANTE — Sin esto se muestran mensajes en inglés |
| 5 | **Token de confirmación debe ser one-time use** — no puede confirmarse dos veces | 🟠 IMPORTANTE — Evita double-charge |
| 6 | **No crear orden hasta `confirm`** — `initiate` solo crea la pre-orden y envía el email | 🟡 DISEÑO — El flujo lo requiere así |
| 7 | **Saldo del usuario se descuenta solo en `confirm`** (no en `initiate`) | 🟡 DISEÑO — Evita reservas sin confirmar |

---

## 🧪 Test Cases para Backend

### Test 1: Flujo normal (happy path)
```
1. POST /initiate con balanceAmount=18.00, installments=2
   → Esperar HTTP 200, success=true, data.preOrderId presente
2. Simular click en link del email con token correcto
   → GET /confirm/{token}
   → Esperar HTTP 200, success=true, redirectUrl presente
```

### Test 2: Token expirado
```
1. POST /initiate → obtener token
2. Forzar expiración del token en BD (o esperar 24h en test)
3. GET /confirm/{token-expirado}
   → Esperar HTTP 400, message en español indicando expiración
```

### Test 3: Doble confirmación
```
1. POST /initiate → obtener token
2. GET /confirm/{token} → primera confirmación exitosa
3. GET /confirm/{token} → segunda confirmación
   → Esperar HTTP 400, message indicando "ya fue procesada"
```

### Test 4: Saldo insuficiente
```
1. POST /initiate con balanceAmount mayor al saldo del usuario
   → Esperar HTTP 400, message indicando saldo insuficiente
```

### Test 5: Token inválido
```
1. GET /confirm/token-inventado-falso
   → Esperar HTTP 404 o HTTP 400, message en español
```

---

## 📅 Fechas y Tiempos

| Parámetro | Valor recomendado |
|-----------|-------------------|
| Expiración del token de email | 24 horas desde `initiate` |
| Zona horaria de `expiresAt` | Incluir offset de Peru: `-05:00` |
| Formato de fecha | ISO 8601 con timezone: `2026-03-10T11:44:37-05:00` |

---

**Documento preparado**: 16 de Marzo, 2026  
**Versión**: 1.0  
**Audiencia**: Equipo de Backend  
**Referencia Frontend**: `lib/cart.ts → initiateTrimegistoPreOrder`, `lib/trimegisto.ts`, `pages/confirmar-pedido-trismegisto.tsx`
