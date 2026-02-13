import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getOrderDetail, checkAsyncPaymentStatus } from "@/lib/cart";
import { useCart } from "@/context/CartContext";
import logger from "@/lib/logger";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import { showToast } from "@/lib/notifications";

export default function PagoPendiente() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const orderId = searchParams.get("order"); // Tu pendingOrderId
  const method = searchParams.get("method") as "qr" | "pagoefectivo" | null;

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Referencias para controlar el polling
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar datos de la orden
  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    loadOrderData();
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!orderId) {
        throw new Error("No se encontró el ID de la orden");
      }

      const storageData = localStorage.getItem("liwilu_last_culqi_order");

      if (storageData) {
        try {
          const parsedData = JSON.parse(storageData);
          logger.log("📦 Datos cargados desde localStorage:", parsedData);

          if (parsedData.pendingOrderId === parseInt(orderId)) {
            // ═══════════════════════════════════════════════════════════
            // DETERMINAR MÉTODO CORRECTO BASADO EN paymentMethodType
            // ═══════════════════════════════════════════════════════════
            let effectiveMethod = parsedData.paymentMethod;

            // Si el método en la URL no coincide con el detectado, usar el detectado
            if (method && method !== parsedData.paymentMethod) {
              logger.warn(
                `⚠️ Método en URL (${method}) no coincide con detectado (${parsedData.paymentMethod})`,
              );
              effectiveMethod = parsedData.paymentMethod;
            }

            // Si no hay método en URL, usar el detectado
            if (!method) {
              effectiveMethod = parsedData.paymentMethod;
            }

            logger.log(`📍 Método efectivo: ${effectiveMethod}`);
            logger.log(
              `📍 PaymentMethodType original: ${parsedData.paymentMethodType}`,
            );

            setOrderData({
              pendingOrderId: parsedData.pendingOrderId,
              culqiOrderId: parsedData.orderId,
              paymentMethod: effectiveMethod,
              paymentMethodType: parsedData.paymentMethodType,
              amount: parsedData.amount,
              currency: parsedData.currency || "PEN",
              expirationDate: parsedData.expirationDate,
              qr: parsedData.qr,
              paymentCode: parsedData.paymentCode,
              status: "waiting",
            });

            startPaymentPolling();
            setLoading(false);
            return;
          }
        } catch (parseError) {
          logger.warn("⚠️ Error al parsear localStorage:", parseError);
        }
      }

      // Fallback a API...
      logger.log("🔄 Cargando datos desde API...");
      const response = await getOrderDetail(orderId);

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "No se encontraron datos de la orden",
        );
      }

      logger.log("📦 Datos cargados desde API:", response.data);
      setOrderData(response.data);

      localStorage.setItem(
        "liwilu_last_culqi_order",
        JSON.stringify({
          orderId: response.data.culqiOrderId,
          paymentMethod: response.data.paymentMethod,
          paymentMethodType: response.data.paymentMethodType,
          pendingOrderId: response.data.pendingOrderId,
          amount: response.data.amount,
          currency: response.data.currency,
          expirationDate: response.data.expirationDate,
          qr: response.data.qr,
          paymentCode: response.data.paymentCode,
          timestamp: Date.now(),
        }),
      );

      startPaymentPolling();
    } catch (err: any) {
      logger.error("❌ Error cargando orden:", err);
      setError(err.message || "Error al cargar los datos del pago");
    } finally {
      setLoading(false);
    }
  };

  // Polling para verificar si el pago se completó
  const startPaymentPolling = () => {
    // Limpiar polling anterior si existe
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }

    logger.log("🔄 Iniciando polling de pago...");

    // Polling cada 5 segundos
    pollIntervalRef.current = setInterval(async () => {
      try {
        if (!orderId) return;

        const statusResponse = await checkAsyncPaymentStatus(orderId);

        logger.log("🔄 Payment status:", statusResponse);

        if (statusResponse.success && statusResponse.data?.status === "paid") {
          // Pago completado
          stopPolling();

          // Limpiar carrito
          clearCart();

          // Mostrar mensaje de éxito
          showToast("¡Pago recibido! Redirigiendo...", "success");

          // Redirigir a página de éxito
          const realOrderId = statusResponse.data.orderId;
          router.push(`/pedido-exitoso?order=${realOrderId}`);
        }
      } catch (err) {
        logger.error("❌ Error verificando pago:", err);
      }
    }, 5000); // Cada 5 segundos

    // Timeout después de 30 minutos
    pollTimeoutRef.current = setTimeout(
      () => {
        logger.warn("⏰ Timeout de polling alcanzado (30 min)");
        stopPolling();
        showToast(
          "El tiempo de espera ha expirado. Por favor, verifica tu pago manualmente.",
          "error",
        );
      },
      30 * 60 * 1000,
    );
  };

  // Detener polling
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Verificar pago manualmente
  const handleCheckPayment = async () => {
    if (!orderId) return;

    setIsChecking(true);
    try {
      const statusResponse = await checkAsyncPaymentStatus(orderId);

      if (statusResponse.success && statusResponse.data?.status === "paid") {
        stopPolling();
        clearCart();
        showToast("¡Pago confirmado!", "success");
        const realOrderId = statusResponse.data.orderId;
        router.push(`/pedido-exitoso?order=${realOrderId}`);
      } else {
        showToast("El pago aún está pendiente", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Error al verificar el pago", "error");
    } finally {
      setIsChecking(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout
        title="Procesando pago - Liwilu"
        description="Espera mientras procesamos tu pago"
        background={true}
      >
        <div className="max-w-2xl mx-auto px-6 py-12 my-24">
          <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout
        title="Error - Liwilu"
        description="Error al cargar el pago"
        background={true}
      >
        <div className="max-w-2xl mx-auto px-6 py-12 my-24">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error al cargar el pago
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/")}>Volver al inicio</Button>
              <Button onClick={loadOrderData} variant="secondary">
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Completa tu pago - Liwilu"
      description="Finaliza tu compra"
      background={true}
    >
      <div className="max-w-2xl mx-auto px-6 py-8 my-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Completa tu pago
          </h1>
          <p className="text-gray-600">
            Pedido #{orderId} • Total: S/ {orderData?.amount?.toFixed(2)}
          </p>
        </div>

        {/* Selector de Vista (si ambos están disponibles) */}
        {orderData?.qr && orderData?.paymentCode && (
          <div className="flex justify-center mb-8 bg-gray-100 p-1 rounded-sm w-fit mx-auto">
            <button
              onClick={() => {
                router.push(
                  `/pago-pendiente?order=${orderId}&method=pagoefectivo`,
                );
              }}
              className={`px-6 py-2 rounded-sm text-sm font-medium transition-all ${method === "pagoefectivo"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Código CIP
            </button>
            <button
              onClick={() => {
                router.push(`/pago-pendiente?order=${orderId}&method=qr`);
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${method === "qr"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Código QR
            </button>
          </div>
        )}

        {/* QR para Yape/Billetera */}
        {(method === "qr" || (!method && orderData?.qr)) && orderData?.qr && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Escanea el código QR
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Abre tu app de Yape, Plin o Billetera Móvil y escanea el código
            </p>

            {/* Mostrar QR */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={orderData.qr}
                  alt="Código QR de pago"
                  className="w-72 h-72 border-4 border-primary/20 rounded-xl shadow-md"
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Información importante</p>
                  <ul className="space-y-1 text-xs">
                    <li>• El QR expira en 24 horas</li>
                    <li>
                      • Una vez realizado el pago, serás redirigido
                      automáticamente
                    </li>
                    <li>• No cierres esta ventana</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Fallback link to CIP if available but hidden */}
            {orderData.paymentCode && method === "qr" && !orderData.qr && (
              <button
                onClick={() =>
                  router.push(
                    `/pago-pendiente?order=${orderData.pendingOrderId}&method=pagoefectivo`,
                  )
                }
                className="w-full mt-4 text-primary underline text-sm"
              >
                ¿Problemas con el QR? Ver código de pago (CIP)
              </button>
            )}
          </div>
        )}

        {/* CIP para PagoEfectivo */}
        {(method === "pagoefectivo" ||
          (!method && !orderData?.qr && orderData?.paymentCode)) &&
          orderData?.paymentCode && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Código de pago (CIP)
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Presenta este código en cualquier agente autorizado o banco
              </p>

              {/* Mostrar CIP */}
              <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-8 mb-6 text-center">
                <p className="text-sm text-gray-600 mb-2 uppercase tracking-wide">
                  Código CIP:
                </p>
                <p className="text-3xl md:text-5xl font-bold text-primary tracking-wider mb-2">
                  {orderData.paymentCode}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(orderData.paymentCode);
                    showToast("Código copiado al portapapeles", "success");
                  }}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Copiar código
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  <span className="text-green-500 text-lg">✓</span>
                  <p>Paga en cualquier agente o banco afiliado</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  <span className="text-green-500 text-lg">✓</span>
                  <p>Monto a pagar: S/ {orderData.amount?.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-md">
                  <span className="text-orange-500 text-lg">⏰</span>
                  <p>
                    Este código expira el{" "}
                    {new Date(orderData.expirationDate).toLocaleDateString(
                      "es-PE",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Instrucciones */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 animate-fade-in">
          <h3 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
            <span className="text-primary text-xl">→</span>
            ¿Qué sigue?
          </h3>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span className="text-gray-700 pt-0.5">
                Completa el pago usando el{" "}
                {method === "qr" ? "código QR" : "código CIP"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span className="text-gray-700 pt-0.5">
                Espera la confirmación (puede tardar unos minutos)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span className="text-gray-700 pt-0.5">
                Serás redirigido automáticamente a la confirmación de tu pedido
              </span>
            </li>
          </ol>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleCheckPayment}
            disabled={isChecking}
            variant="primary"
            className="flex-1"
          >
            {isChecking ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white"></div>
                Verificando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Verificar pago
              </span>
            )}
          </Button>
          {/* <button
            onClick={() => router.push("/ayuda")}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-sm font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            ¿Necesitas ayuda?
          </button> */}
        </div>

        {/* Footer - Indicador de verificación automática */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Verificando pago automáticamente cada 5 segundos
          </p>
        </div>
      </div>
    </Layout>
  );
}
