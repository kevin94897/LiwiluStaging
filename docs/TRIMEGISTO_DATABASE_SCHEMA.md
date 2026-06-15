# Estructura de Datos - Trimegisto Pre-Orden

## Diseño de Base de Datos (Backend)

### Tabla: `trimegisto_pre_orders`

```sql
CREATE TABLE trimegisto_pre_orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  
  -- Identificadores
  pre_order_id VARCHAR(50) UNIQUE NOT NULL,  -- Ej: "PRE-476-TRIMEGISTO"
  user_id BIGINT NOT NULL,
  pending_order_id BIGINT NOT NULL,
  
  -- Información de Pago
  balance_amount DECIMAL(10, 2) NOT NULL,
  installments INT NOT NULL CHECK (installments >= 1 AND installments <= 3),
  per_installment_amount DECIMAL(10, 2) GENERATED ALWAYS AS (balance_amount / installments) STORED,
  
  -- Confirmación por Email
  confirmation_token VARCHAR(255) UNIQUE NOT NULL,  -- Token criptográfico
  confirmation_token_expires_at TIMESTAMP NOT NULL,
  email_sent_at TIMESTAMP NOT NULL,
  
  -- Estados
  status ENUM(
    'PENDIENTE_CONFIRMACION',
    'CONFIRMADA',
    'COMPLETADA',
    'EXPIRADA',
    'CANCELADA'
  ) NOT NULL DEFAULT 'PENDIENTE_CONFIRMACION',
  
  confirmed_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  
  -- Información de Orden Creada
  order_id BIGINT NULL,  -- Se asigna cuando se completa el pago
  order_number VARCHAR(50) NULL,  -- Ej: "LW260313-0005"
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (pending_order_id) REFERENCES pending_orders(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  INDEX idx_user_id (user_id),
  INDEX idx_pending_order_id (pending_order_id),
  INDEX idx_status (status),
  INDEX idx_confirmation_token (confirmation_token),
  INDEX idx_created_at (created_at)
);
```

---

## Flujo de Transición de Estados

```
┌──────────────────────────────┐
│ PENDIENTE_CONFIRMACION       │
│ (Email enviado, espera click)│
└───────────────┬──────────────┘
                │
         [Usuario hace click]
                │
                ↓
    ┌───────────────────────────┐
    │ CONFIRMADA                │
    │ (Token validado)          │
    │ (Procesando pago)         │
    └───────────┬───────────────┘
                │
         [Pago aprobado]
                │
                ↓
    ┌───────────────────────────┐
    │ COMPLETADA                │
    │ (Orden creada)            │
    │ (Pago procesado)          │
    └───────────────────────────┘


ALTERNATIVAS (Errores):

┌──────────────────────────────┐
│ PENDIENTE_CONFIRMACION       │    Si pasa 24 horas sin confirmar
└───────────────┬──────────────┘
                │
                ↓
    ┌───────────────────────────┐
    │ EXPIRADA                  │
    │ (Token expiró)            │
    └───────────────────────────┘


┌──────────────────────────────┐
│ Cualquier estado             │    Si usuario cancela
└───────────────┬──────────────┘
                │
                ↓
    ┌───────────────────────────┐
    │ CANCELADA                 │
    │ (Usuario canceló)         │
    └───────────────────────────┘
```

---

## Ejemplo de Registro en Base de Datos

```json
{
  "id": 128,
  "pre_order_id": "PRE-476-TRIMEGISTO",
  "user_id": 42,
  "pending_order_id": 476,
  
  "balance_amount": 18.00,
  "installments": 2,
  "per_installment_amount": 9.00,
  
  "confirmation_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "confirmation_token_expires_at": "2026-03-14T12:45:30Z",
  "email_sent_at": "2026-03-13T12:45:30Z",
  
  "status": "PENDIENTE_CONFIRMACION",
  "confirmed_at": null,
  "completed_at": null,
  "cancelled_at": null,
  
  "order_id": null,
  "order_number": null,
  
  "created_at": "2026-03-13T12:45:30Z",
  "updated_at": "2026-03-13T12:45:30Z"
}
```

---

## Timeline de Ejemplo

```
T=0:00   - Usuario inicia compra con Trimegisto
          - Monto: S/. 18.00
          - Cuotas: 2

T=0:02   - Usuario hace POST /orders/trismegisto/initiate
          - Backend crea PRE-ORDER con status PENDIENTE_CONFIRMACION
          - Genera token criptográfico
          - Envía email con link: https://.../confirm/{{token}}

T=0:05   - Usuario recibe email

T=0:15   - Usuario hace click en link del email
          - URL: https://liwilu-dev.up.railway.app/orders/trismegisto/confirm/{{token}}
          - Token GET desde URL: /confirm/eyJhbGciOi...

T=0:16   - Frontend llama confirmTrismegistoPayment(token)
          - Backend valida token
          - Estado cambia a CONFIRMADA

T=0:17   - Backend procesa pago automáticamente
          - Usa saldo del usuario
          - Crea ORDEN FINAL
          - Estado cambia a COMPLETADA
          - Asigna order_id y order_number

T=0:18   - Backend devuelve redirectUrl
          - Frontend redirige a /checkout/success?orderId=2000208

T=0:20   - Usuario ve página de éxito con detalles del pedido
```

---

## Campos Críticos para Validación

### En Initiate (POST /orders/trismegisto/initiate)

```typescript
interface ValidateInitiateRequest {
  // ✓ Debe ser positivo
  balanceAmount: number;
  
  // ✓ Debe estar entre 1-3
  installments: number;
  
  // ✓ Debe existir una pending_order con este ID
  pendingOrderId: number;
  
  // ✓ Usuario debe tener balance >= balanceAmount
  userBalance: number;
  
  // ✓ Usuario debe estar autenticado
  userId: number;
}
```

### En Confirm (GET /orders/trismegisto/confirm/[token])

```typescript
interface ValidateConfirmRequest {
  // ✓ Token debe ser válido y sin expirar
  token: string;
  
  // ✓ Pre-orden debe estar en estado PENDIENTE_CONFIRMACION
  preOrderStatus: PreOrderStatus;
  
  // ✓ Token debe coincidir en DB
  confirmationToken: string;
  
  // ✓ Token no debe haber sido usado antes
  neverConfirmedBefore: boolean;
  
  // ✓ User debe ser el mismo que creó la pre-orden
  userId: number;
}
```

---

## Respuestas Esperadas del Backend

### Initiate Success (202 Accepted)
```json
{
  "success": true,
  "preOrderId": "PRE-476-TRIMEGISTO",
  "message": "Email de confirmación enviado. Por favor verifica tu correo.",
  "expiresAt": "2026-03-14T12:45:30Z"
}
```

### Initiate Error - Balance Insuficiente (400)
```json
{
  "success": false,
  "error": "BALANCE_INSUFFICIENT",
  "message": "Saldo insuficiente. Disponible: S/. 10.00, Solicitado: S/. 18.00"
}
```

### Confirm Success (200)
```json
{
  "success": true,
  "autoProcessed": true,
  "orderNumber": "LW260313-0005",
  "message": "¡Compra exitosa! Tu pedido ha sido procesado automáticamente usando tu saldo.",
  "orderId": 2000208,
  "redirectUrl": "https://tienda.liwilu.com.pe/checkout/success?orderId=2000208"
}
```

### Confirm Error - Token Expirado (410)
```json
{
  "success": false,
  "error": "TOKEN_EXPIRED",
  "message": "El link de confirmación ha expirado. Por favor intenta nuevamente desde el checkout."
}
```

### Confirm Error - Token Inválido (400)
```json
{
  "success": false,
  "error": "TOKEN_INVALID",
  "message": "Token inválido o manipulado"
}
```

### Confirm Error - Ya Confirmada (409)
```json
{
  "success": false,
  "error": "ALREADY_CONFIRMED",
  "message": "Esta pre-orden ya fue confirmada. Tu orden es: LW260313-0005"
}
```

---

## Logs Recomendados

### En Backend (Initiate)
```
[2026-03-13T12:45:30Z] INFO  [TRIMEGISTO] Pre-order created
  - preOrderId: PRE-476-TRIMEGISTO
  - userId: 42
  - balanceAmount: 18.00
  - installments: 2
  - email: user@example.com

[2026-03-13T12:45:31Z] INFO  [EMAIL] Confirmation email sent
  - to: user@example.com
  - token: eyJhbGciOi... (short)
  - expiresAt: 2026-03-14T12:45:30Z
```

### En Backend (Confirm)
```
[2026-03-13T12:46:15Z] INFO  [TRIMEGISTO] Confirmation initiated
  - token: eyJhbGciOi... (short)
  - preOrderId: PRE-476-TRIMEGISTO
  - userId: 42

[2026-03-13T12:46:16Z] INFO  [TRIMEGISTO] Payment processed
  - orderId: 2000208
  - orderNumber: LW260313-0005
  - balanceAmount: 18.00
  - status: COMPLETADA

[2026-03-13T12:46:17Z] INFO  [EMAIL] Order confirmation email sent
  - to: user@example.com
  - orderNumber: LW260313-0005
```

### En Frontend

```
[2026-03-13T12:45:30Z] LOG [TRIMEGISTO] Initiating payment
  - total: 18.00
  - installments: 2
  - cartId: SESSION_ID_123

[2026-03-13T12:46:15Z] LOG [TRIMEGISTO_CONFIRM] Processing confirmation
  - token: eyJhbGciOi... (short)

[2026-03-13T12:46:18Z] LOG [TRIMEGISTO_CONFIRM] Confirmation successful
  - orderNumber: LW260313-0005
  - redirectUrl: https://tienda.liwilu.com.pe/checkout/success?orderId=2000208
```

---

## Consideraciones de Seguridad

### Token Criptográfico
- **Tipo**: JWT o HMAC-SHA256
- **Longitud mínima**: 256 bits
- **Tiempo de expiración**: 24 horas
- **One-time use**: Invalidar después de primera confirmación

### Validación
- Validar origen (CORS)
- Rate limiting: Max 5 intentos fallidos por token
- Logging de todos los intentos
- Alertas de intentos sospechosos

### Transacciones
- Usar DATABASE TRANSACTIONS para Initiate
- Usar DATABASE TRANSACTIONS para Confirm
- Rollback en caso de error

---

## Monitoreo y Alertas

### Métricas a Rastrear
```
- Cuentas de pre-órdenes por estado (hora)
- Tasa de conversión: PENDIENTE_CONFIRMACION → COMPLETADA
- Tiempo promedio para confirmación
- Monto total procesado
- Errores y sus tipos
```

### Alertas Críticas
```
- Pre-orden creada pero email no enviado
- Muchos tokens expirados sin confirmación
- Intentos de manipulación de token
- Fallos en procesamiento de pago
- Duplicación de órdenes
```

