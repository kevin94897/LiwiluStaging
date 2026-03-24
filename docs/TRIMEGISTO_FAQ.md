# ❓ Trimegisto - Preguntas Frecuentes (FAQ)

## Preguntas sobre el Flujo

### P: ¿Cuál es la diferencia entre pre-orden y orden final?
**R**: 
- **Pre-orden**: Temporal, espera confirmación por email, expira en 24h, saldo NO se descuenta
- **Orden final**: Permanente, confirmada, pago procesado, saldo SÍ está descuento

Trimegisto crea PRE-orden en `initiate` y ORDEN FINAL en `confirm`.

---

### P: ¿Por qué se requiere email si el usuario ya está autenticado?
**R**: 
El email es un **canal de confirmación adicional** que:
1. Verifica que el usuario realmente quiere pagar (no es accesible)
2. Proporciona confirmación clara del monto y cuotas
3. Permite al usuario cambiar de opinión (token expira en 24h)
4. Es más seguro que auto-procesar automáticamente

---

### P: ¿Qué pasa si el usuario no confirma en 24 horas?
**R**: 
1. El token expira
2. La pre-orden se marca como `EXPIRADA`
3. Saldo NO fue descuento
4. Usuario debe volver al checkout e intentar nuevamente
5. Se crea una nueva pre-orden con nuevo token

---

### P: ¿Qué pasa si el usuario confirma pero su saldo cambió?
**R**: 
El backend DEBE validar nuevamente en el momento de `confirm`:
```
if (userBalance >= preOrder.balanceAmount) {
  process payment
} else {
  return error: "Balance insuficiente ahora"
}
```

---

### P: ¿Pueden pagarse dos veces con el mismo token?
**R**: 
**NO**. El token es de **one-time use**:
1. Primera confirmación: ✅ Funciona, órdne creada
2. Segunda confirmación: ❌ Error "Ya fue confirmada"

Backend debe marcar token como usado después de primera confirmación.

---

### P: ¿Qué diferencia tiene con 3DS (3D Secure)?
**R**: 
| Aspecto | 3DS | Trimegisto |
|---------|------|-----------|
| **Método** | Tarjeta (Culqi) | Saldo interno |
| **Confirmación** | App del banco | Email link |
| **Tiempo** | 15 minutos | 24 horas |
| **Requiere** | Tarjeta | Saldo disponible |

Son sistemas completamente independientes.

---

### P: ¿El saldo se reserva o se descuenta al hacer initiate?
**R**: 
**Solo se reserva** (no se descuenta):
- POST initiate: Reserva el monto, status PRE-ORDEN
- GET confirm: Descuenta realmente, status ORDEN FINAL

Si expira, el monto se libera automáticamente.

---

## Preguntas Técnicas

### P: ¿Qué pasa si el email service falla?
**R**: 
En el endpoint `POST initiate`:
```
try {
  sendEmail()
} catch (error) {
  // Email falló, pero PRE-ORDEN fue creada
  return error: "Email service failed"
}
```

El usuario debe reintentar. PRE-orden se quedó creada (¿cleanup?).

---

### P: ¿Dónde se valida el token de email?
**R**: 
En el endpoint `GET /orders/trismegisto/confirm/:tokenCorreo`:
```
1. Buscar token en BD
2. Validar no esté expirado:
   if (NOW > expiresAt) return 410 Gone
3. Validar no haya sido usado:
   if (status != PENDIENTE_CONFIRMACION) return 409 Conflict
4. Validar perteneza al usuario autenticado
5. Si todo OK, procesar pago
```

---

### P: ¿Se necesita Culqi para Trimegisto?
**R**: 
**NO**. Trimegisto es completamente independiente:
- Culqi: Para pagos con tarjeta/3DS
- Trimegisto: Para pagos con saldo interno

Solo comparten que ambos son métodos de pago.

---

### P: ¿Cómo se genera el token criptográfico?
**R**: 
Opciones recomendadas:
1. **JWT**: `jwt.sign({ preOrderId, userId, iat }, SECRET, { expiresIn: '24h' })`
2. **HMAC-SHA256**: `crypto.createHmac('sha256', SECRET).update(randomData).digest('hex')`
3. **nanoid**: `nanoid(32)` + guardar en BD con expires_at

**Recomendado**: JWT porque incluye expiracion nativa.

---

### P: ¿Es seguro enviar token en URL?
**R**: 
Depende:
- **HTTPS**: ✅ Seguro (encriptado en tránsito)
- **HTTP**: ❌ Inseguro (visible en texto plano)

Siempre usar HTTPS en producción.

**Consideraciones adicionales**:
- Token visible en history del navegador (pero expirado)
- Token visible en logs del servidor (pero rotado)
- Rate limiting en endpoint para prevenir brute force

---

### P: ¿Qué pasa si el usuario reenvía el email?
**R**: 
Nada específico. Es el mismo link/token:
1. Primer click: ✅ Procesa pago
2. Segundo click (del mismo link): ❌ Error "Ya fue confirmada"

El token está en el BD como usado.

---

### P: ¿Se puede resend el email si no llega?
**R**: 
Debe ser implementado:
```
POST /orders/trismegisto/resend-email/:preOrderId
  └─ Generera nuevo token
  └─ Invalida token anterior
  └─ Envía nuevo email
  └─ Retorna nuevo token (debe guardarse)
```

Recomendado: Máximo 3 resends por PRE-orden.

---

## Preguntas sobre Implementación

### P: ¿Dónde quedan los datos del usuario en el carrito?
**R**: 
En `context/CartContext.tsx`:
```typescript
totals: {
  subtotal: number,
  shipping: number,
  total: number,
  trismegistoBalance?: number,     // Balance disponible
  balanceAmount?: number,          // Monto a usar
  balanceInstallments?: number,    // Cuotas seleccionadas
}
```

---

### P: ¿Debo crear la orden pendiente antes de initiate?
**R**: 
**Depende del diseño**:
- **Opción 1**: Crear pending_order en checkout → guardar ID → enviar a initiate
- **Opción 2**: initiate crea todo (pre-orden y pending_order en uno)

Recomendado: **Opción 1** para separación de concerns.

---

### P: ¿Qué validaciones hacer en frontend vs backend?
**R**: 
```
FRONTEND (UX rápida, prevenir clicks)
├─ balanceAmount > 0
├─ installments en [1,2,3]
├─ balanceAmount <= availableBalance
├─ Datos personales completos
└─ Campo requerido lleno

BACKEND (Seguridad, verdad única)
├─ Usuario existe y autenticado
├─ Pre-orden existe y es del usuario
├─ Token válido y no expirado
├─ Balance >= amount (nuevamente!)
├─ No fue confirmada antes
└─ Pago procesa sin error
```

---

### P: ¿Debo usar una librería para el formulario?
**R**: 
No obligatorio. Liwilu usa:
- Zod para validación (schemas)
- React Hooks para estado
- Componentes custom (Input, Select, Button)

Trimegisto sigue el mismo patrón.

---

### P: ¿Cómo integro TrismegistoPaymentSection en el checkout?
**R**: 
```typescript
// En pages/checkout.tsx
import TrismegistoPaymentSection from '@/components/checkout/TrismegistoPaymentSection';

// En JSX, donde estén otros métodos de pago:
{isAuthenticated && trismegistoBalance && (
  <TrismegistoPaymentSection
    isSelected={selectedPaymentMethod === 'trimegisto'}
    onSelect={() => setSelectedPaymentMethod('trimegisto')}
    totals={totals}
    balanceInfo={trismegistoBalance}
    selectedInstallments={trismegistoInstallments}
    onInstallmentsChange={setTrismegistoInstallments}
  />
)}
```

---

### P: ¿Qué hacer si no tengo el backend listo?
**R**: 
Puedes:
1. **Mock los endpoints**: Usa datos fake en frontend por ahora
2. **Espera el backend**: Implementa frontend y testa con Postman
3. **Coordina timing**: Asegura que backend esté listo antes del merge

Recomendado: Coordinar con equipo backend.

---

## Preguntas sobre Testing

### P: ¿Cómo simular recepción de email?
**R**: 
Opciones:
1. **Stagingmail**: Usa inbox testing service (Mailhog, Mailtrap)
2. **Print token**: En dev, backend imprime token en console/logs
3. **API direct**: Llama directamente `GET /confirm/{{token}}` sin email

Para testing local: **Opción 2** es más rápida.

---

### P: ¿Cómo probar token expirado?
**R**: 
```javascript
// En backend, en dev mode
Token.expiresAt = nowMinusOneDay // Para test rápido
// O
process.env.TOKEN_EXPIRY = '1s' // 1 second para test

// Luego haer sleep y hacer click
```

---

### P: ¿Cómo probar balance insuficiente?
**R**: 
```javascript
// En BD o mock, setear balance menor que total
user.trismegistoBalance = 5.00; // Menos que lo que paga

// Intentar pagar 18.00
// Frontend debe mostrar error
```

---

### P: ¿Qué logs debo ver en console?
**R**: 
```javascript
// Inicio
[Checkout] Loading Trimegisto balance...
[Checkout] Trimegisto balance loaded: {...}

// Usuario confirma
[Trimegisto] Initiating payment: {...}
[Trimegisto] Pre-order created: {...}

// Usuario confirma email
[Trimegisto Confirm] Processing confirmation...
[Trimegisto Confirm] Confirmation successful: {...}

// Auto-redirect
Redirecting to: https://tienda.liwilu.com.pe/checkout/success?orderId=...
```

---

## Preguntas sobre Errores

### P: ¿Por qué recibo "Balance insuficiente" si tengo dinero?
**R**: 
Causas posibles:
1. Balance no se cargó: Verificar console.log `getTrismegistoBalance()`
2. Balance cambió: Otro usuario descuento el dinero
3. Saldo "pending": Dinero en pre-órdenes sin confirmar
4. Bug de cálculo: Verificar `validateTrismegistoPayment()`

---

### P: ¿Por qué no me llega el email?
**R**: 
Causas posibles:
1. **Backend error**: Email service falló (ver logs backend)
2. **SMTP config**: Credenciales incorrectas (verificar variables de ambiente)
3. **Spam folder**: Check carpeta de spam/promotions
4. **Email incorrecto**: User tiene email inválido en cuenta
5. **Rate limit**: Demasiados emails del mismo usuario

---

### P: ¿Por qué el token dice "inválido"?
**R**: 
Causas posibles:
1. **Token modificado**: URL fue alterada
2. **Token expirado**: Más de 24 horas
3. **Token usado**: Ya fue confirmado antes
4. **Token inexistente**: Pre-orden no existe
5. **User mismatch**: Token es de otro usuario

---

### P: ¿Qué significa "Pre-orden no encontrada"?
**R**: 
MongoDB/BD no encontró el registro:
```
GET /confirm/{{token}}
  └─ Backend busca en tabla trimegisto_pre_orders
  └─ No encuentra coincidencia
  └─ Error 404: Pre-orden no encontrada
```

Verificar:
- Token es correcto
- Pre-orden fue creada en `initiate`
- Base de datos está sincronizada

---

## Preguntas sobre Producción

### P: ¿Qué monitorear en producción?
**R**: 
```
Métricas:
├─ % de pre-órdenes confirmadas (goal: >80%)
├─ Tiempo promedio de confirmación
├─ Tasa de expiración (goal: <10%)
├─ Errores más comunes
└─ Revenue processed

Alertas críticas:
├─ Emails no se envían
├─ Tokens no se generan
├─ Pago duplicado
├─ Saldo descuento incorrecto
└─ Pre-orden no se crea
```

---

### P: ¿Cómo rollback si algo falla?
**R**: 
```
PLAN A (sin downtime):
├─ Desactivar opción Trimegisto en frontend
├─ Usuarios existentes siguen usando otros métodos
├─ Investigar error en backend

PLAN B (completo):
├─ Revert commit del backend
├─ Revert commit del frontend
├─ Restaurar DB a backup anterior
├─ Comunicar a usuarios

PLAN C (problemas de pago):
├─ Bloquear confirmaciones (PUT /confirm → disabled)
├─ Revisar logs
├─ Verificar integridad de saldo
├─ Procesar manualmente si es necesario
```

---

### P: ¿Cómo escalar si hay muchos usuarios?
**R**: 
Considerar:
1. **Email ratelimit**: Limitar envíos/segundo
2. **Token generation**: Usar redis para cache de tokens
3. **Database index**: Índices en `confirmation_token`, `user_id`, `status`
4. **Queue**: Procesar confirmaciones en background job
5. **Cache**: Cachear saldo del usuario

---

## Preguntas Misceláneas

### P: ¿Debo avisar al usuario que es método "nuevo"?
**R**: 
Recomendado:
- ✅ Mostrar badge "Nuevo" en opción
- ✅ Incluir help text explicando el flujo
- ✅ Enlace a FAQ o documentación
- ✅ Chat de soporte activo para dudas

---

### P: ¿Puede un comprador usar Trimegisto dos veces en una compra?
**R**: 
Depende del diseño:
- **Opción 1**: Un método de pago por orden (NO divide entre métodos)
- **Opción 2**: Múltiples métodos en una orden (Trimegisto + Tarjeta)

Recomendado: **Opción 1** (más simple, menos bugs).

---

### P: ¿Se integra con el sistema de crédito/deuda?
**R**: 
**NO necesariamente**. Trimegisto es:
- **Débito**: Descuenta saldo existente
- **NO crédito**: No presta dinero (el usuario ya tiene el saldo)

Si Liwilu quiere crédito, es sistema separado.

---

### P: ¿Debo notificar al usuario cuando expira el token?
**R**: 
No obligatorio, pero **recomendado**:
```
Email de recordatorio en:
├─ T+6h: "Tu link expira en 18 horas"
├─ T+23h: "Tu link expira en 1 hora"
```

Implementar email cron job en backend.

---

### P: ¿Cómo manejar multi-currency?
**R**: 
En `balanceAmount`:
```
{
  "balanceAmount": 18.00,   // Monto en soles
  "currency": "PEN",        // Agregar esto
  "installments": 2
}
```

En BD y frontend, incluir `currency` en pre-orden.

---

### P: ¿Puedo cambiar el número de cuotas después de initiate?
**R**: 
**NO recomendado**. El flujo es:
```
1. User elige cuotas en checkout
2. initiate envía cuotas elegidas
3. No cambiar hasta confirm
```

Si quiere cambiar cuotas, debe:
1. Cancelar pre-orden actual
2. Crear nueva pre-orden

---

### P: ¿Qué sucede si backend es muy lento en confirm?
**R**: 
Considera:
```
GET /confirm/{{token}} tarda >10s
├─ Frontend muestra loading
├─ Usuario podría hacer reload
├─ Verificar de-duplicación (no crear orden 2x)
```

Solución: Usar transacción DB + mutex/lock.

---

## Soporte Adicional

Si tu pregunta específica no está aquí:

1. **Consulta documentos:**
   - [TRIMEGISTO_PAYMENT_FLOW.md](TRIMEGISTO_PAYMENT_FLOW.md) - Arquitectura
   - [TRIMEGISTO_IMPLEMENTATION_GUIDE.md](TRIMEGISTO_IMPLEMENTATION_GUIDE.md) - Implementación
   - [TRIMEGISTO_DATABASE_SCHEMA.md](TRIMEGISTO_DATABASE_SCHEMA.md) - BD y APIs

2. **Revisa code examples:**
   - [TRIMEGISTO_CODE_EXAMPLES.md](TRIMEGISTO_CODE_EXAMPLES.md)

3. **Contacta soporte:**
   - Email: soporte@liwilu.com.pe
   - Slack: #trimegisto-dev (si existe)

---

**Última actualización**: 13 de Marzo, 2026
**Versión**: 1.0 Completa

