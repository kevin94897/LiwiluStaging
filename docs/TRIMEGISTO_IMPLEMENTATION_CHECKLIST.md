# Checklist de Implementación - Trimegisto

## Resumen Ejecutivo

El flujo Trimegisto es un método de pago que permite a usuarios comprar usando su saldo en 1-3 cuotas, con confirmación obligatoria por email antes de procesar el pago.

**Documentos relacionados:**
- [TRIMEGISTO_PAYMENT_FLOW.md](TRIMEGISTO_PAYMENT_FLOW.md) - Explicación detallada del flujo
- [TRIMEGISTO_IMPLEMENTATION_GUIDE.md](TRIMEGISTO_IMPLEMENTATION_GUIDE.md) - Guía paso a paso de integración
- [TRIMEGISTO_DATABASE_SCHEMA.md](TRIMEGISTO_DATABASE_SCHEMA.md) - Estructura de datos

---

## ✅ Checklist de Implementación

### FASE 1: Backend (Endpoints)

#### POST `/orders/trismegisto/initiate`
- [ ] Recibe: `balanceAmount`, `installments`, `pendingOrderId` en body
- [ ] Recibe: `Authorization: Bearer {{accessToken}}` en header
- [ ] Valida:
  - [ ] Usuario autenticado
  - [ ] `balanceAmount > 0`
  - [ ] `installments` entre 1-3
  - [ ] Usuario tiene saldo suficiente
  - [ ] `pendingOrderId` existe
- [ ] Crea registro en `trimegisto_pre_orders` tabla
- [ ] Genera token criptográfico único
- [ ] Guarda token con expiracion de 24 horas
- [ ] Envía email con link de confirmación
- [ ] Retorna respuesta con `preOrderId` y `expiresAt`
- [ ] Usa status HTTP 202 (Accepted)

#### GET `/orders/trismegisto/confirm/:tokenCorreo`
- [ ] Extrae token de la URL
- [ ] Valida:
  - [ ] Token existe en DB
  - [ ] Token no ha expirado
  - [ ] Token es para el usuario actual
  - [ ] Pre-orden está en `PENDIENTE_CONFIRMACION`
  - [ ] Pre-orden no fue confirmada antes
- [ ] Cambia estado a `CONFIRMADA`
- [ ] Procesa pago automáticamente:
  - [ ] Descuenta saldo del usuario
  - [ ] Crea ORDEN FINAL con los items
  - [ ] Asigna `order_number`
  - [ ] Asigna `order_id`
- [ ] Cambia estado a `COMPLETADA`
- [ ] Envía email de confirmación de orden
- [ ] Retorna `redirectUrl` apuntando a `/checkout/success?orderId={{orderId}}`
- [ ] Usa status HTTP 200 (OK)

#### GET `/user/trismegisto/balance`
- [ ] Recibe: `Authorization: Bearer {{accessToken}}`
- [ ] Valida usuario autenticado
- [ ] Retorna:
  - [ ] `available`: Saldo disponible
  - [ ] `used`: Saldo usado
  - [ ] `pending`: Saldo en pre-órdenes pendientes
  - [ ] `maxInstallments`: Máx cuotas (3)

#### POST `/orders/trismegisto/cancel/:preOrderId`
- [ ] Recibe: `Authorization: Bearer {{accessToken}}`
- [ ] Valida:
  - [ ] Pre-orden existe
  - [ ] Pre-orden pertenece al usuario
  - [ ] Pre-orden no está completada
- [ ] Cambia estado a `CANCELADA`
- [ ] Registra cancelación en logs
- [ ] Retorna confirmación

---

### FASE 2: Frontend JavaScript

#### lib/trimegisto.ts
- [ ] Función `initiateTrismegistoPayment()`
- [ ] Función `confirmTrismegistoPayment()`
- [ ] Función `getTrismegistoBalance()`
- [ ] Función `cancelTrismegistoPreOrder()`
- [ ] Función `validateTrismegistoPayment()`
- [ ] Función `formatInstallmentDisplay()`
- [ ] Interfaces TypeScript:
  - [ ] `PreOrderStatus`
  - [ ] `PreOrder`
  - [ ] `InitiateTrismegistoRequest`
  - [ ] `InitiateTrismegistoResponse`
  - [ ] `ConfirmTrismegistoResponse`
  - [ ] `TrismegistoBalanceInfo`
- [ ] Logging estructurado con `[Trimegisto]` prefix

#### components/checkout/TrismegistoPaymentSection.tsx
- [ ] Mostrar opción si usuario autenticado
- [ ] Mostrar opción si saldo disponible > 0
- [ ] Radio button para seleccionar método
- [ ] Mostrar saldo disponible
- [ ] Selector de cuotas (1-3)
- [ ] Validación en tiempo real
- [ ] Mostrar monto por cuota
- [ ] Mostrar errores de validación
- [ ] Mostrar información sobre confirmación por email
- [ ] Estilos responsivos

#### pages/checkout.tsx
- [ ] Importar `TrismegistoPaymentSection`
- [ ] Importar funciones de `lib/trimegisto`
- [ ] Agregar estados:
  - [ ] `selectedPaymentMethod`
  - [ ] `trismegistoBalance`
  - [ ] `trismegistoInstallments`
  - [ ] `isLoadingTrismegisto`
- [ ] Efecto para cargar balance:
  - [ ] Validar autenticación
  - [ ] Llamar `getTrismegistoBalance()`
  - [ ] Capturar errores sin romper UI
- [ ] Función `handleTrismegistoConfirm()`:
  - [ ] Validar datos personales
  - [ ] Validar balance
  - [ ] Llamar `initiateTrismegistoPayment()`
  - [ ] Mostrar error si falla
  - [ ] Mostrar éxito si funciona
  - [ ] Limpiar carrito
  - [ ] Guardar pre-orden info en localStorage
  - [ ] Redirigir a página de "pendiente"
- [ ] Integrar el componente en JSX
- [ ] Diferenciar flujo de otros métodos de pago

#### pages/trimegisto-pendiente.tsx
- [ ] Mostrar mensaje de espera
- [ ] Mostrar que revisar email
- [ ] Mostrar que link expira en 24h
- [ ] Botón para ver inbox (abrir Gmail)
- [ ] Botón para volver a inicio
- [ ] Mostrar datos de pre-orden si existen
- [ ] Información de soporte

#### pages/orders/trismegisto/confirm/[token].tsx
- [ ] Extraer token de query paramaters
- [ ] Mostrar loading mientras procesa
- [ ] Llamar `confirmTrismegistoPayment(token)` automáticamente
- [ ] Validar respuesta exitosa
- [ ] Mostrar pantalla de éxito:
  - [ ] Ícono checkmark
  - [ ] Número de orden
  - [ ] Mensaje de éxito
  - [ ] Auto-redirect después de 3 seg
  - [ ] Botón manual para redirigir
- [ ] Mostrar pantalla de error:
  - [ ] Mensaje de error claro
  - [ ] Botón para reintentar desde checkout
  - [ ] Botón para volver a inicio
- [ ] Mostrar pantalla de expiración:
  - [ ] Diferente de error genérico
  - [ ] Opción para reintentar
- [ ] Logging de toda la transición
- [ ] Manejo de errores por tipo

#### lib/cart.ts
- [ ] Actualizar `CartTotals` interface si es necesario
- [ ] Verificar que `trismegistoBalance` y `balanceAmount` existen

---

### FASE 3: Context y Estado Global

#### context/CartContext.tsx
- [ ] Verificar que `trismegistoBalance` está en estado
- [ ] Verificar que `balanceAmount` está en estado
- [ ] Verificar que `balanceInstallments` está en estado
- [ ] Si se sincroniza con backend, que incluya estos campos
- [ ] Limpieza correcta al hacer logout

---

### FASE 4: Componentes UI

#### Componentes Requeridos
- [ ] `ProcessingOverlay` - Ya existe (usado en confirm page)
- [ ] `Button` - Ya existe (verificar variantes)
- [ ] `Input` - Ya existe
- [ ] `Select` - Ya existe
- [ ] Iconos (PiCheckCircleFill, PiXCircleFill, PiInfo, PiMailboxFill)

---

### FASE 5: Estilos y Responsive Design

#### TrismegistoPaymentSection.tsx
- [ ] Desktop: Botón radio al lado del contenido
- [ ] Tablet: Ajustar espacios
- [ ] Mobile: Stack vertical, botón completo
- [ ] Estados hover/focus/disabled
- [ ] Animaciones suaves

#### Pages
- [ ] Toda la página mobile-friendly
- [ ] Overflow handling para contenido largo
- [ ] Buttons accesibles y grandes en mobile

---

### FASE 6: Manejo de Errores

#### Frontend Error Handling
- [ ] Network error (500)
- [ ] Invalid token (400)
- [ ] Token expired (410)
- [ ] Balance insufficient
- [ ] Invalid installments
- [ ] User not authenticated
- [ ] Generic errors
- [ ] Toast messages claros

#### Backend Error Handling
- [ ] Validar ALL inputs
- [ ] Return status codes apropiados:
  - [ ] 200: Success
  - [ ] 202: Accepted (initiate)
  - [ ] 400: Bad request
  - [ ] 401: Unauthorized
  - [ ] 404: Not found
  - [ ] 409: Conflict (already confirmed)
  - [ ] 410: Gone (token expired)
  - [ ] 500: Server error

---

### FASE 7: Seguridad

#### Frontend
- [ ] No exponer tokens en logs de cliente
- [ ] Validar inputs antes de enviar
- [ ] CSRF protection (Next.js automático)
- [ ] HTTPS only en producción
- [ ] LocalStorage sanitization

#### Backend
- [ ] JWT/HMAC token validation
- [ ] Rate limiting en endpoints
- [ ] SQL injection prevention
- [ ] XSS protection en emails
- [ ] Logging de intentos sospechosos
- [ ] Never double-charge en confirmación
- [ ] Transacciones ACID

---

### FASE 8: Testing

#### Unit Tests
- [ ] `validateTrismegistoPayment()` con casos:
  - [ ] Cuotas válidas (1, 2, 3)
  - [ ] Cuotas inválidas (0, 4, -1)
  - [ ] Monto positivo
  - [ ] Monto cero/negativo
  - [ ] Balance suficiente
  - [ ] Balance insuficiente
- [ ] `formatInstallmentDisplay()` con múltiples valores

#### Integration Tests
- [ ] Flujo completo desde checkout hasta éxito
- [ ] Token expirado en confirmación
- [ ] Token inválido en confirmación
- [ ] Confirmación duplicada
- [ ] Balance insuficiente
- [ ] Email no enviado

#### E2E Tests (Selenium/Cypress)
- [ ] Usuario selecciona Trimegisto
- [ ] Usuario completa datos
- [ ] Usuario recibe email
- [ ] Usuario hace click en link
- [ ] Usuario ve página de éxito
- [ ] Email contiene orden correcta

---

### FASE 9: Documentación

- [ ] README con overview
- [ ] PAYMENT_FLOW.md ✓ (completado)
- [ ] IMPLEMENTATION_GUIDE.md ✓ (completado)
- [ ] DATABASE_SCHEMA.md ✓ (completado)
- [ ] API documentation
- [ ] Ejemplos de request/response
- [ ] Troubleshooting guide

---

### FASE 10: Deployment

#### Pre-Deployment Checklist
- [ ] Todos los tests pasan
- [ ] No hay console.errors
- [ ] Logging estructurado en lugar
- [ ] Variables de ambiente configuradas
- [ ] Email service funcionando
- [ ] Base de datos migrada
- [ ] Endpoints de backend listados

#### Deployment Steps
- [ ] Deploy backend primero
- [ ] Test endpoints con Postman
- [ ] Deploy frontend
- [ ] Test flujo completo en staging
- [ ] Monitor logs en producción
- [ ] Tener plan de rollback

#### Post-Deployment
- [ ] Monitoreo de errores
- [ ] Alertas configuradas
- [ ] Logs centralizados
- [ ] Métricas de uso
- [ ] Feedback de usuarios

---

## 📊 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     pages/checkout.tsx                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │         TrismegistoPaymentSection Component             ││
│  │ - Mostrar saldo disponible                              ││
│  │ - Selector de cuotas                                    ││
│  │ - Validación en tiempo real                             ││
│  └─────────────────────────────────────────────────────────┘│
│                         ↓                                    │
│              initiateTrismegistoPayment()                    │
│              (lib/trimegisto.ts)                             │
│                         ↓                                    │
│          POST /orders/trismegisto/initiate                   │
│          (Backend API)                                       │
│                         ↓                                    │
│           Email enviado a usuario con link                  │
│    https://.../orders/trismegisto/confirm/{{token}}        │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │         pages/trimegisto-pendiente.tsx                  ││
│  │ - Mostrar mensaje de espera                             ││
│  │ - Instrucciones para revisar email                      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

                         ↓

┌─────────────────────────────────────────────────────────────┐
│       Usuario recibe email y hace click en link             │
│                         ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  pages/orders/trismegisto/confirm/[token].tsx           ││
│  │  - Extrae token de URL                                  ││
│  │  - Llamar confirmTrismegistoPayment(token)              ││
│  │  - Mostrar loading...                                   ││
│  └─────────────────────────────────────────────────────────┘│
│                         ↓                                    │
│        GET /orders/trismegisto/confirm/{{token}}            │
│        (Backend API)                                         │
│                         ↓                                    │
│     Backend procesa pago automáticamente                    │
│     - Valida token                                          │
│     - Descuenta saldo                                       │
│     - Crea orden final                                      │
│                         ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │         /checkout/success?orderId=XXX                   ││
│  │  - Mostrar número de orden                              ││
│  │  - Detalles de compra                                   ││
│  │  - Información de envío                                 ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos (Resumen)

```
FRONTEND                          BACKEND
│                                  │
├─ User en checkout                │
│   ├─ Selecciona Trimegisto       │
│   ├─ Ingresa datos personales    │
│   └─ Click Confirmar Compra      │
│                                  │
├─ POST /init                  ──→ │
│   { balanceAmount, ...}          │
│                                  │
│  ← ─ ─ Response (preOrderId) ─ ┤
│                                  │
├─ localStorage.setItem(...)       │
├─ clearCart()                     │
├─ router.push('/pendiente')       │
│                                  │
│  Usuario recibe EMAIL            │
│  Usuario hace click en LINK      │
│                                  │
├─ pages/confirm/[token]           │
│   ├─ Extrae token                │
│   └─ GET /confirm/{{token}}  ──→ │
│                                  ├─ Valida token
│                                  ├─ Descuenta saldo
│                                  ├─ Crea orden
│      ← Response (redirectUrl)─ ┤
│                                  │
├─ window.location.href = URL      │
├─ pages/checkout/success          │
│   └─ Muestra orden exitosa       │
```

---

## 🎯 Orden Recomendado de Implementación

1. **Backend endpoints** (POST initiate, GET confirm, GET balance)
2. **lib/trimegisto.ts** (funciones frontend)
3. **TrismegistoPaymentSection.tsx** (componente)
4. **pages/trimegisto-pendiente.tsx** (página de espera)
5. **pages/orders/trismegisto/confirm/[token].tsx** (confirmación)
6. **Integración en pages/checkout.tsx**
7. **Testing completo**
8. **Deployment**

---

## 📝 Notas Importantes

### Diferencia con otros métodos de pago
- **Card/Async**: Crea orden pendiente en backend, luego paga
- **Trimegisto**: No crea orden hasta confirmación por email

### Flujo de Pre-Orden
```
Checkout (User) 
    ↓
initiate() → crea PRE-ORDEN (no orden final)
    ↓
Email enviado → Usuario confirma
    ↓
confirm() → Crea ORDEN FINAL y procesa pago
```

### Seguridad
- El token de email es crítico → Usar criptografía fuerte
- One-time use → Invalidar después de usar
- Validar origen en CORS
- Rate limiting en todos los endpoints

### Edge Cases
- ¿Qué pasa si expira la sesión? → User vuelve a checkout
- ¿Qué pasa si balance cambia? → Validar nuevamente en confirm
- ¿Qué pasa si email no llega? → Resend button en pendiente
- ¿Qué pasa si token se manipula? → Error claro, reintentar

