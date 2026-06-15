import { useState, useEffect, useCallback } from "react";
import logger from "@/lib/logger";
import Layout from "@/components/Layout";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import AccountSidebar from "@/components/AccountSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProductReviewModal from "@/components/ProductReviewModal";
import {
  getMyOrders,
  getPackageStatus,
  getPickupStatus,
  Order,
} from "@/lib/orders";
import { FaCheckCircle, FaClock, FaTruck, FaBox, FaHome, FaWallet, FaFileDownload, FaStar } from "react-icons/fa";

// ─── Tracking helpers (mirrors rastreo/[id].tsx) ────────────────────────────

function formatTrackingDate(
  isoDate: string,
  type: "date" | "time" = "date",
): string {
  const d = new Date(isoDate);
  if (type === "time")
    return d.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const FIXED_STEPS = [
  {
    id: "confirmado",
    titulo: "Pedido confirmado",
    keywords: ["confirmado", "creado"],
    codes: [] as string[],
  },
  {
    id: "recepcionado",
    titulo: "Recepcionado",
    keywords: ["almacén", "recepcion"],
    codes: ["30"],
  },
  {
    id: "planificado",
    titulo: "Despacho/Planificado",
    keywords: ["planificado", "preparado", "despacho"],
    codes: [] as string[],
  },
  {
    id: "ruta",
    titulo: "En Ruta",
    keywords: ["ruta", "camino"],
    codes: [] as string[],
  },
  {
    id: "entregado",
    titulo: "Entregado",
    keywords: ["entregado"],
    codes: [] as string[],
  },
];

const PICKUP_STEPS = [
  {
    id: "confirmado",
    titulo: "Pedido confirmado",
    code: "CONFIRMADO",
    descripcion: "Tu pedido ha sido recibido y está siendo procesado.",
  },
  {
    id: "sin_armado",
    titulo: "Pedido recibido",
    code: "P",
    descripcion: "Estamos preparando los productos de tu pedido.",
  },
  {
    id: "armado",
    titulo: "Armado / Listo para recoger",
    code: "A",
    descripcion: "Tu pedido ya está listo en el local seleccionado.",
  },
  {
    id: "entregado",
    titulo: "Entregado",
    code: "E",
    descripcion: "El pedido ha sido entregado exitosamente.",
  },
];

function getStepIndexForStatus(statusName: string, statusCode: string): number {
  const s = statusName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (s.includes("entregado")) return 4;
  if (s.includes("ruta") || s.includes("camino")) return 3;
  if (
    s.includes("planificado") ||
    s.includes("preparado") ||
    s.includes("despacho")
  )
    return 2;
  if (
    ["21", "30"].includes(statusCode) ||
    s.includes("almacen") ||
    s.includes("recepcion") ||
    s.includes("fulfillment")
  )
    return 1;
  return 0;
}

interface TrackingStep {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  completado: boolean;
  activo: boolean;
}

function mapSAVARToSteps(savarData: any): TrackingStep[] {
  const estadosApi = savarData.Estados || [];
  let currentStepIndex = 0;
  estadosApi.forEach((e: any) => {
    const idx = getStepIndexForStatus(e.vNombreEstado, e.vCodEstado);
    if (idx > currentStepIndex) currentStepIndex = idx;
  });
  return FIXED_STEPS.map((step, index) => {
    let apiMatch =
      step.codes.length > 0
        ? estadosApi.find((e: any) => step.codes.includes(e.vCodEstado))
        : estadosApi.find((e: any) =>
          step.keywords.some((k) =>
            e.vNombreEstado.toLowerCase().includes(k),
          ),
        );
    let fecha = apiMatch
      ? formatTrackingDate(apiMatch.dFechaEstado, "date")
      : "";
    let hora = apiMatch
      ? formatTrackingDate(apiMatch.dFechaEstado, "time")
      : "";
    if (index === 0 && !apiMatch && estadosApi.length > 0) {
      fecha = formatTrackingDate(estadosApi[0].dFechaEstado, "date");
      hora = formatTrackingDate(estadosApi[0].dFechaEstado, "time");
    }
    const isCompleted = index <= currentStepIndex;
    const isActive = index === currentStepIndex;
    return {
      id: step.id,
      titulo: step.titulo,
      descripcion:
        apiMatch?.vMotivo ||
        (isCompleted
          ? index === 0
            ? "Tu pedido ha sido confirmado exitosamente"
            : "Estado actualizado"
          : "Pendiente"),
      fecha,
      hora,
      completado: isCompleted,
      activo: isActive,
    };
  });
}

function mapPickupToSteps(pickupData: any[]): TrackingStep[] {
  const current = pickupData[0] || {};
  const code = current.EstadoDespacho;
  let currentIndex = 0;
  if (code === "P") currentIndex = 1;
  else if (code === "A") currentIndex = 2;
  else if (code === "E" || code === "B" || code === "X") currentIndex = 3;
  return PICKUP_STEPS.map((step, index) => {
    const isCompleted = index <= currentIndex;
    const isActive = index === currentIndex;
    let titulo = step.titulo;
    if (isActive && code === "B") titulo = "Anulado";
    if (isActive && code === "X") titulo = "Caducado";
    return {
      id: step.id,
      titulo,
      descripcion: step.descripcion,
      fecha: isActive
        ? formatTrackingDate(new Date().toISOString(), "date")
        : "",
      hora: isActive
        ? formatTrackingDate(new Date().toISOString(), "time")
        : "",
      completado: isCompleted,
      activo: isActive,
    };
  });
}

function formatReviewDate(isoDate?: string): string {
  if (!isoDate) return "";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

function ReviewStars({ rating }: { rating: number }) {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating || 0)));

  return (
    <div className="flex items-center gap-0.5" aria-label={`${normalizedRating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={12}
          className={star <= normalizedRating ? "text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MisPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewProduct, setSelectedReviewProduct] = useState<{
    orderId: number;
    productId: number;
    productName: string;
    productImage?: string;
  } | null>(null);

  // Per-order tracking state
  const [trackingSteps, setTrackingSteps] = useState<
    Record<number, TrackingStep[]>
  >({});
  const [trackingLoading, setTrackingLoading] = useState<
    Record<number, boolean>
  >({});
  const [trackingError, setTrackingError] = useState<Record<number, string>>(
    {},
  );

  const openReviewModal = (
    orderId: number,
    productId: number,
    productName: string,
    productImage?: string
  ) => {
    setSelectedReviewProduct({
      orderId,
      productId,
      productName,
      productImage,
    });
    setReviewModalOpen(true);
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyOrders();
      if (response.success) {
        setOrders(response.data);
        setError(null);
      } else {
        setError("No se pudieron cargar los pedidos");
      }
    } catch (err: any) {
      logger.error("Error fetching orders:", err);
      setError(err.message || "Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleOrderDetails = async (orderId: number, order: Order) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    // Only fetch if not already loaded
    if (trackingSteps[orderId]) return;
    setTrackingLoading((prev) => ({ ...prev, [orderId]: true }));
    setTrackingError((prev) => ({ ...prev, [orderId]: "" }));
    try {
      const idStr = String(orderId);
      if (order.deliveryType === "RETIRO_TIENDA") {
        const data = await getPickupStatus(idStr);
        setTrackingSteps((prev) => ({
          ...prev,
          [orderId]: mapPickupToSteps(data),
        }));
      } else {
        const data = await getPackageStatus(idStr);
        setTrackingSteps((prev) => ({
          ...prev,
          [orderId]: mapSAVARToSteps(data),
        }));
      }
    } catch (err: any) {
      setTrackingError((prev) => ({
        ...prev,
        [orderId]: err.message || "No se pudo obtener el estado del pedido",
      }));
    } finally {
      setTrackingLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
                            .replace(",", "")
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
                                  className="flex gap-4 items-start pb-4 border-b last:border-b-0 last:pb-0"
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
                                    {order.paymentStatus === "COMPLETED" && (
                                      item.hasReview && item.review ? (
                                        <div className="mt-3 rounded-md border border-yellow-100 bg-yellow-50/60 px-3 py-2">
                                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <ReviewStars rating={item.review.rating} />
                                            <span className="text-xs font-semibold text-primary-dark">
                                              Tu reseña
                                            </span>
                                            {item.review.createdAt && (
                                              <span className="text-[10px] text-gray-500">
                                                {formatReviewDate(item.review.createdAt)}
                                              </span>
                                            )}
                                          </div>
                                          {item.review.comment && (
                                            <p className="mt-1 text-xs text-gray-700 whitespace-pre-line">
                                              {item.review.comment.trim()}
                                            </p>
                                          )}
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            openReviewModal(
                                              order.id,
                                              item.prestashopId,
                                              item.name,
                                              item.image
                                            )
                                          }
                                          className="mt-2 inline-flex items-center gap-1 text-xs md:text-sm text-primary hover:text-primary-dark font-semibold transition"
                                        >
                                          <FaStar size={12} />
                                          Dejar reseña
                                        </button>
                                      )
                                    )}
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
                                  onClick={() =>
                                    toggleOrderDetails(order.id, order)
                                  }
                                  className="text-primary hover:text-primary-dark font-semibold text-sm flex items-center gap-2 transition-all"
                                >
                                  {isExpanded
                                    ? "Ocultar detalles"
                                    : "Ver detalles"}{" "}
                                  <svg
                                    className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""
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
                                  {/* Línea de tiempo de estados */}
                                  <div className="relative">
                                    <h4 className="font-bold text-primary-dark mb-4 border-b pb-2">
                                      Seguimiento del pedido
                                    </h4>

                                    

                                    {/* Timeline Dynamic Loading */}
                                    {trackingLoading[order.id] ? (
                                      <div className="py-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-xs text-gray-400">
                                          Consultando estado real...
                                        </p>
                                      </div>
                                    ) : trackingError[order.id] ? (
                                      <div className="py-4 text-center bg-red-50 rounded-lg border border-red-100">
                                        <p className="text-xs text-red-500">
                                          {trackingError[order.id]}
                                        </p>
                                        <button
                                          onClick={() =>
                                            toggleOrderDetails(order.id, order)
                                          }
                                          className="text-primary text-[10px] font-bold mt-1 underline"
                                        >
                                          Reintentar
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="space-y-2 my-6">
                                        {(trackingSteps[order.id] || []).map(
                                          (step, i) => (
                                            <div
                                              key={step.id}
                                              className="flex gap-4 items-start animate-fade-in"
                                              style={{
                                                animationDelay: `${i * 100}ms`,
                                              }}
                                            >
                                              <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${step.completado
                                                  ? step.activo
                                                    ? "bg-primary text-white shadow-lg shadow-green-200 animate-pulse"
                                                    : "bg-primary text-white shadow-lg shadow-green-200"
                                                  : "bg-gray-200 text-gray-400"
                                                  }`}
                                              >
                                                {step.id === "confirmado" && (
                                                  <FaCheckCircle className="text-base" />
                                                )}
                                                {(step.id === "recepcionado" ||
                                                  step.id === "sin_armado") && (
                                                    <FaBox className="text-base" />
                                                  )}
                                                {(step.id === "planificado" ||
                                                  step.id === "armado") && (
                                                    <FaClock className="text-base" />
                                                  )}
                                                {step.id === "ruta" && (
                                                  <FaTruck className="text-base" />
                                                )}
                                                {step.id === "entregado" && (
                                                  <FaHome className="text-base" />
                                                )}
                                              </div>
                                              <div className="flex-1">
                                                <p
                                                  className={`font-semibold text-sm ${step.completado ? "text-primary-dark" : "text-gray-400"}`}
                                                >
                                                  {step.titulo}
                                                </p>
                                                <p className="text-[10px] md:text-xs text-neutral-gray">
                                                  {step.fecha
                                                    ? `${step.fecha} ${step.hora}`
                                                    : "Pendiente"}
                                                </p>
                                                {step.activo && (
                                                  <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                                                    Estado actual
                                                  </span>
                                                )}
                                                {step.id === "entregado" &&
                                                  step.completado && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                                                      Completado
                                                    </span>
                                                  )}
                                              </div>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Info de la tienda para Pickups */}
                                    {order.deliveryType === "RETIRO_TIENDA" &&
                                      order.deliveryInfo?.desAlmacen && (
                                        <div className="bg-green-50 border border-primary/20 rounded-sm p-3 mb-4 text-xs text-primary mt-4">
                                          <p className="font-bold mb-2 text-primary-dark">
                                            {order.deliveryInfo.desAlmacen}
                                          </p>
                                          {order.deliveryInfo
                                            .direccionAlmacen && (
                                              <p className="text-gray-700">
                                                {
                                                  order.deliveryInfo
                                                    .direccionAlmacen
                                                }
                                              </p>
                                            )}
                                          {order.deliveryInfo.atencion && (
                                            <p className="text-gray-700 mt-0.5">
                                              {order.deliveryInfo.atencion}
                                            </p>
                                          )}
                                        </div>
                                      )}

                                {/* Pago Trimegisto */}
                                {order.paymentData?.trismegistoInfo && (
                                  <div className="bg-green-50 border border-primary/20 rounded-lg p-4 mt-2">
                                    <h4 className="font-bold text-primary-dark mb-3 flex items-center gap-2 text-sm">
                                      <FaWallet className="text-primary" size={14} />
                                      Pago con saldo Trimegisto
                                    </h4>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-700">
                                      <div>
                                        <span className="text-gray-500">Saldo aplicado</span>
                                        <p className="font-semibold text-primary">
                                          S/ {order.paymentData.trismegistoInfo.balanceAmount.toFixed(2)}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Cuotas</span>
                                        <p className="font-semibold">
                                          {order.paymentData.trismegistoInfo.balanceInstallments === 1
                                            ? "Al contado"
                                            : `${order.paymentData.trismegistoInfo.balanceInstallments} cuotas de S/ ${(order.paymentData.trismegistoInfo.balanceAmount / order.paymentData.trismegistoInfo.balanceInstallments).toFixed(2)}`}
                                        </p>
                                      </div>
                                      {(order.paymentData.trismegistoInfo.cardAmount ?? 0) > 0 && (
                                        <div>
                                          <span className="text-gray-500">Monto con tarjeta</span>
                                          <p className="font-semibold">
                                            S/ {order.paymentData.trismegistoInfo.cardAmount.toFixed(2)}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    {order.paymentData.trismegistoInfo.trismegistoDocumentUrl && (
                                      <div className="mt-3 pt-3 border-t border-primary/10">
                                        <a
                                          href={`${process.env.NEXT_PUBLIC_API_URL}${order.paymentData.trismegistoInfo.trismegistoDocumentUrl}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary-dark transition"
                                        >
                                          <FaFileDownload size={14} />
                                          Descargar documento
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* <div className="flex justify-end pt-4 border-t">
                                  <Link
                                    className="w-full md:w-auto bg-primary text-white py-2 px-4 rounded-full text-xs"
                                    href={`/rastreo/${order.id}`}
                                  >
                                    Seguir pedido
                                  </Link>
                                </div> */}
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

        {/* Review Modal */}
        {selectedReviewProduct && (
          <ProductReviewModal
            isOpen={reviewModalOpen}
            onClose={() => {
              setReviewModalOpen(false);
              setSelectedReviewProduct(null);
            }}
            orderId={selectedReviewProduct.orderId}
            productId={selectedReviewProduct.productId}
            productName={selectedReviewProduct.productName}
            productImage={selectedReviewProduct.productImage}
            onReviewSubmitted={async () => {
              await fetchOrders();
              setReviewModalOpen(false);
              setSelectedReviewProduct(null);
            }}
          />
        )}
      </Layout>
    </ProtectedRoute>
  );
}
