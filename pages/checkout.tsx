// pages/checkout.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getProductImageUrl, formatPrice, getProductName } from "@/lib/utils";
import { Product } from "@/lib/catalog";
import { FaCreditCard, FaMoneyBillWave, FaTimes } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Script from "next/script";
import { openCulqi, configureCulqi, closeCulqi } from "@/lib/culqi";
import { showToast } from "@/lib/notifications";
import { validateDNI, validateRUC } from "@/lib/validations";
import {
  createOrder,
  payOrder,
  getCheckoutSummary,
  validateStock,
  validateSavarStock,
} from "@/lib/cart";
import { useAuth } from "@/hooks/useAuth";
import { consultaRUC } from "@/lib/general";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import ProcessingOverlay from "@/components/checkout/ProcessingOverlay";
import ErrorModal from "@/components/ui/ErrorModal";
import logger from "@/lib/logger";

type TipoComprobante = "boleta" | "factura";
type MetodoPago = "tarjeta" | "yape" | "efectivo";

export default function Checkout() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { items, getCartTotal, clearCart, totals, syncCart, cartId } =
    useCart();
  const [tipoComprobante, setTipoComprobante] =
    useState<TipoComprobante>("boleta");
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<
    "creating-order" | "processing-payment" | "completing"
  >("creating-order");
  const [culqiReady, setCulqiReady] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const processingToken = useRef<string | null>(null);

  // Estado para el modal de error
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });



  // Datos para Boleta
  const [tipoDocumentoBoleta, setTipoDocumentoBoleta] = useState("DNI");
  const [datosBoletaRUC, setDatosBoletaRUC] = useState("");

  // Datos para Factura
  const [datosFactura, setDatosFactura] = useState({
    ruc: "",
    razonSocial: "",
    direccionFiscal: "",
  });

  const [isConsultingRuc, setIsConsultingRuc] = useState(false);
  const [rucConsulted, setRucConsulted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isVerifyingStock, setIsVerifyingStock] = useState(true);
  const [stockErrorMessage, setStockErrorMessage] = useState("");

  // Modo de simulación/prueba
  const [testMode, setTestMode] = useState(false);
  const [simulateRejection, setSimulateRejection] = useState(false);

  const subtotal = getCartTotal();
  const envio = totals.shipping;
  const total = subtotal + envio;

  // Sync cart on mount to ensure shipping cost is current
  useEffect(() => {
    syncCart();
  }, []);

  // Manejar cierre del modal de Culqi
  useEffect(() => {
    const handleCulqiModalClosed = () => {
      logger.log("🔄 Modal cerrado - reseteando estado de procesamiento");
      setProcessing(false);
      // Mantener currentOrderId para permitir reintentar el pago
    };

    if (typeof window !== "undefined") {
      window.addEventListener("culqi-modal-closed", handleCulqiModalClosed);
      return () => {
        window.removeEventListener(
          "culqi-modal-closed",
          handleCulqiModalClosed,
        );
      };
    }
  }, []);

  // Persistir estado de checkout en localStorage
  useEffect(() => {
    const checkoutState = {
      tipoComprobante,
      metodoPago,
      datosFactura,
      tipoDocumentoBoleta,
      datosBoletaRUC,
      currentOrderId,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      "liwilu_checkout_state",
      JSON.stringify(checkoutState),
    );
  }, [
    tipoComprobante,
    metodoPago,
    datosFactura,
    tipoDocumentoBoleta,
    datosBoletaRUC,
    currentOrderId,
  ]);

  // Restaurar estado de checkout al montar
  useEffect(() => {
    const saved = localStorage.getItem("liwilu_checkout_state");
    if (saved) {
      try {
        const state = JSON.parse(saved);

        // Validar que no sea muy antiguo (1 hora)
        const ONE_HOUR = 60 * 60 * 1000;
        if (Date.now() - state.timestamp < ONE_HOUR) {
          setTipoComprobante(state.tipoComprobante || "boleta");
          if (state.metodoPago) setMetodoPago(state.metodoPago);
          if (state.datosFactura) setDatosFactura(state.datosFactura);
          if (state.tipoDocumentoBoleta)
            setTipoDocumentoBoleta(state.tipoDocumentoBoleta);
          if (state.datosBoletaRUC) setDatosBoletaRUC(state.datosBoletaRUC);
          if (state.currentOrderId) setCurrentOrderId(state.currentOrderId);
          logger.log("✅ Estado de checkout restaurado desde localStorage");
        } else {
          localStorage.removeItem("liwilu_checkout_state");
          logger.log("⏰ Estado de checkout expirado, limpiado");
        }
      } catch (e) {
        logger.error("Error restaurando estado de checkout:", e);
        localStorage.removeItem("liwilu_checkout_state");
      }
    }
  }, []);

  // Verificar si Culqi ya está cargado al montar el componente (para navegaciones SPA)
  useEffect(() => {
    if (typeof window !== "undefined" && window.Culqi) {
      logger.log("⚡ Culqi ya estaba cargado al montar");
      const configured = configureCulqi();
      setCulqiReady(configured);
    }

    // Detectar modo prueba desde la URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("test") === "true") {
        logger.log("🧪 [TEST MODE] Modo de prueba activado via URL");
        setTestMode(true);
      }
    }
  }, []);

  // Check for pending transactions on mount (user may have refreshed during payment)
  useEffect(() => {
    const pendingTx = localStorage.getItem("liwilu_pending_transaction");
    if (pendingTx) {
      try {
        const tx = JSON.parse(pendingTx);
        const elapsed = Date.now() - tx.timestamp;

        // If less than 5 minutes, warn user
        if (elapsed < 5 * 60 * 1000) {
          logger.warn("⚠️ Transacción pendiente detectada:", tx);
          showToast(
            "Detectamos un pago en proceso. Si ya completaste tu compra, verifica en 'Mis Pedidos'.",
            "error",
          );
        } else {
          // Old transaction, clear it
          localStorage.removeItem("liwilu_pending_transaction");
        }
      } catch (e) {
        logger.error("Error parsing pending transaction:", e);
        localStorage.removeItem("liwilu_pending_transaction");
      }
    }
  }, []);

  // Segunda validación de stock al cargar la página
  useEffect(() => {
    const verifyStock = async () => {
      setIsVerifyingStock(true);
      try {
        const summary = await getCheckoutSummary();
        logger.log("🔍 [Checkout] Initial summary check:", summary);

        // FIXED: Check summary.data.isComplete instead of summary.isComplete
        if (!summary.success || !summary.data?.isComplete || !summary.data) {
          showToast(
            summary.message || "La información del carrito está incompleta",
            "error",
          );
          router.push("/carrito");
          return;
        }

        const { products, deliveryType, pickupStoreInfo } = summary.data;

        if (deliveryType === "DELIVERY") {
          // Validar cada producto vía Savar
          logger.log("🚚 Validando stock de despacho (Savar)...");
          const results = await Promise.all(
            products.map((p: any) =>
              validateSavarStock(p.reference, p.quantity),
            ),
          );

          const invalidItems = results.filter((r) => !r.disponible);
          if (invalidItems.length > 0) {
            const names = invalidItems
              .map((r) => {
                const p = products.find(
                  (prod: any) => prod.reference === r.reference,
                );
                return p?.name || r.reference;
              })
              .join(", ");
            throw new Error(
              `Los siguientes productos no tienen stock suficiente para delivery: ${names}`,
            );
          }
        } else if (deliveryType === "RETIRO" && pickupStoreInfo) {
          // Validar vía endpoint de almacén
          logger.log("🏪 Validando stock de retiro en tienda...");
          const productsToValidate = products.map((p: any) => ({
            reference: p.reference,
            quantity: p.quantity,
          }));

          const stockResult = await validateStock(
            [pickupStoreInfo.idAlmacen],
            productsToValidate,
          );

          const storeResult = stockResult.resultadosPorAlmacen.find(
            (r) => r.idAlmacen === pickupStoreInfo.idAlmacen,
          );

          if (!storeResult || !storeResult.todosDisponibles) {
            const invalidNames =
              storeResult?.productos
                .filter((p) => !p.disponible)
                .map((p) => p.nomArticulo)
                .join(", ") || "algunos productos";
            throw new Error(
              `Los siguientes productos no tienen stock suficiente en la tienda seleccionada: ${invalidNames}`,
            );
          }
        }

        logger.log("✅ Validación de stock exitosa en checkout");
        setIsVerifyingStock(false);
      } catch (error: any) {
        logger.error("❌ Error en validación de stock de checkout:", error);
        showToast(
          error.message || "Error al verificar el stock disponible",
          "error",
        );
        router.push("/carrito");
      }
    };

    verifyStock();
  }, [router]);

  // Configurar Culqi cuando el script esté listo
  const handleCulqiLoad = () => {
    logger.log("📦 Script de Culqi cargado");
    const configured = configureCulqi();
    setCulqiReady(configured);
  };

  // Manejar el token de Culqi
  useEffect(() => {
    window.culqi = async () => {
      if (window.Culqi.token) {
        const token = window.Culqi.token;
        logger.log("✅ Token de Culqi recibido:", token.id);

        if (processingToken.current === token.id) {
          logger.warn(
            "⚠️ Token ya procesado o en proceso, ignorando duplicado:",
            token.id,
          );
          showToast(
            "Este pago ya está siendo procesado. Por favor espera.",
            "error",
          );
          return;
        }
        processingToken.current = token.id;

        // CERRAR MODAL INMEDIATAMENTE para evitar múltiples clicks
        closeCulqi();

        // SIMULACIÓN DE RECHAZO (Si el modo prueba está activo)
        if (testMode && simulateRejection) {
          logger.log(
            "🧪 [SIMULACIÓN] Interceptando token para simular rechazo...",
          );
          setProcessing(true);
          setTimeout(() => {
            logger.log("❌ [SIMULACIÓN] Venta denegada");
            showToast(
              "Operación denegada. Intente nuevamente ó utilice otra tarjeta.",
              "error",
            );
            setProcessing(false);
            closeCulqi();
            // Permitimos re-usar el token en la simulación reseteando el processingToken
            processingToken.current = null;
          }, 2000);
          return;
        }

        try {
          if (!currentOrderId) {
            throw new Error("No se ha generado un ID de orden para el pago");
          }

          setProcessing(true);
          setProcessingStage("processing-payment");

          // 1. Obtener email (Usuario o Invitado)
          let email = "";
          if (isAuthenticated && user?.email) {
            email = user.email;
          } else {
            const guestDataRaw = localStorage.getItem("liwilu_guestData");
            if (guestDataRaw) {
              const guestData = JSON.parse(guestDataRaw);
              email = guestData.email;
            }
          }

          if (!email) {
            throw new Error(
              "No se encontró el correo electrónico para procesar el pago",
            );
          }

          // 2. Procesar Pago
          logger.log(`💳 Procesando pago para la orden ${currentOrderId}...`);
          const payResponse = await payOrder(currentOrderId.toString(), {
            token: token.id,
            email: email,
          });

          logger.log("📦 Payment response:", payResponse);

          // Validate payment success with new fields
          if (
            payResponse.success &&
            payResponse.data?.paymentStatus === "COMPLETED" &&
            payResponse.data?.status === "PAID" &&
            payResponse.data?.orderId
          ) {
            const confirmedOrderId = payResponse.data.orderId;
            logger.log(`✅ Pago confirmado para orden #${confirmedOrderId}`);

            setProcessingStage("completing");
            // closeCulqi(); // Ya se cerró al inicio
            showToast("💳 ¡Compra realizada con éxito!", "success");
            setIsSuccess(true);

            // Clear pending transaction
            localStorage.removeItem("liwilu_pending_transaction");

            // Save successful order ID for recovery
            localStorage.setItem(
              "liwilu_successful_order",
              JSON.stringify({
                orderId: confirmedOrderId,
                timestamp: Date.now(),
              }),
            );

            clearCart();

            // Use multiple redirect strategies for reliability on slow connections
            logger.log(`🚀 Redirigiendo a página de éxito...`);

            // Determine redirect URL (always show success page for better UX)
            const redirectUrl = `/pedido-exitoso?order=${confirmedOrderId}`;

            logger.log(
              `📍 Redirect URL: ${redirectUrl} (authenticated: ${isAuthenticated})`,
            );

            // Strategy 1: Next.js router (preferred)
            router.push(redirectUrl);

            // Strategy 2: Fallback with window.location after 2 seconds if router fails
            setTimeout(() => {
              if (window.location.pathname === "/checkout") {
                logger.warn(
                  "⚠️ Router.push no completó, usando window.location.href",
                );
                window.location.href = redirectUrl;
              }
            }, 2000);

            // Strategy 3: Force redirect after 5 seconds as last resort
            setTimeout(() => {
              if (window.location.pathname === "/checkout") {
                logger.error("❌ Forzando redirección como último recurso");
                window.location.replace(redirectUrl);
              }
            }, 5000);
          } else {
            // Payment not completed or missing required fields
            const errorMsg =
              payResponse.message ||
              "El pago no pudo ser completado. Por favor, intenta nuevamente.";
            throw new Error(errorMsg);
          }
        } catch (error: any) {
          logger.error("❌ Error en el proceso de pago/orden:", error);
          // Clear pending transaction on error
          localStorage.removeItem("liwilu_pending_transaction");

          // Si el mensaje tiene formato de stock, mostrarlo claramente
          const errorMessage = error.message || "Error al completar la compra";
          showToast(errorMessage, "error");
          setProcessing(false);
          closeCulqi();
        }
      } else if (window.Culqi.order) {
        // Manejo de pedidos (Yape/PagoEfectivo)
        const order = window.Culqi.order;
        logger.log("✅ Orden de Culqi recibida:", order);

        closeCulqi();
        showToast("📱 Orden generada. Completa el pago en tu app", "success");

        // Aquí deberías guardar la orden y redirigir a una página de espera
        const numeroPedido = Math.floor(Math.random() * 9000) + 1000;
        router.push(`/pedido-exitoso?order=${numeroPedido}&pending=true`);
      } else if (window.Culqi.order) {
        const order = window.Culqi.order;
        logger.log("✅ Orden creada en Culqi:", order);
      } else if (window.Culqi.error) {
        const error = window.Culqi.error;
        logger.log("❌ Error de Culqi:", error);
        // showToast(error.user_message || "Error en el pago", "error");
        setErrorModal({
          isOpen: true,
          message: error.user_message || "Ocurrió un error al procesar el pago. Por favor, intenta con otra tarjeta o método de pago."
        });
        setProcessing(false);
        closeCulqi();
      }
    };

  }, [
    router,
    clearCart,
    total,
    tipoComprobante,
    datosFactura,
    tipoDocumentoBoleta,
    datosBoletaRUC,
    cartId,
    isAuthenticated,
    user,
    currentOrderId,
  ]);

  const handleConsultaRUC = async () => {
    const ruc = datosFactura.ruc;
    if (!validateRUC(ruc)) {
      setErrors({
        ...errors,
        rucFactura: "Ingresa un RUC válido de 11 dígitos que empiece con 20",
      });
      return;
    }

    setIsConsultingRuc(true);
    setErrors({ ...errors, rucFactura: "" });

    try {
      const response = await consultaRUC(ruc);
      if (response.success && response.data) {
        setDatosFactura({
          ...datosFactura,
          razonSocial: response.data.nombre_o_razon_social,
          direccionFiscal: response.data.direccion_completa,
        });
        setRucConsulted(true);
        showToast("RUC consultado con éxito", "success");
      } else {
        showToast(
          response.message ||
          "No se encontró información para el RUC ingresado",
          "error",
        );
      }
    } catch (error: any) {
      showToast(error.message || "Error al consultar el RUC", "error");
    } finally {
      setIsConsultingRuc(false);
    }
  };

  // Validar campos según tipo de comprobante
  const validarDatos = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (tipoComprobante === "boleta") {
      if (!datosBoletaRUC) {
        newErrors.rucBoleta = "El número de documento es obligatorio";
      } else {
        if (tipoDocumentoBoleta === "DNI") {
          if (!/^\d{8}$/.test(datosBoletaRUC)) {
            newErrors.rucBoleta = "Ingresa un DNI válido (8 números)";
          }
        } else if (tipoDocumentoBoleta === "CE") {
          if (datosBoletaRUC.length < 6 || datosBoletaRUC.length > 12) {
            newErrors.rucBoleta = "El CE debe tener entre 6 y 12 caracteres";
          }
        } else if (tipoDocumentoBoleta === "Pasaporte") {
          if (!/^[a-zA-Z][0-9]{7}$/.test(datosBoletaRUC)) {
            newErrors.rucBoleta =
              "El pasaporte debe tener 1 letra y 7 números (ej. P1234567)";
          }
        }
      }
    } else {
      if (!datosFactura.ruc || !validateRUC(datosFactura.ruc)) {
        newErrors.rucFactura =
          "El RUC debe tener 11 números y empezar con 10, 15 o 20";
      }
      if (!datosFactura.razonSocial) {
        newErrors.razonSocial = "Ingresa la razón social";
      }
      if (!datosFactura.direccionFiscal) {
        newErrors.direccionFiscal = "Ingresa la dirección fiscal";
      }
    }

    if (!metodoPago) {
      newErrors.metodoPago = "Selecciona un método de pago";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProcesarPago = async () => {
    if (!validarDatos()) {
      showToast("Por favor completa todos los campos requeridos", "error");
      return;
    }

    // Si es pago con tarjeta o digital (Culqi)
    if (metodoPago === "tarjeta" || metodoPago === "yape") {
      let isReady = culqiReady;

      // Intento final de inicialización si no estaba listo
      if (!isReady && typeof window !== "undefined" && window.Culqi) {
        logger.log("🔄 Intentando configurar Culqi bajo demanda...");
        isReady = configureCulqi();
        setCulqiReady(isReady);
      }

      if (!isReady) {
        showToast(
          "La pasarela de pago no está lista. Por favor, espera un momento o recarga la página.",
          "error",
        );
        return;
      }

      try {
        // Mark transaction as pending to prevent duplicates on refresh
        const transactionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(
          "liwilu_pending_transaction",
          JSON.stringify({
            transactionId,
            timestamp: Date.now(),
            cartId,
            total,
          }),
        );

        setProcessing(true);
        setProcessingStage("creating-order");

        // 1. Crear la orden primero
        logger.log("📝 Generando orden...");
        const invoicePayload: any = {
          invoiceType: tipoComprobante.toUpperCase(), // "FACTURA" o "BOLETA"
        };

        if (tipoComprobante === "factura") {
          invoicePayload.invoiceData = {
            ruc: datosFactura.ruc,
            razonSocial: datosFactura.razonSocial,
            direccionFiscal: datosFactura.direccionFiscal,
          };
        } else {
          invoicePayload.invoiceData = {
            tipoDocumento: tipoDocumentoBoleta.toUpperCase(), // Backend fix: uppercase
            numeroDocumento: datosBoletaRUC,
          };
        }

        const orderResponse = await createOrder(invoicePayload);

        if (!orderResponse.success) {
          throw new Error(orderResponse.message || "Error al crear la orden");
        }

        const orderId =
          orderResponse.data?.pendingOrderId ||
          orderResponse.data?.orderId ||
          orderResponse.pendingOrderId ||
          orderResponse.orderId ||
          orderResponse.id;

        if (!orderId) {
          throw new Error("No se recibió un ID de orden del servidor");
        }

        logger.log("✅ Orden creada:", orderId);
        setCurrentOrderId(orderId);

        // Ocultar overlay para que el usuario pueda interactuar con Culqi
        setProcessing(false);

        // 2. Abrir pasarela Culqi
        logger.log("🚀 [Checkout] Iniciando flujo Culqi");
        openCulqi({
          title: "Liwilu",
          currency: "PEN",
          description: `Pedido ${orderId} - Liwilu Shop`,
          amount: total,
        });
      } catch (error: any) {
        logger.error("❌ Error en handleProcesarPago:", error);
        showToast(
          error.message || "Ocurrió un error al procesar tu solicitud",
          "error",
        );
        setProcessing(false);
      }
      return;
    }

    // Para pago en efectivo
    if (metodoPago === "efectivo") {
      setProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const numeroPedido = Math.floor(Math.random() * 9000) + 1000;
      showToast("Pedido registrado. Paga en efectivo al recibir", "success");
      setIsSuccess(true);
      clearCart();
      router.push(`/pedido-exitoso?order=${numeroPedido}&method=efectivo`);
    }
  };

  // Format card number
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(" ") : value;
  };

  useEffect(() => {
    const hasCheckoutState = localStorage.getItem("liwilu_checkout_state");
    if (items.length === 0 && !isSuccess && !hasCheckoutState) {
      router.push("/productos");
    }
  }, [items, router, isSuccess]);

  if (items.length === 0) {
    return null; // Don't render "Empty Cart" message, just redirect or show nothing
  }

  return (
    <Layout
      title="Checkout - Liwilu"
      description="Finalizar compra"
      background={true}
    >
      <ProcessingOverlay isProcessing={processing} stage={processingStage} />

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        message={errorModal.message}
        title="Error en el pago"
      />

      <div className="max-w-7xl mx-auto px-6 py-8 my-24 relative z-10">
        {isVerifyingStock ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-medium text-gray-600 animate-pulse">
              Verificando stock...
            </p>
            <p className="text-sm text-gray-400">
              Estamos asegurando que tus productos estén disponibles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Columna izquierda - Formulario */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => router.push("/carrito")}
                  className="group flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Volver al carrito
                </button>
                <div className="flex items-center gap-2 text-xs text-gray-400 uppercase font-semibold">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Pago Seguro SSL
                </div>
              </div>

              {/* Tipo de Comprobante */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-semibold mb-2 text-gray-900">
                  Comprobante de Pago
                </h2>
                <p className="text-gray-500 mb-8">
                  Selecciona el tipo de documento para tu compra
                </p>

                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setTipoComprobante("boleta")}
                    className={`flex-1 py-3 px-4 rounded-sm border font-semibold transition-all ${tipoComprobante === "boleta"
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 text-gray-700 hover:border-primary"
                      }`}
                  >
                    Boleta
                  </button>
                  <button
                    onClick={() => setTipoComprobante("factura")}
                    className={`flex-1 py-3 px-4 rounded-sm border font-semibold transition-all ${tipoComprobante === "factura"
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 text-gray-700 hover:border-primary"
                      }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Factura
                    </span>
                  </button>
                </div>

                {/* Formulario Boleta */}
                {tipoComprobante === "boleta" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Select
                          label="Tipo de documento"
                          value={tipoDocumentoBoleta}
                          onChange={(e) => {
                            setTipoDocumentoBoleta(e.target.value);
                            setDatosBoletaRUC("");
                            const newErrors = { ...errors };
                            delete newErrors.rucBoleta;
                            setErrors(newErrors);
                          }}
                        >
                          <option value="DNI">DNI</option>
                          <option value="CE">Carnet de Extranjería</option>
                          <option value="Pasaporte">Pasaporte</option>
                        </Select>
                      </div>
                      <div>
                        <Input
                          label="Número de documento"
                          type="text"
                          value={datosBoletaRUC}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (tipoDocumentoBoleta === "Pasaporte") {
                              value = value.replace(/[^a-zA-Z0-9]/g, "");
                            } else {
                              value = value.replace(/\D/g, "");
                            }
                            setDatosBoletaRUC(value);
                          }}
                          placeholder={
                            tipoDocumentoBoleta === "Pasaporte"
                              ? "A1234567"
                              : "12345678"
                          }
                          maxLength={
                            tipoDocumentoBoleta === "DNI" ||
                              tipoDocumentoBoleta === "Pasaporte"
                              ? 8
                              : 12
                          }
                          inputMode={
                            tipoDocumentoBoleta === "Pasaporte"
                              ? "text"
                              : "numeric"
                          }
                          error={errors.rucBoleta}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Formulario Factura */}
                {tipoComprobante === "factura" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          RUC
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={datosFactura.ruc}
                            onChange={(e) => {
                              setDatosFactura({
                                ...datosFactura,
                                ruc: e.target.value.replace(/\D/g, ""),
                                razonSocial: "",
                                direccionFiscal: "",
                              });
                              setRucConsulted(false);
                            }}
                            placeholder="20123456789"
                            maxLength={11}
                            className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition pr-12"
                          />
                          <button
                            type="button"
                            onClick={handleConsultaRUC}
                            disabled={
                              isConsultingRuc || datosFactura.ruc.length !== 11
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-dark disabled:text-gray-300 p-2 transition-colors"
                            title="Consultar RUC"
                          >
                            {isConsultingRuc ? (
                              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.rucFactura && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.rucFactura}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Razón Social
                        </label>
                        <input
                          type="text"
                          value={datosFactura.razonSocial}
                          onChange={(e) =>
                            setDatosFactura({
                              ...datosFactura,
                              razonSocial: e.target.value,
                            })
                          }
                          placeholder="Nombre de la empresa"
                          className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition disabled:bg-gray-50 disabled:text-gray-500"
                        />
                        {errors.razonSocial && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.razonSocial}
                          </p>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección Fiscal
                        </label>
                        <input
                          type="text"
                          value={datosFactura.direccionFiscal}
                          onChange={(e) =>
                            setDatosFactura({
                              ...datosFactura,
                              direccionFiscal: e.target.value,
                            })
                          }
                          placeholder="Av. Principal 123"
                          className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition disabled:bg-gray-50 disabled:text-gray-500"
                        />
                        {errors.direccionFiscal && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.direccionFiscal}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tipo de pago */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-semibold mb-2 text-gray-900">
                  Método de pago
                </h2>
                <p className="text-gray-500 mb-8">
                  Elige la opción más conveniente para ti
                </p>

                <div className="space-y-3">
                  {/* Tarjeta de crédito/débito */}
                  <button
                    onClick={() => setMetodoPago("tarjeta")}
                    className={`w-full flex items-center justify-between p-4 rounded-sm border transition-all ${metodoPago === "tarjeta"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <FaCreditCard className="text-2xl text-gray-600" />
                      <div className="text-left">
                        <p className="font-medium">Tarjeta de crédito/débito</p>
                        <p className="text-xs text-gray-500">
                          Visa, Mastercard, American Express
                        </p>
                      </div>
                    </div>
                    {metodoPago === "tarjeta" && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Yape */}
                  {/* <button
                  onClick={() => setMetodoPago("yape")}
                  className={`w-full flex items-center justify-between p-4 rounded-sm border transition-all ${
                    metodoPago === "yape"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-sm flex items-center justify-center text-white font-semibold">
                      Y
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Yape</p>
                      <p className="text-xs text-gray-500">
                        Pago mediante código QR
                      </p>
                    </div>
                  </div>
                  {metodoPago === "yape" && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button> */}

                  {/* Pago Efectivo */}
                  {/* <button
                  onClick={() => setMetodoPago("efectivo")}
                  className={`w-full flex items-center justify-between p-4 rounded-sm border transition-all ${
                    metodoPago === "efectivo"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaMoneyBillWave className="text-2xl text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">Pago contra entrega</p>
                      <p className="text-xs text-gray-500">
                        Paga en efectivo al recibir
                      </p>
                    </div>
                  </div>
                  {metodoPago === "efectivo" && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button> */}
                </div>

                {errors.metodoPago && (
                  <p className="text-red-500 text-sm mt-3">
                    {errors.metodoPago}
                  </p>
                )}

                {/* Información de Culqi para pruebas - SOLO DEV */}
                {process.env.NODE_ENV === "development" &&
                  (metodoPago === "tarjeta" || metodoPago === "yape") && (
                    <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🧪</span>
                        <p className="text-sm font-semibold text-blue-900">
                          Modo de pruebas activo
                        </p>
                      </div>

                      {testMode && (
                        <div className="flex items-center gap-3 mb-5 p-3 bg-red-50 border border-red-100 rounded-lg shadow-inner animate-pulse-subtle">
                          <input
                            type="checkbox"
                            id="simulateRejection"
                            checked={simulateRejection}
                            onChange={(e) =>
                              setSimulateRejection(e.target.checked)
                            }
                            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                          />
                          <label
                            htmlFor="simulateRejection"
                            className="text-xs font-bold text-red-700 cursor-pointer select-none"
                          >
                            Simular rechazo de pago (Venta denegada)
                          </label>
                        </div>
                      )}

                      {metodoPago === "tarjeta" ? (
                        <div className="space-y-2 text-xs text-blue-800">
                          <p className="flex justify-between">
                            <span>Número:</span>{" "}
                            <code className="bg-white px-1.5 py-0.5 rounded border font-semibold">
                              4111 1111 1111 1111
                            </code>
                          </p>
                          <p className="flex justify-between">
                            <span>CVV:</span>{" "}
                            <code className="bg-white px-1.5 py-0.5 rounded border font-semibold">
                              123
                            </code>
                          </p>
                          <p className="flex justify-between">
                            <span>Expiración:</span>{" "}
                            <code className="bg-white px-1.5 py-0.5 rounded border font-semibold">
                              12 / 2026
                            </code>
                          </p>
                          <p className="mt-3 py-2 px-3 bg-white/50 rounded text-[10px] italic">
                            El modal de Culqi procesará estos datos de forma
                            segura.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-amber-700 font-medium leading-relaxed">
                            ⚠️{" "}
                            <strong className="font-semibold">
                              Nota técnica:
                            </strong>{" "}
                            El botón de Yape dentro del modal de Culqi requiere un
                            backend real para funcionar.
                          </p>
                          <p className="text-[11px] text-blue-800">
                            Para validar el flujo completo ahora, te recomendamos
                            seleccionar <strong>Tarjeta</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                {/* Formulario de tarjeta nueva (No requerido para Culqi Checkout v4) */}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                <div className="order-2 sm:order-1 text-center sm:text-left">
                  <Button
                    onClick={handleProcesarPago}
                    disabled={processing}
                    className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-4 w-4 border border-white/20 border-b-white"></div>
                        Procesando...
                      </span>
                    ) : (
                      "Confirmar Pago"
                    )}
                  </Button>
                </div>
                <div className="order-1 sm:order-2 flex items-center gap-4 text-gray-500">
                  <div className="flex -space-x-1">
                    {["VISA", "MC", "AMEX"].map((card) => (
                      <div
                        key={card}
                        className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[9px] font-semibold tracking-wider shadow-sm"
                      >
                        {card}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-medium hidden md:inline uppercase tracking-tight">
                    Pagos seguros
                  </span>
                </div>
              </div>
            </div>

            {/* Columna derecha - Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-md shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">
                  Resumen del pedido
                </h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => {
                    const imageId = item.product.associations?.images?.[0]?.id;
                    let imageUrl = item.product.coverImage;

                    if (!imageUrl) {
                      if (imageId) {
                        imageUrl = getProductImageUrl(
                          item.product.id.toString(),
                          imageId,
                        );
                      } else {
                        imageUrl = "/images/placeholder-product.jpg";
                      }
                    }

                    return (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="relative w-16 h-16 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={imageUrl}
                            alt={getProductName(item.product)}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {getProductName(item.product)}
                          </h3>
                          <p className="text-xs text-gray-500">
                            X{item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(
                              (
                                parseFloat(
                                  (item.product.price || "0").toString(),
                                ) * item.quantity
                              ).toString(),
                            )}
                          </p>
                          {item.product.originalPrice &&
                            parseFloat(item.product.originalPrice.toString()) >
                            parseFloat(
                              (item.product.price || "0").toString(),
                            ) && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatPrice(
                                  (
                                    parseFloat(
                                      item.product.originalPrice.toString(),
                                    ) * item.quantity
                                  ).toString(),
                                )}
                              </p>
                            )}
                          <p className="text-xs text-gray-500">
                            {formatPrice(
                              (item.product.price || "0").toString(),
                            )}{" "}
                            c/u
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(subtotal.toString())}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Envío</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(envio.toString())}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-4 border-t border-gray-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-primary">
                      {formatPrice(total.toString())}
                    </span>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 hidden lg:block">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.166 4.9L10 1.554L17.834 4.9c.45.19.73.635.73 1.127v3.5c0 5.474-3.41 10.371-8.288 12.236c-.183.07-.384.07-.567 0C4.244 19.897.834 15 .834 9.527v-3.5c0-.492.28-.936.73-1.127zM10 3.3l-6.5 2.763v2.983c0 4.007 2.353 7.749 6.5 9.45c4.147-1.7 6.5-5.443 6.5-9.45V6.063L10 3.3zm2.983 5.114a.75.75 0 10-1.066-1.053L9 10.3l-1.417-1.554a.75.75 0 00-1.102 1.018l2 2.2a.75.75 0 001.084.017l3.418-3.567z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-800 uppercase tracking-tight">
                          Compra 100% Segura
                        </p>
                        <p className="text-[10px] text-gray-500 line-clamp-2">
                          Protegemos tus datos con los más altos estándares de
                          seguridad (PCI DSS).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Script
        src="https://checkout.culqi.com/js/v4"
        strategy="afterInteractive"
        onLoad={handleCulqiLoad}
        onError={() => logger.error("❌ Error al cargar Culqi")}
      />
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </Layout>
  );
}
