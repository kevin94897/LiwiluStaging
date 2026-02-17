import { useState, useEffect } from "react";
import logger from "@/lib/logger";
import Layout from "@/components/Layout";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import AccountSidebar from "@/components/AccountSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getMyOrders, Order } from "@/lib/orders";
import { FaCheckCircle, FaClock, FaTruck, FaBox, FaHome } from "react-icons/fa";

export default function MisPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getMyOrders();
        if (response.success) {
          setOrders(response.data);
        } else {
          setError("No se pudieron cargar los pedidos");
        }
      } catch (err: any) {
        logger.error("Error fetching orders:", err);
        setError(err.message || "Error al cargar los pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getEstadoBadge = (status: string) => {
    const badges: Record<string, string> = {
      COMPLETED: "bg-green-100 text-primary",
      PENDING: "bg-yellow-100 text-yellow-800",
      CANCELLED: "bg-red-100 text-red-800",
      default: "bg-gray-100 text-gray-700",
    };
    const textos: Record<string, string> = {
      COMPLETED: "Completado",
      PENDING: "Pendiente",
      CANCELLED: "Cancelado",
      default: status || "Desconocido",
    };

    return {
      clase: badges[status] || badges.default,
      texto: textos[status] || status || "Desconocido",
    };
  };

  const getIconoEstado = (status: string) => {
    if (status === "COMPLETED") {
      return (
        <div className="h-5 w-5 md:w-8 md:h-8 min-w-5 bg-primary rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 md:w-5 md:h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      );
    }
    return (
      <div className="h-5 w-5 md:w-8 md:h-8 min-w-5 bg-gray-400 rounded-full flex items-center justify-center">
        <svg
          className="w-3 h-3 md:w-5 md:h-5 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <circle cx="10" cy="10" r="4" />
        </svg>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <Layout
        title="Mis pedidos - Liwilu"
        description="Consulta tus pedidos"
        background={true}
      >
        <div className="min-h-screen py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <AccountSidebar activeSection="mis-pedidos" />

              <main className="flex-1">
                <div className="md:px-8 z-10 relative">
                  <h1 className="text-xl md:text-4xl font-semibold mb-8 border-b pb-4">
                    Mis pedidos
                  </h1>

                  <div className="space-y-6">
                    {loading ? (
                      <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-500">Cargando tus pedidos...</p>
                      </div>
                    ) : error ? (
                      <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button
                          onClick={() => window.location.reload()}
                          variant="primary"
                        >
                          Reintentar
                        </Button>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-500 mb-6">
                          Aún no tienes pedidos.
                        </p>
                        <Link href="/tienda">
                          <Button variant="primary">Ir a la tienda</Button>
                        </Link>
                      </div>
                    ) : (
                      orders.map((order) => {
                        const badge = getEstadoBadge(order.paymentStatus);
                        const firstItem = order.items[0];
                        const formattedDate = order.paidAt
                          ? new Intl.DateTimeFormat("es-PE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                              .format(new Date(order.paidAt))
                              .replace(",", "") + " pm"
                          : "-";

                        const isExpanded = expandedOrderId === order.id;

                        return (
                          <div
                            key={order.id}
                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition bg-white"
                          >
                            {/* Header del pedido */}
                            <div className="px-6 py-4 flex items-center justify-between border-b bg-white">
                              <div className="flex items-center gap-4">
                                {getIconoEstado(order.paymentStatus)}
                                <div>
                                  <h3 className="font-semibold text-primary-dark text-sm md:text-base">
                                    Pedido #{order.id}
                                  </h3>
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold mt-1 ${badge.clase}`}
                                  >
                                    {badge.texto}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-600 block md:hidden">
                                  Total:
                                </p>
                                <p className="font-bold text-base md:text-lg text-primary-dark">
                                  S/ {order.priceTotal.toFixed(2)}
                                </p>
                                <p className="text-[10px] md:text-xs text-gray-500">
                                  {formattedDate}
                                </p>
                              </div>
                            </div>

                            {/* Contenido del pedido - Listado de productos */}
                            <div className="p-4 md:p-6 space-y-4">
                              {order.items.map((item, idx) => (
                                <div
                                  key={`${order.id}-item-${idx}`}
                                  className="flex gap-4 items-center"
                                >
                                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-sm overflow-hidden flex-shrink-0 bg-gray-50 border">
                                    <Image
                                      src={
                                        item.image ||
                                        "/images/productos/placeholder.png"
                                      }
                                      alt={item.name}
                                      fill
                                      className="object-contain"
                                      unoptimized
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-xs md:text-base text-primary-dark">
                                      {item.name}
                                    </h4>
                                    <p className="text-[10px] md:text-xs text-neutral-gray">
                                      Ref: {item.reference} | Cant:{" "}
                                      {item.quantity}
                                    </p>
                                    <p className="font-bold text-primary text-sm md:text-base">
                                      S/ {item.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Footer del pedido con toggle de acordeón */}
                            <div className="bg-gray-50 px-6 py-4 border-t">
                              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex gap-2 text-xs text-neutral-gray text-center md:text-left">
                                  <span className="font-semibold">
                                    Destino:
                                  </span>
                                  <span className="line-clamp-1">
                                    {order.personalData.distrito},{" "}
                                    {order.personalData.direccion}
                                  </span>
                                </div>

                                <button
                                  onClick={() => toggleOrderDetails(order.id)}
                                  className="text-primary hover:text-primary-dark font-semibold text-sm flex items-center gap-2 transition-all"
                                >
                                  {isExpanded
                                    ? "Ocultar detalles"
                                    : "Ver detalles"}{" "}
                                  <svg
                                    className={`w-4 h-4 transition-transform ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Acordeón de detalles */}
                            {isExpanded && (
                              <div className="p-6 border-t bg-white animate-slide-in">
                                <div className="space-y-6">
                                  {/* Línea de tiempo de estados - Simplified 5 steps */}
                                  <div className="relative">
                                    <h4 className="font-bold text-primary-dark mb-6 border-b pb-2">
                                      Seguimiento del pedido
                                    </h4>

                                    <div className="space-y-4">
                                      {/* Paso 1: Pedido confirmado (always shown) */}
                                      <div
                                        className="flex gap-4 items-start animate-fade-in"
                                        style={{ animationDelay: "0ms" }}
                                      >
                                        <div
                                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                            order.confirmado
                                              ? "bg-primary text-white shadow-lg shadow-green-200"
                                              : "bg-gray-200 text-gray-500"
                                          }`}
                                        >
                                          <FaCheckCircle className="text-lg" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-semibold text-sm text-primary-dark">
                                            Pedido confirmado
                                          </p>
                                          <p className="text-xs text-neutral-gray">
                                            {order.confirmado || formattedDate}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Paso 2: Recepcionado */}
                                      <div
                                        className="flex gap-4 items-start animate-fade-in"
                                        style={{ animationDelay: "100ms" }}
                                      >
                                        <div
                                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                            order.pendienteArreglo
                                              ? "bg-primary text-white shadow-lg shadow-green-200"
                                              : "bg-gray-200 text-gray-500"
                                          }`}
                                        >
                                          <FaBox className="text-lg" />
                                        </div>
                                        <div className="flex-1">
                                          <p
                                            className={`font-semibold text-sm ${
                                              order.pendienteArreglo
                                                ? "text-primary-dark"
                                                : "text-gray-400"
                                            }`}
                                          >
                                            Recepcionado
                                          </p>
                                          <p className="text-xs text-neutral-gray">
                                            {order.pendienteArreglo || "-"}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Paso 3: Despacho/Planificado */}
                                      <div
                                        className="flex gap-4 items-start animate-fade-in"
                                        style={{ animationDelay: "200ms" }}
                                      >
                                        <div
                                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                            order.enRuta
                                              ? "bg-primary text-white shadow-lg shadow-green-200"
                                              : "bg-gray-200 text-gray-500"
                                          }`}
                                        >
                                          <FaClock className="text-lg" />
                                        </div>
                                        <div className="flex-1">
                                          <p
                                            className={`font-semibold text-sm ${
                                              order.enRuta
                                                ? "text-primary-dark"
                                                : "text-gray-400"
                                            }`}
                                          >
                                            Despacho/Planificado
                                          </p>
                                          <p className="text-xs text-neutral-gray">
                                            {order.enRuta
                                              ? new Date(
                                                  order.enRuta,
                                                ).toLocaleDateString("es-PE", {
                                                  day: "2-digit",
                                                  month: "short",
                                                })
                                              : "-"}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Paso 4: En Ruta */}
                                      <div
                                        className="flex gap-4 items-start animate-fade-in"
                                        style={{ animationDelay: "300ms" }}
                                      >
                                        <div
                                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                            order.enRuta
                                              ? "bg-primary text-white shadow-lg shadow-green-200 animate-pulse"
                                              : "bg-gray-200 text-gray-500"
                                          }`}
                                        >
                                          <FaTruck className="text-lg" />
                                        </div>
                                        <div className="flex-1">
                                          <p
                                            className={`font-semibold text-sm ${
                                              order.enRuta
                                                ? "text-primary-dark"
                                                : "text-gray-400"
                                            }`}
                                          >
                                            En Ruta
                                          </p>
                                          <p className="text-xs text-neutral-gray">
                                            {order.enRuta || "-"}
                                          </p>
                                          {order.enRuta && !order.entregado && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                                              Estado actual
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Paso 5: Entregado */}
                                      <div
                                        className="flex gap-4 items-start animate-fade-in"
                                        style={{ animationDelay: "400ms" }}
                                      >
                                        <div
                                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                            order.entregado
                                              ? "bg-primary text-white shadow-lg shadow-green-200"
                                              : "bg-gray-200 text-gray-500"
                                          }`}
                                        >
                                          <FaHome className="text-lg" />
                                        </div>
                                        <div className="flex-1">
                                          <p
                                            className={`font-semibold text-sm ${
                                              order.entregado
                                                ? "text-primary-dark"
                                                : "text-gray-400"
                                            }`}
                                          >
                                            Entregado
                                          </p>
                                          <p className="text-xs text-neutral-gray">
                                            {order.entregado || "-"}
                                          </p>
                                          {order.entregado && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                                              Completado
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex justify-end pt-4 border-t">
                                    <Link
                                      className="w-full md:w-auto bg-primary text-white py-2 px-4 rounded-full text-xs"
                                      href={`/rastreo/${order.id}`}
                                    >
                                      Seguir pedido
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col-reverse md:flex-row justify-between mt-8 pt-6 border-t gap-6 text-center items-center">
                    <Link
                      href="/mi-cuenta"
                      className="text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Volver
                    </Link>
                    {/* <Button variant="primary" size="md">
                      Guardar
                    </Button> */}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes fade-in {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slide-in {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
          .animate-slide-in {
            animation: slide-in 0.4s ease-out both;
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
