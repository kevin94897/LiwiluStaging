# Requerimientos del Backend para Culqi v4

## Problema Actual

El error `CNP0183` ("Esta orden no puede ser confirmada porque se encuentra en un estado diferente de creación") ocurre porque el backend está **procesando/confirmando** la orden de Culqi cuando solo debería **crearla**.

---

## Flujos de Pago con Culqi v4

### Flujo 1: Pago con Tarjeta

**Frontend:**

```
1. Usuario elige "Tarjeta"
2. Crear orden pendiente → POST /orders
3. Abrir modal de Culqi SIN orderId
4. Usuario ingresa datos de tarjeta
5. Culqi devuelve TOKEN
6. Enviar token al backend → POST /payments/orders/:id/pay
```

**Backend necesita:**

- ✅ `POST /orders` - Ya existe
- ✅ `POST /payments/orders/:id/pay` - Ya existe

**No requiere cambios.**

---

### Flujo 2: Pagos Asíncronos (Yape, Billetera, PagoEfectivo)

#### Opción A: Modal de Culqi (RECOMENDADO)

Usuario elige método **dentro del modal de Culqi**.

**Frontend:**

```
1. Usuario elige "Yape/Billetera/PagoEfectivo"
2. Crear orden pendiente → POST /orders
3. Crear orden en Culqi → POST /payments/orders/:id/create-culqi-order
4. Abrir modal de Culqi con orderId
5. Usuario elige método en el modal (Yape, Billetera, etc.)
6. Culqi procesa y devuelve ORDER object
7. Frontend maneja callback y redirige a /pago-pendiente
8. Página muestra QR/CIP consultando status
9. Polling verifica pago → GET /payments/pending-orders/:id/async-status
```

**Backend necesita crear NUEVO endpoint:**

```typescript
// NUEVO ENDPOINT REQUERIDO
POST /payments/orders/:id/create-culqi-order

Request Body:
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Orden de Culqi creada",
  "data": {
    "culqiOrderId": "ord_test_ABC123"  // SOLO el ID
  }
}
```

**IMPORTANTE**: Este endpoint debe:

- ✅ Crear la orden en Culqi v4 usando `/orders`
- ✅ Devolver SOLO el `culqiOrderId`
- ❌ NO debe llamar a `/orders/:id/confirm`
- ❌ NO debe generar QR ni CIP
- ❌ NO debe procesar la orden

**Ejemplo de implementación en el backend:**

```javascript
// Backend - Crear orden SIN procesar
app.post("/payments/orders/:id/create-culqi-order", async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  // 1. Obtener orden pendiente
  const order = await getPendingOrder(id);

  // 2. Crear orden en Culqi (SIN confirmar)
  const culqiOrder = await fetch("https://api.culqi.com/v2/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CULQI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: order.total,
      currency_code: "PEN",
      description: `Pedido ${id}`,
      client_details: {
        email: email,
      },
      // NO incluir expiration_date ni confirmar
    }),
  }).then((r) => r.json());

  // 3. Guardar culqiOrderId en la orden pendiente
  await updatePendingOrder(id, {
    culqiOrderId: culqiOrder.id,
  });

  // 4. Devolver SOLO el ID (NO procesar)
  res.json({
    success: true,
    data: {
      culqiOrderId: culqiOrder.id,
    },
  });
});
```

**Luego modificar el endpoint de status:**

```javascript
// Backend - Consultar status de orden asíncrona
GET /payments/pending-orders/:id/async-status

Response:
{
  "success": true,
  "data": {
    "status": "waiting" | "paid" | "expired",
    "pendingOrderId": 123,
    "culqiOrderId": "ord_test_ABC",
    "qr": "https://...",        // Si disponible
    "paymentCode": "123456",    // Si disponible
    "paymentMethod": "qr" | "pagoefectivo",
    "orderId": 456              // Solo si status = "paid"
  }
}
```

Este endpoint debe:

- ✅ Consultar el estado de la orden en Culqi
- ✅ Si la orden fue confirmada por Culqi (usuario pagó), devolver QR/CIP
- ✅ Si el pago fue completado, crear orden final y devolver `orderId`

---

#### Opción B: Redirección Directa (ACTUAL)

Usuario **NO ve modal**, se redirige directo a página con QR/CIP.

**Frontend:**

```
1. Usuario elige "Yape/Billetera/PagoEfectivo"
2. Crear orden pendiente → POST /orders
3. Crear orden en Culqi Y generar QR/CIP → POST /payments/orders/:id/create-async-order
4. Redirigir DIRECTO a /pago-pendiente (sin modal)
5. Mostrar QR/CIP inmediatamente
6. Polling → GET /payments/pending-orders/:id/async-status
```

**Backend:**

- ✅ `POST /payments/orders/:id/create-async-order` - Ya existe y funciona
- ✅ Genera QR/CIP inmediatamente
- ✅ Devuelve datos completos

**No requiere cambios**, pero el usuario NO puede elegir el método en un modal.

---

## Recomendación

**Para dos botones separados (Tarjeta vs Async):**

- Usa **Opción B** (actual, funciona bien, no requiere cambios)

**Para "un solo modal" donde usuario elige todo:**

- No es posible con Culqi v4 (limitación técnica)
- Requiere Opción C del análisis anterior (pre-modal custom)

**Para modal de Culqi con métodos async:**

- Usa **Opción A** (requiere nuevo endpoint en backend)

---

## Resumen de Cambios Requeridos

### Si quieres modal de Culqi (Opción A):

1. **Backend debe crear:**

   ```
   POST /payments/orders/:id/create-culqi-order
   ```

   - Crea orden en Culqi SIN confirmar
   - Devuelve solo `culqiOrderId`

2. **Backend debe modificar:**

   ```
   GET /payments/pending-orders/:id/async-status
   ```

   - Consultar Culqi para obtener QR/CIP después de que usuario elija
   - Devolver datos de pago

3. **Frontend llama:**
   - `create-culqi-order` → abre modal → callback maneja redirección

### Si mantienes redirección directa (Opción B):

- ✅ No requiere cambios en backend
- ✅ Frontend NO abre modal, redirige directo
- ✅ Ya está funcionando

---

## Conclusión

El error CNP0183 ocurre porque estás mezclando ambos flujos:

- Backend genera QR (Opción B)
- Frontend intenta abrir modal (Opción A)

**Debes elegir UNO:**

- Opción A: Modal → Requiere nuevo endpoint
- Opción B: Redirección directa → Ya funciona, no cambies nada
