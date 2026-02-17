// pages/rastreo.tsx
"use client";

import { useState } from "react";
import logger from "@/lib/logger";
import Layout from "@/components/Layout";
import Image from "next/image";
import {
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaBox,
  FaHome,
} from "react-icons/fa";
import Button from "@/components/ui/Button";
import { getPackageStatus } from "@/lib/orders";
import type { TrackingState, PackageProduct } from "@/lib/orders";

// SAVAR API Response Interfaces
interface SAVAREstado {
  vCodEstado: string;
  vNombreEstado: string;
  dFechaEstado: string;
  vMotivo: string;
  vCodMotivo: string;
  lstfotos: string[];
}

interface SAVARPackageResponse {
  nIdePaquete: number;
  vcodpaquete: string;
  vCodSubServicio: string;
  vSubServicio: string;
  vfechadetalleestado: string;
  vRutaSeguimiento: string;
  Estados: SAVAREstado[];
}

interface EstadoPedido {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  completado: boolean;
  activo: boolean;
}

interface PedidoInfo {
  numero: string;
  fecha: string;
  producto: PackageProduct;
  estados: EstadoPedido[];
}

// Helper Functions
function formatDate(
  isoDate: string,
  type: "date" | "time" | "full" = "full",
): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);

  if (type === "date") {
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (type === "time") {
    return date.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return date.toLocaleString("es-PE");
}

// Simplified status mapping for customer-facing display
interface SimplifiedStatus {
  code: string;
  name: string;
  description: string;
}

const SIMPLIFIED_STATUSES: SimplifiedStatus[] = [
  {
    code: "confirmed",
    name: "Pedido confirmado",
    description: "Tu pedido ha sido confirmado y está siendo procesado",
  },
  {
    code: "received",
    name: "Recepcionado",
    description: "Hemos recibido tu pedido en nuestro almacén",
  },
  {
    code: "planned",
    name: "Despacho/Planificado",
    description: "Tu pedido está siendo preparado para el despacho",
  },
  {
    code: "in_route",
    name: "En Ruta",
    description: "Tu pedido está en camino",
  },
  {
    code: "delivered",
    name: "Entregado",
    description: "Tu pedido ha sido entregado. ¡Gracias por tu compra!",
  },
];

// Map SAVAR status codes to simplified statuses
function mapSAVARCodeToSimplified(savarCode: string): string | null {
  const codeMap: Record<string, string> = {
    "30": "received", // Recepcionado
    "7": "planned", // Despacho/Planificado
    "8": "in_route", // Despacho/En ruta
    "9": "delivered", // Entregado (assuming code 9 is delivered)
    "10": "delivered", // Alternative delivered code
  };

  return codeMap[savarCode] || null;
}

function getDescriptionForStatus(statusName: string): string {
  const status = SIMPLIFIED_STATUSES.find((s) => s.name === statusName);
  return status?.description || "Estado actualizado";
}

function mapSAVARToUI(savarData: any): PedidoInfo {
  const estados = savarData.Estados || [];

  // Build a map of SAVAR statuses by simplified code
  const simplifiedStatusMap = new Map<string, SAVAREstado>();

  // Process all SAVAR statuses and keep only the latest for each simplified status
  estados.forEach((estado: SAVAREstado) => {
    const simplifiedCode = mapSAVARCodeToSimplified(estado.vCodEstado);
    if (simplifiedCode) {
      // Keep the latest occurrence of each status
      if (
        !simplifiedStatusMap.has(simplifiedCode) ||
        new Date(estado.dFechaEstado) >
          new Date(simplifiedStatusMap.get(simplifiedCode)!.dFechaEstado)
      ) {
        simplifiedStatusMap.set(simplifiedCode, estado);
      }
    }
  });

  // Determine the current step index (furthest reached)
  let currentStepIndex = 0; // Default to "Pedido confirmado"
  SIMPLIFIED_STATUSES.forEach((status, index) => {
    if (simplifiedStatusMap.has(status.code)) {
      currentStepIndex = index;
    }
  });

  // Map all 5 steps to UI states
  const finalEstados: EstadoPedido[] = SIMPLIFIED_STATUSES.map(
    (simplifiedStatus, index) => {
      const savarEstado = simplifiedStatusMap.get(simplifiedStatus.code);
      const isCompleted = index <= currentStepIndex;
      const isActive = index === currentStepIndex;

      return {
        id: simplifiedStatus.code,
        titulo: simplifiedStatus.name,
        descripcion:
          savarEstado?.vMotivo ||
          (isCompleted
            ? getDescriptionForStatus(simplifiedStatus.name)
            : "Pendiente"),
        fecha: savarEstado ? formatDate(savarEstado.dFechaEstado, "date") : "",
        hora: savarEstado ? formatDate(savarEstado.dFechaEstado, "time") : "",
        completado: isCompleted,
        activo: isActive,
      };
    },
  );

  return {
    numero: savarData.vcodpaquete,
    fecha: formatDate(savarData.vfechadetalleestado),
    producto: {
      nombre: `Envío ${savarData.vSubServicio || "Express"}`,
      talla: `Paquete #${savarData.vcodpaquete}`,
      precio: 0,
      imagen: "/images/productos/liwilu_producto_example.png",
    },
    estados: finalEstados,
  };
}

export default function RastreoPedido() {
  const [numeroPedido, setNumeroPedido] = useState("");
  const [pedidoEncontrado, setPedidoEncontrado] = useState<PedidoInfo | null>(
    null,
  );
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");

  const handleBuscarPedido = async () => {
    setError("");
    setPedidoEncontrado(null);

    if (!numeroPedido.trim()) {
      setError("Por favor ingresa un número de pedido");
      return;
    }

    setBuscando(true);

    // Remove # if present
    const numeroLimpio = numeroPedido.replace("#", "");

    try {
      // Call real API endpoint
      const response = await getPackageStatus(numeroLimpio);

      // Check if response has valid packet ID (SAVAR structure)
      if (response && response.nIdePaquete) {
        const mappedData = mapSAVARToUI(response);
        setPedidoEncontrado(mappedData);
      } else {
        setError(
          "No se encontró el pedido. Verifica el número e intenta nuevamente.",
        );
      }
    } catch (error: any) {
      logger.error("Error fetching package status:", error);

      // Check if it's a 404 package not found error
      if (error.isPackageNotFound || error.statusCode === 404) {
        setError(
          `No se encontró el paquete #${numeroLimpio}. Por favor verifica el número de seguimiento e intenta nuevamente.`,
        );
      } else {
        setError(
          error.message ||
            "Ocurrió un error al buscar el pedido. Por favor intenta nuevamente más tarde.",
        );
      }
    } finally {
      setBuscando(false);
    }
  };

  const getIconoEstado = (titulo: string) => {
    switch (titulo) {
      case "Pedido ingresado":
        return <FaCheckCircle />;
      case "Pedido confirmado":
        return <FaBox />;
      case "Pendiente de armado":
        return <FaClock />;
      case "Ruta":
        return <FaTruck />;
      case "Entregado":
        return <FaHome />;
      default:
        return <FaCheckCircle />;
    }
  };

  return (
    <Layout
      title="Rastreo de Pedido - Liwilu"
      description="Rastrea tu pedido"
      background={true}
    >
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Sección de búsqueda */}
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 relative overflow-hidden z-10">
            {/* Decoración de fondo */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

            <div className="relative">
              <h1 className="text-3xl font-semibold text-gray-900 mb-3">
                Rastrea tu pedido
              </h1>
              <p className="text-gray-600 mb-6">
                Por favor ingresa el número de pedido o tracking para conocer el
                estado de tu compra
              </p>

              <div className="flex gap-3 md:flex-row flex-col">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={numeroPedido}
                    onChange={(e) => setNumeroPedido(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleBuscarPedido()
                    }
                    placeholder="ej. 2153603"
                    className="w-full px-6 py-2 border-2 border-gray-200 rounded-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition text-lg"
                  />
                  <FaSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {/* <button
                                    onClick={handleBuscarPedido}
                                    disabled={buscando}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {buscando ? 'Buscando...' : 'Buscar'}
                                </button> */}
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleBuscarPedido}
                  disabled={buscando}
                >
                  Buscar
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Resultado del pedido */}
          {pedidoEncontrado && (
            <div className="space-y-6 animate-fade-in">
              {/* Timeline de estados */}
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
                <div className="relative">
                  <div className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Pedido en camino
                    </h2>

                    {/* Información del pedido */}
                    {/* <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-1">
                        {pedidoEncontrado.producto.talla}
                      </p>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        PD. {pedidoEncontrado.numero}
                      </h3>
                      <p className="text-gray-600">{pedidoEncontrado.fecha}</p>
                    </div> */}
                  </div>
                  <div className="p-8">
                    {pedidoEncontrado.estados.map((estado, index) => (
                      <div
                        key={estado.id}
                        className="relative pb-10 last:pb-0 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Línea vertical */}
                        {index !== pedidoEncontrado.estados.length - 1 && (
                          <div
                            className={`absolute md:left-44 left-6 top-12 w-0.5 h-full -ml-px ${
                              estado.completado
                                ? "border border-dashed border-primary"
                                : "border border-dashed border-gray-300"
                            }`}
                          ></div>
                        )}

                        <div className="flex gap-6 items-start">
                          {/* Fecha y hora */}
                          <div className="w-32 flex-shrink-0 pt-1 md:block hidden">
                            {estado.fecha && (
                              <>
                                <p className="text-lg font-semibold text-gray-900">
                                  {estado.fecha}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {estado.hora}
                                </p>
                              </>
                            )}
                          </div>

                          {/* Icono */}
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl z-10 transition-all duration-300 ${
                              estado.completado
                                ? "bg-green-500 text-white shadow-lg shadow-green-200"
                                : estado.activo
                                  ? "bg-green-500 text-white shadow-lg shadow-green-200 animate-pulse"
                                  : "bg-gray-300 text-gray-500"
                            }`}
                          >
                            {getIconoEstado(estado.titulo)}
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 pt-1">
                            <h3
                              className={`text-xl font-semibold mb-2 transition-colors ${
                                estado.completado || estado.activo
                                  ? "text-primary-dark"
                                  : "text-gray-400"
                              }`}
                            >
                              {estado.titulo}
                            </h3>
                            <p
                              className={`text-sm transition-colors ${
                                estado.completado || estado.activo
                                  ? "text-gray-700"
                                  : "text-gray-400"
                              }`}
                            >
                              {estado.descripcion}
                            </p>

                            {/* Badge de estado activo */}
                            {estado.activo && (
                              <span className="inline-block mt-3 px-4 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full animate-pulse-subtle">
                                Estado actual
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              {/* <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow">
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      ¿Tienes alguna pregunta sobre tu pedido?
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Nuestro equipo de atención al cliente está disponible para
                      ayudarte
                    </p>
                    <div className="flex gap-3 md:flex-row flex-col">
                      <a
                        href="/contacto"
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Contactar soporte →
                      </a>
                      <a
                        href="/ayuda"
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Centro de ayuda →
                      </a>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          )}

          {/* Mensaje inicial cuando no hay búsqueda */}
          {!pedidoEncontrado && !error && !buscando && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTruck className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Ingresa tu número de pedido
              </h3>
              <p className="text-gray-500">
                Para comenzar a rastrear tu compra
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-subtle {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </Layout>
  );
}
