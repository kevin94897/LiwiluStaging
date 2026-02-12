// pages/checkout.tsx - VERSIÓN CORREGIDA PARA CULQI v4
"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getProductImageUrl, formatPrice, getProductName } from "@/lib/utils";
import { FaCreditCard, FaQrcode } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Script from "next/script";
import {
  openCulqiForTokenization,
  openCulqiForAsyncOrder,
  configureCulqi,
  closeCulqi,
  resetCulqi,
  detectAsyncPaymentMethod,
} from "@/lib/culqi";
import { showToast } from "@/lib/notifications";
import { createOrder, payOrder, createAsyncOrder } from "@/lib/cart";
import { useAuth } from "@/hooks/useAuth";
import { consultaRUC } from "@/lib/general";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import ProcessingOverlay from "@/components/checkout/ProcessingOverlay";
import ErrorModal from "@/components/ui/ErrorModal";
import logger from "@/lib/logger";
import { validateRUC } from "@/lib/validations";
import type {
  CulqiTokenResponse,
  CulqiOrderResponse,
} from "@/lib/types/culqi.types";

type TipoComprobante = "boleta" | "factura";
type MetodoPago = "card" | "async" | null;

export default function Checkout() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { items, getCartTotal, clearCart, totals, syncCart } = useCart();

  // ============================================
  // ESTADO DEL FORMULARIO
  // ============================================
  const [tipoComprobante, setTipoComprobante] =
    useState<TipoComprobante>("boleta");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(null);

  // Datos para Boleta
  const [tipoDocumentoBoleta, setTipoDocumentoBoleta] = useState("DNI");
  const [datosBoletaRUC, setDatosBoletaRUC] = useState("");

  // Datos para Factura
  const [datosFactura, setDatosFactura] = useState({
    ruc: "",
    razonSocial: "",
    direccionFiscal: "",
  });

  // ============================================
  // ESTADO DE PROCESAMIENTO
  // ============================================
  const [processing, setProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<
    "creating-order" | "processing-payment" | "completing"
  >("creating-order");
  const [culqiReady, setCulqiReady] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentPendingOrderId, setCurrentPendingOrderId] = useState<
    number | null
  >(null);
  const [culqiOrderId, setCulqiOrderId] = useState<string | null>(null);

  // Control de duplicados
  const processingToken = useRef<string | null>(null);
  const isProcessingRef = useRef(false);

  // ============================================
  // VALIDACIÓN Y ERRORES
  // ============================================
  const [isConsultingRuc, setIsConsultingRuc] = useState(false);
  const [rucConsulted, setRucConsulted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });

  // ============================================
  // CÁLCULOS
  // ============================================
  const subtotal = getCartTotal();
  const envio = totals.shipping;
  const total = subtotal + envio;

  // ============================================
  // EFECTOS DE INICIALIZACIÓN
  // ============================================

  useEffect(() => {
    syncCart();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Culqi) {
      logger.log("⚡ Culqi ya estaba cargado al montar");
      const configured = configureCulqi();
      setCulqiReady(configured);
    }
  }, []);

  useEffect(() => {
    if (items.length === 0 && !isSuccess) {
      router.push("/productos");
    }
  }, [items, router, isSuccess]);

  const handleCulqiLoad = () => {
    logger.log("📦 Script de Culqi cargado");
    const configured = configureCulqi();
    setCulqiReady(configured);
  };

  // ============================================
  // MANEJO DE RESPUESTAS DE CULQI
  // ============================================

  useEffect(() => {
    window.culqi = async () => {
      logger.log("🔔 [CULQI CALLBACK] Disparado");
      logger.log("📦 [CULQI STATE] Token:", window.Culqi.token?.id);
      logger.log("📦 [CULQI STATE] Order:", window.Culqi.order?.id);
      logger.log("📦 [CULQI STATE] Error:", window.Culqi.error);

      // Prevenir procesamiento concurrente
      if (isProcessingRef.current) {
        logger.warn("⚠️ [CULQI CALLBACK] Ya hay un pago en proceso, ignorando");
        return;
      }

      try {
        // 🔴 PRIORIDAD 1: ORDER (Pagos Asíncronos)
        if (window.Culqi.order) {
          logger.log("📱 [CULQI CALLBACK] ORDER detectada, procesando...");
          await handleCulqiOrder(window.Culqi.order);
          return;
        }

        // 🔴 PRIORIDAD 2: TOKEN (Tarjetas)
        if (window.Culqi.token) {
          logger.log("💳 [CULQI CALLBACK] TOKEN detectado, procesando...");
          await handleCulqiToken(window.Culqi.token);
          return;
        }

        // 🔴 PRIORIDAD 3: ERROR
        if (window.Culqi.error) {
          logger.error("❌ [CULQI CALLBACK] ERROR detectado");
          handleCulqiError(window.Culqi.error);
          return;
        }

        // Si no hay token, order ni error
        logger.log("🚪 [CULQI CALLBACK] Modal cerrado sin acción");
      } catch (error) {
        logger.error("❌ [CULQI CALLBACK] Error crítico:", error);
        showToast("Error inesperado al procesar el pago", "error");
        setProcessing(false);
        isProcessingRef.current = false;
      }
    };

    // ESCUCHAR CIERRE DEL MODAL
    const handleModalClosed = () => {
      logger.log("🚪 [EVENT] Modal de Culqi cerrado");
      setProcessing(false);
      setProcessingStage("creating-order");
      isProcessingRef.current = false;
    };

    window.addEventListener("culqi-modal-closed", handleModalClosed);

    return () => {
      window.removeEventListener("culqi-modal-closed", handleModalClosed);
    };
  }, [currentPendingOrderId, router]);

  /**
   * Manejo de TOKEN (tarjetas)
   */
  const handleCulqiToken = async (token: CulqiTokenResponse) => {
    logger.log("✅ [handleCulqiToken] Token recibido:", token.id);

    // Validación: NO debe ser un token de método asíncrono
    if (token.id.startsWith("ype_")) {
      logger.warn("⚠️ Token de Yape detectado, debería ser ORDER no TOKEN");
      closeCulqi();
      showToast("Por favor, selecciona el método de pago nuevamente", "error");
      setProcessing(false);
      return;
    }

    // Prevenir duplicados
    if (processingToken.current === token.id) {
      logger.warn("⚠️ Token ya procesado, ignorando duplicado:", token.id);
      return;
    }

    processingToken.current = token.id;
    isProcessingRef.current = true;
    closeCulqi();

    try {
      if (!currentPendingOrderId) {
        throw new Error("No se ha generado un ID de orden para el pago");
      }

      setProcessing(true);
      setProcessingStage("processing-payment");

      // Obtener email
      const email = await getEmailForPayment();
      if (!email) {
        throw new Error(
          "No se encontró el correo electrónico para procesar el pago",
        );
      }

      // Procesar Pago
      logger.log(
        `💳 Procesando pago con tarjeta para orden ${currentPendingOrderId}...`,
      );
      const payResponse = await payOrder(currentPendingOrderId.toString(), {
        token: token.id,
        email: email,
      });

      logger.log("📦 Payment response:", payResponse);

      // Validar éxito
      if (
        payResponse.success &&
        payResponse.data?.paymentStatus === "COMPLETED" &&
        payResponse.data?.status === "PAID" &&
        payResponse.data?.orderId
      ) {
        const confirmedOrderId = payResponse.data.orderId;
        logger.log(`✅ Pago confirmado para orden #${confirmedOrderId}`);
        await handlePaymentSuccess(confirmedOrderId);
      } else {
        const errorMsg =
          payResponse.message || "El pago no pudo ser completado.";
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      logger.error("❌ Error en pago con tarjeta:", error);
      showToast(error.message || "Error al completar la compra", "error");
      setProcessing(false);
    } finally {
      isProcessingRef.current = false;
      processingToken.current = null;
    }
  };

  /**
   * Manejo de ORDER (pagos asíncronos)
   */
  const handleCulqiOrder = async (order: CulqiOrderResponse) => {
    logger.log("✅ [handleCulqiOrder] Order recibida:", order.id);
    logger.log("📦 [handleCulqiOrder] Order completa:", order);

    isProcessingRef.current = true;
    closeCulqi();

    try {
      if (!currentPendingOrderId) {
        throw new Error("No se encontró la orden pendiente");
      }

      // Detectar método de pago
      const asyncPaymentMethod = detectAsyncPaymentMethod(order);

      if (!asyncPaymentMethod) {
        logger.error("❌ No se pudo detectar método de pago asíncrono");
        logger.log("📦 Order data para análisis:", order);
        throw new Error("No se pudo determinar el método de pago");
      }

      logger.log(`✅ Método detectado: ${asyncPaymentMethod}`);

      // Guardar info para debugging
      localStorage.setItem(
        "liwilu_last_culqi_order",
        JSON.stringify({
          orderId: order.id,
          paymentMethod: asyncPaymentMethod,
          pendingOrderId: currentPendingOrderId,
          timestamp: Date.now(),
        }),
      );

      // Redirigir a página de pago pendiente
      const redirectUrl = `/pago-pendiente?order=${currentPendingOrderId}&method=${asyncPaymentMethod}`;
      logger.log(`🔄 Redirigiendo a: ${redirectUrl}`);

      router.push(redirectUrl);
    } catch (error: any) {
      logger.error("❌ Error en handleCulqiOrder:", error);
      showToast(
        error.message || "Error al procesar el pago asíncrono",
        "error",
      );
      setProcessing(false);
      isProcessingRef.current = false;
    }
  };

  /**
   * Manejo de ERRORES
   */
  const handleCulqiError = (error: any) => {
    logger.log("❌ [handleCulqiError] Error de Culqi:", error);
    setErrorModal({
      isOpen: true,
      message:
        error.user_message ||
        "Ocurrió un error al procesar el pago. Por favor, intenta con otra tarjeta o método de pago.",
    });
    setProcessing(false);
    isProcessingRef.current = false;
  };

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  const getEmailForPayment = async (): Promise<string | null> => {
    if (isAuthenticated && user?.email) {
      return user.email;
    }

    const guestDataRaw = localStorage.getItem("liwilu_guestData");
    if (guestDataRaw) {
      const guestData = JSON.parse(guestDataRaw);
      return guestData.email;
    }

    return null;
  };

  const handlePaymentSuccess = async (orderId: number) => {
    setProcessingStage("completing");
    showToast("💳 ¡Compra realizada con éxito!", "success");
    setIsSuccess(true);

    localStorage.removeItem("liwilu_pending_transaction");
    localStorage.setItem(
      "liwilu_successful_order",
      JSON.stringify({
        orderId: orderId,
        timestamp: Date.now(),
      }),
    );

    clearCart();

    const redirectUrl = `/pedido-exitoso?order=${orderId}`;
    logger.log(`📍 Redirigiendo a: ${redirectUrl}`);
    router.push(redirectUrl);
  };

  // ============================================
  // VALIDACIÓN DE DATOS
  // ============================================

  const validarDatos = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (tipoComprobante === "boleta") {
      if (!datosBoletaRUC) {
        newErrors.rucBoleta = "El número de documento es obligatorio";
      } else {
        if (tipoDocumentoBoleta === "DNI" && !/^\d{8}$/.test(datosBoletaRUC)) {
          newErrors.rucBoleta = "Ingresa un DNI válido (8 números)";
        } else if (
          tipoDocumentoBoleta === "CE" &&
          (datosBoletaRUC.length < 6 || datosBoletaRUC.length > 12)
        ) {
          newErrors.rucBoleta = "El CE debe tener entre 6 y 12 caracteres";
        } else if (
          tipoDocumentoBoleta === "Pasaporte" &&
          !/^[a-zA-Z][0-9]{7}$/.test(datosBoletaRUC)
        ) {
          newErrors.rucBoleta = "El pasaporte debe tener 1 letra y 7 números";
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

  const handleConsultaRUC = async () => {
    const ruc = datosFactura.ruc;
    if (!validateRUC(ruc)) {
      setErrors({
        ...errors,
        rucFactura: "Ingresa un RUC válido",
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
        showToast(response.message || "No se encontró información", "error");
      }
    } catch (error: any) {
      showToast(error.message || "Error al consultar el RUC", "error");
    } finally {
      setIsConsultingRuc(false);
    }
  };

  // ============================================
  // PROCESAMIENTO DE PAGO
  // ============================================

  const handleProcesarPago = async () => {
    logger.log("🚀 [handleProcesarPago] Iniciando proceso de pago");
    logger.log("📦 Método de pago seleccionado:", metodoPago);

    if (!validarDatos()) {
      showToast("Por favor completa todos los campos requeridos", "error");
      return;
    }

    try {
      // Verificar Culqi
      let isReady = culqiReady;
      if (!isReady && typeof window !== "undefined" && window.Culqi) {
        logger.log("🔄 Configurando Culqi bajo demanda...");
        isReady = configureCulqi();
        setCulqiReady(isReady);
      }

      if (!isReady) {
        showToast(
          "La pasarela de pago no está lista. Por favor, recarga la página.",
          "error",
        );
        return;
      }

      setProcessing(true);
      setProcessingStage("creating-order");

      // 1️⃣ CREAR ORDEN PENDIENTE EN BACKEND
      logger.log("📝 Creando orden pendiente en backend...");
      const invoicePayload: any = {
        invoiceType: tipoComprobante.toUpperCase(),
      };

      if (tipoComprobante === "factura") {
        invoicePayload.invoiceData = {
          ruc: datosFactura.ruc,
          razonSocial: datosFactura.razonSocial,
          direccionFiscal: datosFactura.direccionFiscal,
        };
      } else {
        invoicePayload.invoiceData = {
          tipoDocumento: tipoDocumentoBoleta.toUpperCase(),
          numeroDocumento: datosBoletaRUC,
        };
      }

      const orderResponse = await createOrder(invoicePayload);
      logger.log("📦 Respuesta de createOrder:", orderResponse);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Error al crear la orden");
      }

      const pendingOrderId =
        orderResponse.data?.pendingOrderId ||
        orderResponse.pendingOrderId ||
        orderResponse.data?.orderId ||
        orderResponse.orderId;

      if (!pendingOrderId) {
        throw new Error("No se recibió un ID de orden del servidor");
      }

      logger.log("✅ Orden pendiente creada:", pendingOrderId);
      setCurrentPendingOrderId(pendingOrderId);

      // 2️⃣ DECIDIR FLUJO SEGÚN MÉTODO DE PAGO
      if (metodoPago === "card") {
        // ═══════════════════════════════════════
        // FLUJO TARJETA
        // ═══════════════════════════════════════
        logger.log("💳 Iniciando pago con tarjeta...");
        setProcessing(false);
        resetCulqi();

        openCulqiForTokenization({
          title: "Liwilu",
          currency: "PEN",
          description: `Pedido ${pendingOrderId} - Liwilu Shop`,
          amount: total,
        });
      } else if (metodoPago === "async") {
        // ═══════════════════════════════════════
        // FLUJO ASÍNCRONO - QR/PAGOEFECTIVO
        // ═══════════════════════════════════════
        logger.log("📱 [checkout.tsx] Iniciando pago asíncrono...");

        const email = await getEmailForPayment();
        if (!email) {
          throw new Error("Se requiere un email para crear la orden de Culqi");
        }

        // 2a. CREAR ORDEN EN CULQI (Backend ya genera QR/CIP)
        logger.log("🔄 [checkout.tsx] Llamando a createAsyncOrder...", {
          pendingOrderId,
          method: "qr",
          email,
        });

        const culqiOrderResponse = await createAsyncOrder(
          pendingOrderId,
          "qr", // Método (tu backend lo detecta)
          email,
        );

        logger.log(
          "📦 [checkout.tsx] Respuesta de createAsyncOrder:",
          JSON.stringify(culqiOrderResponse, null, 2),
        );

        if (!culqiOrderResponse.success) {
          throw new Error(
            culqiOrderResponse.message || "No se pudo crear la orden de Culqi",
          );
        }

        // 2b. VALIDAR RESPUESTA
        if (!culqiOrderResponse.data?.culqiOrderId) {
          logger.error(
            "❌ [checkout.tsx] No se recibió culqiOrderId:",
            culqiOrderResponse,
          );
          throw new Error("No se recibió el ID de orden de Culqi");
        }

        // 2c. DETECTAR MÉTODO Y GUARDAR DATOS
        let detectedMethod: "qr" | "pagoefectivo" = "qr";

        if (
          culqiOrderResponse.data.qr ||
          culqiOrderResponse.data.paymentMethod === "qr"
        ) {
          detectedMethod = "qr";
        } else if (culqiOrderResponse.data.paymentCode) {
          detectedMethod = "pagoefectivo";
        }

        const culqiOrderId = culqiOrderResponse.data.culqiOrderId;
        logger.log(
          "✅ [checkout.tsx] Orden creada con método:",
          detectedMethod,
        );

        const storageData = {
          orderId: culqiOrderId,
          paymentMethod: detectedMethod,
          pendingOrderId: pendingOrderId,
          qr: culqiOrderResponse.data.qr,
          paymentCode: culqiOrderResponse.data.paymentCode,
          timestamp: Date.now(),
        };
        logger.log("💾 [checkout.tsx] Guardando en localStorage:", storageData);

        localStorage.setItem(
          "liwilu_last_culqi_order",
          JSON.stringify(storageData),
        );

        // 2d. REDIRIGIR A PÁGINA DE PAGO PENDIENTE
        // El backend ya generó el QR/CIP, no necesitamos modal
        setProcessing(false);

        const redirectUrl = `/pago-pendiente?order=${pendingOrderId}&method=${detectedMethod}`;
        logger.log(`🔄 [checkout.tsx] Redirigiendo a: ${redirectUrl}`);

        router.push(redirectUrl);
      }
    } catch (error: any) {
      logger.error("❌ Error en handleProcesarPago:", error);
      showToast(
        error.message || "Ocurrió un error al procesar tu solicitud",
        "error",
      );
      setProcessing(false);
      isProcessingRef.current = false;
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (items.length === 0 && !isSuccess) {
    return null;
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* COLUMNA IZQUIERDA - FORMULARIO */}
          <div className="lg:col-span-2 space-y-6">
            {/* Botón volver */}
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
            </div>

            {/* TIPO DE COMPROBANTE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Comprobante de Pago
              </h2>
              <p className="text-gray-500 mb-8">
                Selecciona el tipo de documento
              </p>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setTipoComprobante("boleta")}
                  className={`flex-1 py-3 px-4 rounded-sm border font-semibold transition-all ${
                    tipoComprobante === "boleta"
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 text-gray-700 hover:border-primary"
                  }`}
                >
                  Boleta
                </button>
                <button
                  onClick={() => setTipoComprobante("factura")}
                  className={`flex-1 py-3 px-4 rounded-sm border font-semibold transition-all ${
                    tipoComprobante === "factura"
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 text-gray-700 hover:border-primary"
                  }`}
                >
                  Factura
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
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

            {/* MÉTODO DE PAGO */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Método de pago
              </h2>
              <p className="text-gray-500 mb-8">
                Elige la opción más conveniente
              </p>

              <div className="space-y-3">
                {/* Tarjeta */}
                <button
                  onClick={() => setMetodoPago("card")}
                  className={`w-full flex items-center justify-between p-4 rounded-sm border transition-all ${
                    metodoPago === "card"
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
                  {metodoPago === "card" && (
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

                {/* Pagos Asíncronos */}
                <button
                  onClick={() => setMetodoPago("async")}
                  className={`w-full flex items-center justify-between p-4 rounded-sm border transition-all ${
                    metodoPago === "async"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaQrcode className="text-2xl text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium">
                        Yape, Billetera, PagoEfectivo
                      </p>
                      <p className="text-xs text-gray-500">
                        QR, CIP y otros métodos
                      </p>
                    </div>
                  </div>
                  {metodoPago === "async" && (
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
              </div>

              {/* Error de método de pago */}
              {errors.metodoPago && (
                <p className="text-red-500 text-sm mt-3">{errors.metodoPago}</p>
              )}
            </div>

            {/* Botón de pago */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
              <div className="order-2 sm:order-1">
                <Button onClick={handleProcesarPago} disabled={processing}>
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
            </div>
          </div>

          {/* COLUMNA DERECHA - RESUMEN */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-md shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Resumen del pedido</h2>

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
              </div>
            </div>
          </div>
        </div>
      </div>

      <Script
        src="https://checkout.culqi.com/js/v4"
        strategy="afterInteractive"
        onLoad={handleCulqiLoad}
        onError={() => logger.error("❌ Error al cargar Culqi")}
      />
    </Layout>
  );
}
