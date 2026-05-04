# Guía de Integración de Trimegisto en Checkout

## Resumen
Esta guía describe cómo integrar el flujo de pagos Trimegisto en la página de checkout existente.

---

## 1. Imports Necesarios

En `pages/checkout.tsx`, agregar los siguientes imports:

```typescript
import {
  initiateTrismegistoPayment,
  getTrismegistoBalance,
  validateTrismegistoPayment,
  TrismegistoBalanceInfo,
} from '@/lib/trimegisto';
import TrismegistoPaymentSection from '@/components/checkout/TrismegistoPaymentSection';
```

---

## 2. Estados Necesarios

Agregar estos estados en el componente `Checkout`:

```typescript
// Estados para Trimegisto
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'async' | 'trimegisto' | null>(null);
const [trismegistoBalance, setTrismegistoBalance] = useState<TrismegistoBalanceInfo | null>(null);
const [trismegistoInstallments, setTrismegistoInstallments] = useState<number>(1);
const [isLoadingTrismegisto, setIsLoadingTrismegisto] = useState(false);
```

---

## 3. Effect para Cargar Balance Trimegisto

Al componente, agregar este efecto que carga el balance del usuario:

```typescript
useEffect(() => {
  if (isAuthenticated && user) {
    // Cargar balance trimegisto
    const loadTrismegistoBalance = async () => {
      try {
        const balance = await getTrismegistoBalance();
        setTrismegistoBalance(balance);
        logger.log('Trimegisto balance loaded:', balance);
      } catch (error) {
        logger.error('Failed to load Trimegisto balance:', error);
        // No mostrar error si se fallace cargar, solo no mostrar la opción
      }
    };

    loadTrismegistoBalance();
  }
}, [isAuthenticated, user]);
```

---

## 4. Validación de Formulario Trimegisto

Antes de enviar la confirmación, validar:

```typescript
const validateTrismegistoForm = (): boolean => {
  // Validar datos personales (igual que otros métodos de pago)
  if (!datosBoleta.numeroDocumento || !datosBoleta.nombres) {
    showToast('Por favor completa los datos personales', 'error');
    return false;
  }

  // Validar balance trimegisto
  if (!trismegistoBalance) {
    showToast('No se pudo validar tu saldo. Intenta nuevamente.', 'error');
    return false;
  }

  const validation = validateTrismegistoPayment(
    totals.total,
    trismegistoInstallments,
    trismegistoBalance.available,
  );

  if (!validation.valid) {
    showToast(validation.error || 'Validación fallida', 'error');
    return false;
  }

  return true;
};
```

---

## 5. Handler para Confirmar Compra (Trimegisto)

Función que se ejecuta cuando el usuario hace click en "Confirmar compra" con Trimegisto:

```typescript
const handleTrismegistoConfirm = async () => {
  try {
    // Validar formulario
    if (!validateTrismegistoForm()) {
      return;
    }

    setIsLoadingTrismegisto(true);
    logger.log('[Trimegisto] Initiating payment', {
      total: totals.total,
      installments: trismegistoInstallments,
      cartId: cartId,
    });

    // 1. CREAR LA PRE-ORDEN EN EL BACKEND
    const response = await initiateTrismegistoPayment(
      totals.total,
      trismegistoInstallments,
      pendingOrderId, // ID de la orden pendiente creada en checkout
    );

    if (response.success) {
      logger.log('[Trimegisto] Pre-order created:', response.preOrderId);
      
      // 2. MOSTRAR MENSAJE DE CONFIRMACIÓN
      showToast(
        'Se ha enviado un email de confirmación. Por favor revisa tu bandeja de entrada.',
        'success',
      );

      // 3. GUARDAR INFO EN LOCALSTORAGE POR SI EL USUARIO RECARGA
      localStorage.setItem(
        'liwilu_pending_trismegisto',
        JSON.stringify({
          preOrderId: response.preOrderId,
          expiresAt: response.expiresAt,
          timestamp: new Date().toISOString(),
        }),
      );

      // 4. LIMPIAR CARRITO
      clearCart();

      // 5. REDIRIGIR A PÁGINA DE ESPERA O INFORMACIÓN
      showToast('Redirigiendo a página de confirmación...', 'info');
      setTimeout(() => {
        router.push('/trimegisto-pendiente');
      }, 2000);
    } else {
      showToast(
        response.error || 'Error al iniciar el pago. Intenta nuevamente.',
        'error',
      );
    }
  } catch (error: any) {
    logger.error('[Trimegisto] Error initiating payment:', error);
    showToast(error.message || 'Error al procesar la compra', 'error');
  } finally {
    setIsLoadingTrismegisto(false);
  }
};
```

---

## 6. Añadir el Componente en el JSX del Checkout

En la sección de selección de método de pago, añadir:

```typescript
{/* TRIMEGISTO PAYMENT OPTION */}
{isAuthenticated && trismegistoBalance && trismegistoBalance.available > 0 && (
  <TrismegistoPaymentSection
    isSelected={selectedPaymentMethod === 'trimegisto'}
    onSelect={() => setSelectedPaymentMethod('trimegisto')}
    totals={totals}
    balanceInfo={trismegistoBalance}
    selectedInstallments={trismegistoInstallments}
    onInstallmentsChange={setTrismegistoInstallments}
    isLoading={isLoadingTrismegisto}
  />
)}
```

---

## 7. No Crear Orden Pendiente para Trimegisto

**IMPORTANTE:** Para Trimegisto, la pre-orden se crea directamente en el endpoint `/orders/trismegisto/initiate`.

En el handler de "Confirmar Compra", dependiendo del método seleccionado:

```typescript
const handleConfirmOrder = async () => {
  if (selectedPaymentMethod === 'trimegisto') {
    // No crear orden pendiente aquí
    // La pre-orden se crea en handleTrismegistoConfirm
    await handleTrismegistoConfirm();
    return;
  }

  // Para otros métodos (card, async), crear la orden pendiente normalmente
  if (selectedPaymentMethod === 'card' || selectedPaymentMethod === 'async') {
    // ... lógica existente para crear orden pendiente
  }
};
```

---

## 8. Página de Información Trimegisto Pendiente

Crear `pages/trimegisto-pendiente.tsx` para informar al usuario:

```typescript
// pages/trimegisto-pendiente.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { PiMailboxFill } from "react-icons/pi";

export default function TrismegistoPendiente() {
  const router = useRouter();
  const [preOrderData, setPreOrderData] = useState<any>(null);

  useEffect(() => {
    // Cargar datos de la pre-orden pendiente
    const data = localStorage.getItem('liwilu_pending_trismegisto');
    if (data) {
      setPreOrderData(JSON.parse(data));
    }
  }, []);

  return (
    <Layout title="Confirmación Pendiente" description="Completa tu compra por email">
      <div className="flex items-center justify-center px-8 py-24">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-12 text-center">
          {/* Icon */}
          <PiMailboxFill className="w-16 h-16 text-primary-light mx-auto mb-6" />

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-semibold text-primary-dark mb-4">
            Confirmación Pendiente
          </h1>

          {/* Message */}
          <p className="text-gray-600 text-lg mb-6">
            Hemos enviado un correo de confirmación a tu email registrado.
          </p>
          <p className="text-gray-500 text-base mb-8">
            Haz click en el enlace del correo para completar tu compra.
            <br />
            El enlace es válido por <strong>24 horas</strong>.
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-sm">
            <p className="text-blue-900">
              ✓ Una vez confirmes, tu pedido será procesado automáticamente
            </p>
            <p className="text-blue-900 mt-2">
              ✓ Recibirás un correo de confirmación con tu número de pedido
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              size="md"
              className="w-full"
              onClick={() => router.push('/')}
            >
              Volver al Inicio
            </Button>
            <button
              onClick={() => window.location.href = 'https://mail.google.com'}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Abrir Gmail
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              ¿No recibes el correo? Revisa tu carpeta de spam o contáctanos a:
              <br />
              <span className="font-semibold text-primary-dark">soporte@liwilu.com.pe</span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

---

## 9. Manejo de Confirmación por Email (Ya Implementado)

La confirmación se maneja automáticamente en:
```
pages/orders/trismegisto/confirm/[token].tsx
```

Este archivo:
1. Captura el token de la URL
2. Llama a `confirmTrismegistoPayment(token)`
3. Muestra loading mientras se procesa
4. Redirige a la página de éxito con el `redirectUrl`

---

## 10. Flujo Completo (Resumen)

```
1. Usuario en checkout selecciona Trimegisto
   ↓
2. Valida balance disponible
   ↓
3. Completa datos personales
   ↓
4. Click en "Confirmar Compra"
   ↓
5. Llama initiateTrismegistoPayment()
   ↓
6. Backend crea pre-orden y envía email
   ↓
7. Usuario ve mensaj confirmación
   ↓
8. Usuario recibe email con link
   ↓
9. Usuario hace click en link
   ↓
10. Abre /orders/trismegisto/confirm/[token]
   ↓
11. Frontend llama confirmTrismegistoPayment(token)
   ↓
12. Backend procesa pago automáticamente
   ↓
13. Devuelve redirectUrl
   ↓
14. Usuario redirigido a /checkout/success
```

---

## 11. Consideraciones Especiales

### Balance Insuficiente
- Validar en frontend ANTES de enviar
- Si balance < total: Mostrar error y no permitir seleccionar Trimegisto
- Permitir seleccionar cantidad diferente de cuotas para reducir monto por cuota

### Token Expirado
- Si usuario intenta confirmar después de 24 horas
- Mostrar mensaje amigable
- Permitir volver a checkout e intentar nuevamente

### Confirmación Duplicada
- Validar en backend que token ya fue usado
- No procesar pago dos veces
- Devolver error clara indicando que ya fue confirmado

### Seguridad
- Usar HTTPS para todos los links
- Tokens con versionse criptográficas
- Logging de todas las acciones
- Rate limiting en endpoint de confirmación

---

## 12. Testing

### Casos de Prueba

1. **Balance Suficiente**: Usuario selecciona Trimegisto, recibe email, confirma ✓
2. **Balance Insuficiente**: Opción deshabilitada o bloqueada ✓
3. **Token Expirado**: Mensaje de error, opción para reintentar ✓
4. **Token Inválido**: Error en confirmación ✓
5. **Confirmación Duplicada**: Error, no Double-charge ✓

### Endpoints Mock para Testing

```bash
# Initiate (Backend devuelve)
POST /orders/trismegisto/initiate
{
  "success": true,
  "preOrderId": "PRE-476-TRIMEGISTO",
  "message": "Email enviado",
  "expiresAt": "2026-03-13T12:34:56Z"
}

# Confirm (Backend devuelve)
GET /orders/trismegisto/confirm/{{token}}
{
  "success": true,
  "autoProcessed": true,
  "orderNumber": "LW260313-0005",
  "message": "¡Compra exitosa!",
  "redirectUrl": "https://tienda.liwilu.com.pe/checkout/success?orderId=2000215"
}
```

