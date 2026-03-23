// pages/orders/trismegisto/confirm/[token].tsx
/**
 * Trimegisto Email Confirmation Page
 * User lands here after clicking the confirmation link from email
 * Automatically processes the payment confirmation
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import ProcessingOverlay from "@/components/checkout/ProcessingOverlay";
import Button from "@/components/ui/Button";
import logger from "@/lib/logger";
import { showToast } from "@/lib/notifications";
import { confirmTrismegistoPayment } from "@/lib/trimegisto";
import { PiCheckCircleFill, PiXCircleFill } from "react-icons/pi";

interface ConfirmationState {
  status: 'processing' | 'success' | 'error' | 'expired';
  orderNumber?: string;
  redirectUrl?: string;
  errorMessage?: string;
  expiresAt?: string;
}

export default function TrismegistoConfirmPage() {
  const router = useRouter();
  const { token } = router.query;

  const [state, setState] = useState<ConfirmationState>({
    status: 'processing',
  });

  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number | null>(null);

  /**
   * Process confirmation when token is available
   */
  useEffect(() => {
    if (!token || typeof token !== 'string') return;

    const processConfirmation = async () => {
      try {
        logger.log('[Trimegisto Confirm] Processing confirmation with token:', token.substring(0, 10) + '...');

        const response = await confirmTrismegistoPayment(token);

        if (response.success) {
          setState({
            status: 'success',
            orderNumber: response.orderNumber,
            redirectUrl: response.redirectUrl,
          });

          // Show success toast
          showToast(`¡Compra exitosa! Pedido: ${response.orderNumber}`, 'success');

          // Auto-redirect after 3 seconds
          const countdown = 3;
          setAutoRedirectCountdown(countdown);

          const redirectTimer = setInterval(() => {
            setAutoRedirectCountdown((prev) => {
              if (prev === 1) {
                clearInterval(redirectTimer);
                if (response.redirectUrl) {
                  window.location.href = response.redirectUrl;
                }
                return null;
              }
              return (prev ?? 0) - 1;
            });
          }, 1000);
        } else {
          setState({
            status: 'error',
            errorMessage: response.message || 'Error al procesar la confirmación',
          });
          showToast(response.message || 'Error en la confirmación', 'error');
        }
      } catch (error: any) {
        logger.error('[Trimegisto Confirm] Error:', error);

        // Determine error type based on message
        const errorMessage = error.message || 'Error desconocido';
        let status: 'error' | 'expired' = 'error';

        // Si el backend explícitamente manda mensaje sobre expiración
        if (errorMessage.toLowerCase().includes('expirad') || errorMessage.toLowerCase().includes('inválido')) {
          status = 'expired';
        }

        setState({
          status,
          errorMessage,
        });

        showToast(errorMessage, 'error');
      }
    };

    processConfirmation();
  }, [token]);

  if (state.status === 'processing') {
    return (
      <Layout
        title="Confirmando Compra"
        description="Por favor espera mientras procesamos tu compra"
      >
        <ProcessingOverlay isProcessing={true} stage="processing-payment" />
      </Layout>
    );
  }

  if (state.status === 'success') {
    return (
      <Layout
        title="¡Compra Confirmada!"
        description="Tu pedido ha sido procesado exitosamente"
        background={true}
      >
        <div className="flex items-center justify-center px-8 py-24">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <PiCheckCircleFill className="w-16 h-16 text-green-500" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl md:text-4xl font-semibold text-primary-dark mb-2">
              ¡Compra Exitosa!
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Tu pedido ha sido procesado automáticamente usando tu saldo.
            </p>

            {/* Order Number */}
            {state.orderNumber && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Número de Pedido</p>
                <p className="text-2xl font-bold text-primary-dark">{state.orderNumber}</p>
              </div>
            )}

            {/* Auto-redirect Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                {autoRedirectCountdown !== null
                  ? `Redirigiendo en ${autoRedirectCountdown} segundo${autoRedirectCountdown > 1 ? 's' : ''}...`
                  : 'Redirigiendo a tu pedido...'}
              </p>
            </div>

            {/* Manual Redirect Button */}
            {state.redirectUrl && (
              <Button
                size="md"
                className="w-full"
                onClick={() => (window.location.href = state.redirectUrl!)}
              >
                Ver Detalles del Pedido
              </Button>
            )}

            {/* Back to Home */}
            <button
              onClick={() => router.push('/')}
              className="mt-4 text-primary-light hover:text-primary-dark transition text-sm font-medium"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (state.status === 'expired') {
    return (
      <Layout
        title="Link Expirado"
        description="El link de confirmación ha expirado"
        background={true}
      >
        <div className="flex items-center justify-center px-8 py-24">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-12 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <PiXCircleFill className="w-16 h-16 text-orange-500" />
            </div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-semibold text-primary-dark mb-2">
              Link Expirado
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              El link de confirmación tiene una validez de 24 horas.
              Por favor, intenta realizar la compra nuevamente desde el checkout.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                size="md"
                className="w-full"
                onClick={() => router.push('/checkout')}
              >
                Volver al Checkout
              </Button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 border-2 border-primary-light text-primary-dark rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Ir al Inicio
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error State
  return (
    <Layout
      title="Error en la Confirmación"
      description="Hubo un error al procesar tu compra"
      background={true}
    >
      <div className="flex items-center justify-center px-8 py-24">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-12 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <PiXCircleFill className="w-16 h-16 text-red-500" />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl md:text-4xl font-semibold text-primary-dark mb-2">
            Error en la Confirmación
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            No se pudo completar la confirmación de tu pedido. Por favor, revisa los detalles a continuación:
          </p>

          {/* Error Details */}
          {state.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 font-medium">{state.errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              size="md"
              className="w-full"
              onClick={() => router.push('/checkout')}
            >
              Volver al Checkout
            </Button>
            <Button
              size="md"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/')}
            >
              Ir al Inicio
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Si el problema persiste, contáctanos a:
              <br />
              <span className="font-semibold text-primary-dark">soporte@liwilu.com.pe</span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
