# Guía: Habilitar Selección de Pago en Modal Culqi (Flow V4)

Para que el modal de Culqi muestre las opciones de pago (Yape, Billetera, PagoEfectivo, etc.) y **permita al usuario elegir**, se requiere cambiar la lógica actual del backend.

---

## 🛑 El Problema Actual

Actualmente, cuando el usuario hace clic en "Yape/Otros", el frontend llama a:
`POST /payments/orders/:id/create-async-order`

Este endpoint en tu backend hace **dos cosas al mismo tiempo**:
1.  Crea la orden en Culqi.
2.  **Genera inmediatamente el código QR o CIP**.

Al generar el QR/CIP, Culqi considera que la orden ya está "en proceso" con un método específico. Por eso, si intentamos abrir el modal con ese `orderId`, Culqi dice: *"Esta orden ya fue procesada, no puedo mostrarte opciones para elegir."*

---

## ✅ La Solución Requerida

Para que el modal funcione como selector, el proceso debe dividirse en dos pasos claros: **Crear** (sin definir método) y **Confirmar** (después de que el usuario elija en el modal).

### 1. Nuevo Endpoint en Backend: `create-culqi-order`

Necesitas un endpoint que solo **cree la intención de pago** en Culqi pero **NO** genere el QR/CIP todavía.

-   **Endpoint sugerido**: `POST /payments/orders/:id/create-culqi-order`
-   **Acción**: Llamar a la API de Culqi (`POST /orders`) con los detalles de la compra.
-   **IMPORTANTE**: No debe llamar a ningún endpoint de confirmación ni generar CIP.
-   **Respuesta**: Debe devolver el `culqiOrderId` (ej: `ord_test_ABC123`).

### 2. Flujo en el Frontend

Una vez que tengas ese endpoint, el frontend haría esto:

1.  Llama a `create-culqi-order`.
2.  Recibe `ord_test_ABC123`.
3.  Abre el modal de Culqi con ese ID:
    ```javascript
    window.Culqi.settings({ order: 'ord_test_ABC123' });
    window.Culqi.open();
    ```
4.  **El usuario ve las opciones en el modal** (Yape, Billetera, etc.).
5.  El usuario elige una opción (ej: Yape).
6.  Culqi cierra el modal y devuelve un objeto `order`.

### 3. Ajuste en Backend: Confirmación/Consulta

Después de que el usuario elige en el modal, Culqi ya habrá asociado el método de pago a la orden. Tu backend necesita un endpoint para **consultar el estado final** y obtener el QR o CIP que Culqi generó.

-   **Endpoint actual**: `GET /payments/pending-orders/:id/async-status`
-   **Ajuste**: Este endpoint debe consultar a Culqi (`GET /orders/{id}`) para ver qué método eligió el usuario y devolver el `qr` o `payment_code` correspondiente.

---

## Resumen Técnico para Backend Developer

**Lo que tenemos ahora (Incompatible con Modal):**
-   `create-async-order` -> Crea Orden + Genera QR/CIP (Todo en uno).

**Lo que necesitamos (Compatible con Modal):**
1.  `create-culqi-order` -> Solo crea la Orden en Culqi (Devuelve [id](file:///Users/kevingomezlazaro/Local%20Sites/liwilu/app/public/wp-content/themes/liwilu-theme/pages/checkout.tsx#381-422)).
2.  El Frontend abre el modal con ese [id](file:///Users/kevingomezlazaro/Local%20Sites/liwilu/app/public/wp-content/themes/liwilu-theme/pages/checkout.tsx#381-422).
3.  El Usuario elige método en el modal -> Culqi actualiza la orden internamente.
4.  `get-async-status` -> Consulta la orden a Culqi y devuelve el QR o CIP generado.

---

### Ejemplo de Respuesta del Nuevo Endpoint

**Request**: `POST /payments/orders/100/create-culqi-order`
**Response**:
```json
{
    "success": true,
    "data": {
        "culqiOrderId": "ord_test_live_HIJ456",
        "amount": 10000,
        "expiration_date": 1740000000
    }
}
```
*(Nota: No devuelve `qr` ni `paymentCode` porque el usuario aún no ha elegido).*
