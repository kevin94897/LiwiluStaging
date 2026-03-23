# Ejemplos de Código - Integración Trimegisto en Checkout

## 1. Integración en pages/checkout.tsx

### Imports
```typescript
import {
  initiateTrismegistoPayment,
  getTrismegistoBalance,
  validateTrismegistoPayment,
  TrismegistoBalanceInfo,
  type PreOrder,
} from '@/lib/trimegisto';
import TrismegistoPaymentSection from '@/components/checkout/TrismegistoPaymentSection';
```

### Estados Adicionales
```typescript
// Estados para Trimegisto
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
  'card' | 'async' | 'trimegisto' | null
>(null);
const [trismegistoBalance, setTrismegistoBalance] = useState<TrismegistoBalanceInfo | null>(null);
const [trismegistoInstallments, setTrismegistoInstallments] = useState<number>(1);
const [isLoadingTrismegisto, setIsLoadingTrismegisto] = useState(false);
const [trismegistoError, setTrismegistoError] = useState<string | null>(null);
```

### Effect para Cargar Balance
```typescript
// Cargar balance trimegisto cuando usuario está autenticado
useEffect(() => {
  if (!isAuthenticated || !user) {
    setTrismegistoBalance(null);
    return;
  }

  const loadTrismegistoBalance = async () => {
    try {
      logger.log('[Checkout] Loading Trimegisto balance...');
      const balance = await getTrismegistoBalance();
      setTrismegistoBalance(balance);
      setTrismegistoError(null);
      logger.log('[Checkout] Trimegisto balance loaded:', balance);
    } catch (error: any) {
      logger.error('[Checkout] Failed to load Trimegisto balance:', error);
      // No mostrar error al usuario, solo no mostrar la opción
      setTrismegistoBalance(null);
      setTrismegistoError(error.message);
    }
  };

  loadTrismegistoBalance();
}, [isAuthenticated, user]);
```

### Validación Trimegisto
```typescript
const validateTrismegistoForm = (): boolean => {
  // 1. Validar que existe balance info
  if (!trismegistoBalance) {
    showToast('No se pudo cargar tu información de saldo. Intenta nuevamente.', 'error');
    return false;
  }

  // 2. Validar datos personales (igual que otros métodos)
  if (!datosBoleta.numeroDocumento || !datosBoleta.nombres) {
    showToast('Por favor completa todos los datos personales', 'error');
    return false;
  }

  // 3. Validar balance y cuotas
  const validation = validateTrismegistoPayment(
    totals.total,
    trismegistoInstallments,
    trismegistoBalance.available,
  );

  if (!validation.valid) {
    showToast(validation.error || 'Validación fallida', 'error');
    return false;
  }

  // 4. Validar que cartId existe (carrito sincronizado)
  if (!cartId) {
    showToast('Error: carrito no sincronizado. Intenta nuevamente.', 'error');
    return false;
  }

  return true;
};
```

### Handler para Confirmar con Trimegisto
```typescript
const handleTrismegistoConfirm = async () => {
  try {
    // Validar toda la información
    if (!validateTrismegistoForm()) {
      return;
    }

    // Si llegamos aquí, todo es válido
    setIsLoadingTrismegisto(true);
    logger.log('[Trimegisto] Initiating payment:', {
      total: totals.total,
      installments: trismegistoInstallments,
      cartId: cartId,
      user: user?.id,
    });

    // Crear pre-orden
    const response = await initiateTrismegistoPayment(
      totals.total,
      trismegistoInstallments,
      pendingOrderId, // Asumiendo que existe desde antes
    );

    if (response.success) {
      logger.log('[Trimegisto] Pre-order created successfully:', {
        preOrderId: response.preOrderId,
        expiresAt: response.expiresAt,
      });

      // Guardar info en localStorage para referencia
      const trismegistoData = {
        preOrderId: response.preOrderId,
        expiresAt: response.expiresAt,
        createdAt: new Date().toISOString(),
        balanceAmount: totals.total,
        installments: trismegistoInstallments,
      };
      localStorage.setItem('liwilu_trismegisto_pending', JSON.stringify(trismegistoData));

      // Limpiar carrito
      clearCart();

      // Mostrar mensaje de éxito
      showToast(
        '✓ Solicitud de pago enviada. Por favor revisa tu email para confirmar.',
        'success',
      );

      // Esperar un poco y redirigir a página de pendiente
      setTimeout(() => {
        router.push('/trimegisto-pendiente');
      }, 1500);
    } else {
      logger.error('[Trimegisto] Pre-order creation failed:', response.error);
      showToast(response.error || 'Error al procesar el pago', 'error');
    }
  } catch (error: any) {
    logger.error('[Trimegisto] Exception in handleTrismegistoConfirm:', error);
    showToast(
      error.message || 'Error desconocido al procesar el pago',
      'error',
    );
  } finally {
    setIsLoadingTrismegisto(false);
  }
};
```

### Handler Principal de Confirmación
```typescript
const handleConfirmOrder = async (e: React.FormEvent) => {
  e.preventDefault();

  // Determinar qué hacer basado en el método de pago seleccionado
  if (selectedPaymentMethod === 'trimegisto') {
    await handleTrismegistoConfirm();
    return;
  }

  if (selectedPaymentMethod === 'card') {
    // ... lógica existente para tarjeta
    return;
  }

  if (selectedPaymentMethod === 'async') {
    // ... lógica existente para pagos asincronos
    return;
  }

  showToast('Por favor selecciona un método de pago', 'error');
};
```

### Integración en JSX (Sección de Métodos de Pago)
```typescript
{/* PAYMENT METHODS SECTION */}
<div className="space-y-4">
  <h2 className="text-2xl font-semibold text-primary-dark mb-6">
    Método de Pago
  </h2>

  {/* TRIMEGISTO - Mostrar solo si está disponible */}
  {isAuthenticated && trismegistoBalance && trismegistoBalance.available > 0 && (
    <TrismegistoPaymentSection
      isSelected={selectedPaymentMethod === 'trimegisto'}
      onSelect={() => {
        setSelectedPaymentMethod('trimegisto');
        setTrismegistoError(null);
      }}
      totals={totals}
      balanceInfo={trismegistoBalance}
      selectedInstallments={trismegistoInstallments}
      onInstallmentsChange={setTrismegistoInstallments}
      isLoading={isLoadingTrismegisto}
    />
  )}

  {/* CARD METHOD */}
  {/* ... componente existente ... */}

  {/* ASYNC METHODS */}
  {/* ... componente existente ... */}

  {/* ERROR MESSAGE SI TRIMEGISTO FALLA AL CARGAR */}
  {trismegistoError && !trismegistoBalance && (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <p className="text-sm text-amber-700">
        ⚠️ No se pudo cargar el método Trimegisto. Usa otro método de pago.
      </p>
    </div>
  )}
</div>

{/* CONFIRM BUTTON */}
<button
  onClick={handleConfirmOrder}
  disabled={
    !selectedPaymentMethod ||
    isLoadingTrismegisto ||
    isProcessing
  }
  className="w-full bg-primary-light hover:bg-primary-dark..."
>
  {isLoadingTrismegisto ? 'Procesando...' : 'Confirmar Compra'}
</button>
```

---

## 2. Página de Confirmación - Simplificada

### pages/trimegisto-pendiente.tsx (Versión Completa)
```typescript
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import { useRouter } from "next/router";
import { useCart } from "@/context/CartContext";
import { PiMailboxFill, PiClockFill } from "react-icons/pi";
import logger from "@/lib/logger";

interface TresmegistoData {
  preOrderId: string;
  expiresAt: string;
  createdAt: string;
  balanceAmount: number;
  installments: number;
}

export default function TrismegistoPendiente() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [trismegistoData, setTrismegistoData] = useState<TresmegistoData | null>(null);
  const [countdownMinutes, setCountdownMinutes] = useState<number>(1440); // 24 horas en minutos

  useEffect(() => {
    // Cargar datos de la pre-orden
    const data = localStorage.getItem('liwilu_trismegisto_pending');
    if (data) {
      try {
        const parsed = JSON.parse(data) as TresmegistoData;
        setTrismegistoData(parsed);
        logger.log('[Trimegisto Pendiente] Data loaded:', parsed);

        // Calcular tiempo restante
        const createdTime = new Date(parsed.createdAt).getTime();
        const expiresTime = new Date(parsed.expiresAt).getTime();
        const now = Date.now();
        const remaining = Math.ceil((expiresTime - now) / 60000); // en minutos

        setCountdownMinutes(Math.max(0, remaining));
      } catch (error) {
        logger.error('[Trimegisto Pendiente] Error parsing data:', error);
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdownMinutes <= 0) return;

    const interval = setInterval(() => {
      setCountdownMinutes((prev) => Math.max(0, prev - 1));
    }, 60000); // Update cada minuto

    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Layout
      title="Confirmación Pendiente"
      description="Por favor completa la confirmación en tu email"
      background={true}
    >
      <div className="flex items-center justify-center px-8 py-24">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <PiMailboxFill className="w-16 h-16 text-primary-light mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-semibold text-primary-dark mb-2">
              Confirmación Pendiente
            </h1>
            <p className="text-gray-600 text-lg">
              Hemos enviado un correo de confirmación a tu email registrado
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-blue-900 mb-3">Próximos pasos:</h2>
            <ol className="space-y-2 text-blue-800">
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">1.</span>
                <span>Abre tu email (revisa toda las carpetas incluyendo spam)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">2.</span>
                <span>Busca un email de "Liwilu" con el asunto de confirmación</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">3.</span>
                <span>Haz click en el enlace "Confirmar Compra"</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">4.</span>
                <span>¡Tu compra será procesada automáticamente!</span>
              </li>
            </ol>
          </div>

          {/* Order Details */}
          {trismegistoData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Monto Total</p>
                <p className="text-2xl font-bold text-primary-dark">
                  S/. {trismegistoData.balanceAmount.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Cuotas</p>
                <p className="text-2xl font-bold text-primary-dark">
                  {trismegistoData.installments}
                </p>
              </div>
            </div>
          )}

          {/* Timer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex gap-3">
            <PiClockFill className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">
                El link expira en: <span className="text-lg">{formatTime(countdownMinutes)}</span>
              </p>
              <p className="text-amber-700 mt-1">
                Si expira, deberás volver al checkout e intentar nuevamente
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                // Abrir Gmail en nueva pestaña
                window.open('https://mail.google.com', '_blank');
              }}
            >
              📧 Abrir Mi Email
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/checkout')}
            >
              Volver al Checkout
            </Button>
          </div>

          {/* Important Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-green-900">
              ✓ <span className="font-semibold">Una vez confirmes:</span> Tu pedido será procesado
              automáticamente y recibirás un email con el número de pedido y estado del envío.
            </p>
          </div>

          {/* Support */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 text-center">
              ¿Tienes problemas? Contáctanos:
              <br />
              <a href="mailto:soporte@liwilu.com.pe" className="font-semibold text-primary-dark hover:underline">
                soporte@liwilu.com.pe
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

---

## 3. Página de Confirmación por Email - Completa

```typescript
// pages/orders/trismegisto/confirm/[token].tsx
// (Ya incluida en archivos anteriores)
```

---

## 4. Componente TrismegistoPaymentSection - Uso

```typescript
// En pages/checkout.tsx, dentro del JSX:

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

## 5. Test Flow (Manual)

### Flujo de Prueba Completo
```bash
# 1. Usuario autenticado en checkout
# 2. Carrito tiene items
# 3. Selecciona Trimegisto
# ✓ Debería mostrar saldo disponible
# ✓ Debería permitir seleccionar 1-3 cuotas
# ✓ Debería mostrar monto por cuota

# 4. Click en "Confirmar Compra"
# POST /orders/trismegisto/initiate
# Response success
# ✓ Clear cart
# ✓ Show toast (éxito)
# ✓ Redirect a /trimegisto-pendiente

# 5. En /trimegisto-pendiente
# ✓ Mostrar datos de pre-orden
# ✓ Mostrar timer de 24h
# ✓ Botón para abrir email

# 6. Usuario abre email (simulado)
# ✓ Email contiene link: /orders/trismegisto/confirm/{{token}}

# 7. Click en link
# GET /orders/trismegisto/confirm/{{token}}
# ✓ Página muestra loading
# Response success
# ✓ Mostrar pantalla de éxito
# ✓ Auto-redirect después de 3 segundos
# ✓ Ir a /checkout/success?orderId=XXX
```

---

## 6. Error Scenarios

### Error: Balance Insuficiente
```typescript
// Frontend
const validation = validateTrismegistoPayment(
  18.00,    // total
  2,        // installments
  10.00     // available balance ← Insuficiente!
);

// Resultado:
// { valid: false, error: "Saldo insuficiente. Disponible: S/. 10.00" }

// UI mostrará error en rojo
```

### Error: Token Expirado
```typescript
// En confirm page, cuando GET /confirm/{{token}}
// Backend responde con 410 Gone

// Frontend captura y muestra:
// - Pantalla especial de "Link Expirado"
// - Botón para volver a checkout
// - Opción para contactar soporte
```

### Error: Email No Enviado
```typescript
// Backend falla en enviar email
// Pero PRE-ORDEN fue creada
// Respuesta:
{
  "success": false,
  "error": "EMAIL_SEND_FAILED",
  "message": "No pudimos enviar el email. Por favor intenta nuevamente."
}

// Frontend muestra error
// Usuario puede reintentar el submit
```

---

## 7. LocalStorage Keys Usados

```typescript
// Guardar info de pre-orden pendiente
localStorage.setItem('liwilu_trismegisto_pending', JSON.stringify({
  preOrderId: "PRE-476-TRIMEGISTO",
  expiresAt: "2026-03-14T12:45:30Z",
  createdAt: "2026-03-13T12:45:30Z",
  balanceAmount: 18.00,
  installments: 2,
}));

// Limpiar cuando se confirme
localStorage.removeItem('liwilu_trismegisto_pending');
```

---

## 8. Logs Esperados en Consola

```javascript
[Checkout] Loading Trimegisto balance...
[Checkout] Trimegisto balance loaded: {available: 50, used: 0, pending: 0, maxInstallments: 3}

// Usuario selecciona Trimegisto
// User hace click en confirmar

[Trimegisto] Initiating payment: {
  total: 18.00,
  installments: 2,
  cartId: "SESSION_ID_123",
  user: 42
}

// Response exitosa

[Trimegisto] Pre-order created successfully: {
  preOrderId: "PRE-476-TRIMEGISTO",
  expiresAt: "2026-03-14T12:45:30Z"
}

// En confirm page

[Trimegisto Confirm] Processing confirmation with token: eyJhbGciOi...

[Trimegisto Confirm] Confirmation successful: {
  orderNumber: "LW260313-0005",
  redirectUrl: "https://tienda.liwilu.com.pe/checkout/success?orderId=2000208"
}
```

