// pages/pedido-exitoso.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import logger from '@/lib/logger';
import Layout from "@/components/Layout";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import Button from "@/components/ui/Button";
import {
  getOrderDetail,
  getOrderPaymentStatus,
  sendOrderPaidEmail,
} from "@/lib/cart";

export default function PedidoExitoso() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);

  const initializationStarted = useRef(false);

  useEffect(() => {
    let orderId = searchParams?.get("order");

    // If orderId is not in URL, try to recover from localStorage
    if (!orderId) {
      const successfulOrder = localStorage.getItem("liwilu_successful_order");
      if (successfulOrder) {
        try {
          const orderData = JSON.parse(successfulOrder);
          const elapsed = Date.now() - orderData.timestamp;

          // If less than 10 minutes old, use it
          if (elapsed < 10 * 60 * 1000) {
            orderId = orderData.orderId.toString();
            logger.log("✅ OrderId recuperado desde localStorage:", orderId);

            // Update URL to include the orderId
            window.history.replaceState(
              null,
              "",
              `/pedido-exitoso?order=${orderId}`,
            );
          } else {
            // Old data, clear it
            localStorage.removeItem("liwilu_successful_order");
          }
        } catch (e) {
          logger.error("Error parsing successful order from localStorage:", e);
          localStorage.removeItem("liwilu_successful_order");
        }
      }
    }

    if (!orderId) {
      setLoading(false);
      setError("No se encontró el ID de la orden");
      return;
    }

    // 🛡️ Guard to prevent duplicate execution
    if (initializationStarted.current) {
      logger.log("🛑 [PedidoExitoso] Inicialización ya en proceso, ignorando duplicado");
      return;
    }
    initializationStarted.current = true;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await getOrderDetail(orderId);
        if (response.success) {
          setOrder(response.data);

          // Limpiar estado de checkout después de compra exitosa
          localStorage.removeItem("liwilu_checkout_state");
          localStorage.removeItem("liwilu_successful_order"); // Clear recovery data
          logger.log(
            "✅ Estado de checkout limpiado después de compra exitosa",
          );

          // 🛒 VERIFICACIÓN DE PAGO Y ENVÍO DE CORREO
          try {
            const statusResponse = await getOrderPaymentStatus(orderId);
            if (statusResponse.success && statusResponse.data) {
              const { status, paymentStatus } = statusResponse.data;

              // Si el estado es PAID o COMPLETED, enviamos el correo de confirmación
              if (status === "PAID" || paymentStatus === "COMPLETED") {
                // Evitar duplicados usando localStorage
                const mailSentKey = `liwilu_mail_sent_${orderId}`;
                const alreadySent = localStorage.getItem(mailSentKey);

                if (!alreadySent) {
                  logger.log(
                    "📧 Disparando correo de confirmación de pago para orden:",
                    orderId,
                  );
                  await sendOrderPaidEmail(orderId);
                  localStorage.setItem(mailSentKey, "true");
                } else {
                  logger.log("📧 Correo ya enviado previamente (según localStorage)");
                }
              }
            }
          } catch (statusErr) {
            logger.warn(
              "⚠️ No se pudo verificar el estado de pago para el envío de correo:",
              statusErr,
            );
          }
        } else {
          setError(
            response.message ||
            "No se pudieron obtener los detalles del pedido",
          );
        }
      } catch (err: any) {
        logger.error("Error fetching order details:", err);
        setError(err.message || "Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams]);

  if (loading) {
    return (
      <Layout
        title="Cargando Pedido - Liwilu"
        description="Estamos obteniendo los detalles de tu pedido"
      >
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">
              Cargando detalles de tu compra...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout
        title="Error - Liwilu"
        description="No se pudo encontrar el pedido"
      >
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <FaExclamationTriangle className="text-yellow-500 text-6xl mx-auto mb-6" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              ¡Ups! Algo salió mal
            </h1>
            <p className="text-gray-600 mb-8">
              {error || "No pudimos encontrar la información de tu pedido."}
            </p>
            <Button
              className="w-full"
              onClick={() => router.push("/productos")}
            >
              Volver a la tienda
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const nombreCliente = order.personalData?.nombre || "Cliente";
  const numeroPedido = order.id;
  const deliveryType = order.deliveryType;
  const metodoPago = order.invoiceType || "TARJETA";

  return (
    <Layout
      title="Pedido Exitoso - Liwilu"
      description="Tu pedido ha sido procesado"
    >
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda - Confirmación */}
            <div className="flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
              {/* Logo */}
              <div className="mb-4">
                <Image
                  src="/images/liwilu_logo_dark.png"
                  alt="Liwilu"
                  width={127}
                  height={39}
                  priority
                />
              </div>

              {/* Icono de éxito */}
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                  <FaCheckCircle className="text-green-500 text-7xl" />
                </div>
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
              </div>

              {/* Mensaje de éxito */}
              <div className="space-y-4">
                <h1 className="text-4xl font-normal text-gray-900 leading-tight">
                  Gracias por tu compra,
                  <br />
                  <span className="font-semibold">{nombreCliente}</span>
                </h1>

                <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
                  <p className="text-gray-700 text-lg mb-2">
                    Tu pedido N°{" "}
                    <span className="font-semibold text-primary">
                      {numeroPedido}
                    </span>
                  </p>
                  <p className="text-gray-700 text-lg font-semibold">
                    ha sido registrado con éxito
                  </p>
                </div>

                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  Estamos gestionando tu compra
                </p>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3 w-full max-w-md">
                <Button
                  className="w-full"
                  onClick={() => router.push(`/rastreo/${numeroPedido}`)}
                >
                  Seguir tu pedido
                </Button>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push("/productos")}
                >
                  Ir a la tienda
                </Button>
              </div>

              {/* Información adicional */}
              {/* <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto mt-8">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    📧 Hemos enviado un correo de confirmación con los detalles de tu pedido
                                </p>
                                <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                                    📱 Recibirás notificaciones sobre el estado de tu envío
                                </p>
                            </div> */}
            </div>

            {/* Columna derecha - Resumen del pedido */}
            <div className="animate-fade-in-right">
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 sticky top-24">
                <h2 className="text-2xl font-semibold mb-6 pb-4 border-b-2 border-gray-100">
                  Resumen del pedido
                </h2>

                {/* Lista de productos */}
                <div className="space-y-6 mb-6">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            item.variationImage ||
                            item.coverImage ||
                            "/images/placeholder-product.jpg"
                          }
                          alt={item.variationName || item.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.variationName || item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          X{item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(
                            (
                              parseFloat(
                                item.priceWithTax ||
                                item.variationPriceWithTax ||
                                "0",
                              ) * item.quantity
                            ).toString(),
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="space-y-3 pt-6 border-t-2 border-gray-100">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">
                      {formatPrice(order.subtotal || "0")}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Envío</span>
                    <span className="font-semibold">
                      {formatPrice(order.shippingCost || "0")}
                    </span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">Descuento</span>
                      <span className="font-semibold">
                        -{formatPrice(order.discount || "0")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-2xl font-semibold text-gray-900 pt-4 border-t-2 border-gray-100">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(order.total || "0")}
                    </span>
                  </div>

                  <div className="bg-green-50 rounded-sm p-4 border-2 border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-green-800">
                        {order.status === "PAID" ||
                          order.paymentStatus === "COMPLETED"
                          ? "Pagado"
                          : "Pendiente"}
                      </span>
                      <span className="text-xl font-semibold text-green-600">
                        {formatPrice(order.total || "0")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información del pedido */}
                <div className="mt-8 pt-6 border-t-2 border-gray-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Número de pedido:</span>
                    <span className="font-semibold text-gray-900">
                      #{numeroPedido}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString("es-PE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Método de pago:</span>
                    <span className="font-semibold text-gray-900">
                      {order.paymentData?.brand
                        ? `${order.paymentData.brand} ${order.paymentData.last4 || ""}`
                        : order.invoiceType || "Por definir"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tipo de entrega:</span>
                    <span className="font-semibold text-gray-900 uppercase">
                      {deliveryType}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-semibold text-green-600 flex items-center gap-1">
                      <FaCheckCircle className="text-sm" />
                      {order.status === "PAID" ? "Confirmado" : order.status}
                    </span>
                  </div>
                </div>

                {/* Tiempo estimado de entrega */}
                {/* <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-sm p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
                      <svg
                        className="w-6 h-6 text-blue-600"
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
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Entrega estimada
                      </p>
                      <p className="text-sm text-gray-700">10 días hábiles</p>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Sección de ayuda */}
          {/* <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ¿Necesitas ayuda con tu pedido?
            </h3>
            <p className="text-gray-600 mb-6">
              Nuestro equipo de atención al cliente está disponible para
              ayudarte
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contacto"
                className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-full transition"
              >
                Contactar soporte
              </Link>
              <Link
                href="/ayuda"
                className="bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-full transition"
              >
                Centro de ayuda
              </Link>
            </div>
          </div> */}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </Layout>
  );
}
