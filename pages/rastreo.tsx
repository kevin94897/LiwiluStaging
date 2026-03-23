// pages/rastreo.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import logger from "@/lib/logger";
import Layout from "@/components/Layout";
import { FaSearch, FaTruck } from "react-icons/fa";
import Button from "@/components/ui/Button";

export default function RastreoPedido() {
  const router = useRouter();
  const [numeroPedido, setNumeroPedido] = useState("");
  const [error, setError] = useState("");

  const handleBuscarPedido = () => {
    setError("");

    if (!numeroPedido.trim()) {
      setError("Por favor ingresa un número de pedido");
      return;
    }

    // Remove # if present and navigate to /rastreo/[id]
    const numeroLimpio = numeroPedido.replace("#", "").trim();
    router.push(`/rastreo/${numeroLimpio}`);
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
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleBuscarPedido}
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

          {/* Mensaje inicial */}
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
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </Layout>
  );
}