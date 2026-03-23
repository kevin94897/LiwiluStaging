// pages/checkout.tsx - VERSIÓN CORREGIDA PARA CULQI v4
"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getProductImageUrl, formatPrice, getProductName } from "@/lib/utils";
import { FaCreditCard, FaQrcode, FaTag } from "react-icons/fa";
import { PiWarningCircleFill } from "react-icons/pi";
import Button from "@/components/ui/Button";
import Script from "next/script";
import {
  openCulqiForTokenization,
  openCulqiForAsyncOrder,
  getSelectedPaymentMethod, // Added this import
  configureCulqi,
  configureCulqi3DS,
  init3DSAuthentication,
  closeCulqi,
  resetCulqi,
  detectAsyncPaymentMethod,
  CULQI_PUBLIC_KEY,
} from "@/lib/culqi";
import { showToast } from "@/lib/notifications";
import {
  createOrder,
  payOrder,
  createCulqiOrder,
  getPendingOrderAttempt,
  checkAsyncPaymentStatus,
} from "@/lib/cart";
import { useLocations } from "@/hooks/useLocations";
import { PERU_LOCATIONS } from "@/lib/locationsComplete";
import { useAuth } from "@/hooks/useAuth";
import { consultaRUC, consultaDNI } from "@/lib/general";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import ProcessingOverlay from "@/components/checkout/ProcessingOverlay";
import ErrorModal from "@/components/ui/ErrorModal";
import logger from "@/lib/logger";
import { validateRUC } from "@/lib/validations";
import { useDocumentLookup } from "@/hooks/useDocumentLookup";
import type {
  CulqiTokenResponse,
  CulqiOrderResponse,
} from "@/lib/types/culqi.types";

type TipoComprobante = "boleta" | "factura";
type MetodoPago = "card" | "async" | null;

// Helper para búsqueda case-insensitive
const findMatchingLocation = (
  input: string,
  options: string[],
): string | undefined => {
  if (!input) return undefined;
  const inputLower = input.toLowerCase();
  return options.find((opt) => opt.toLowerCase() === inputLower);
};

export default function Checkout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { items, getCartTotal, clearCart, totals, syncCart } = useCart();

  // Trimegisto pre-order ID from email link (e.g. /checkout?preOrderId=...)
  const [trimegistoPreOrderId, setTrimegistoPreOrderId] = useState<string | null>(null);

  useEffect(() => {
    const pid = searchParams?.get("preOrderId");
    if (pid) {
      setTrimegistoPreOrderId(pid);
      logger.log("🔮 [Checkout] Trimegisto preOrderId detectado:", pid);
    }
  }, [searchParams]);

  // ============================================
  // ESTADO DEL FORMULARIO
  // ============================================
  const [tipoComprobante, setTipoComprobante] =
    useState<TipoComprobante>("boleta");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(null);

  // Datos para Boleta - Expandido
  const [datosBoleta, setDatosBoleta] = useState({
    tipoDocumento: "DNI",
    numeroDocumento: "",
    nombres: "",
    apellidos: "",
    direccion: "",
    departamento: "Lima",
    provincia: "Lima",
    distrito: "",
  });

  // Datos para Factura - Expandido
  const [datosFactura, setDatosFactura] = useState({
    ruc: "",
    razonSocial: "",
    direccionFiscal: "",
    departamento: "Lima",
    provincia: "Lima",
    distrito: "",
  });

  // Hooks de ubicación para Boleta
  const boletaLocations = useLocations(
    datosBoleta.departamento,
    datosBoleta.provincia,
    datosBoleta.distrito,
  );

  // Hooks de ubicación para Factura
  const facturaLocations = useLocations(
    datosFactura.departamento,
    datosFactura.provincia,
    datosFactura.distrito,
  );

  // Pre-fill data logic
  useEffect(() => {
    // 1. Intentar cargar datos de envío (delivery) para pre-llenar dirección
    const savedShippingAddress = localStorage.getItem("liwilu_direccionEnvio");
    let shippingData: any = {};
    if (savedShippingAddress) {
      try {
        shippingData = JSON.parse(savedShippingAddress);
      } catch (e) {
        console.error("Error parsing shipping address", e);
      }
    }

    // 2. Pre-llenar Boleta
    // Prioridad: Usuario Autenticado -> Guest Data -> Shipping Data
    let initialBoleta = { ...datosBoleta };

    // Nombre y Apellido
    if (isAuthenticated && user) {
      initialBoleta.nombres = user.firstName || "";
      initialBoleta.apellidos = user.lastName || "";
      // Si el usuario tiene documento, usarlo
      if (user.documentType && user.documentNumber) {
        initialBoleta.tipoDocumento = user.documentType;
        initialBoleta.numeroDocumento = user.documentNumber;
      }
    } else {
      const guestDataRaw = localStorage.getItem("liwilu_guestData");
      if (guestDataRaw) {
        try {
          const guestData = JSON.parse(guestDataRaw);
          initialBoleta.nombres = guestData.nombre || "";
          initialBoleta.apellidos = guestData.apellido || "";
          if (guestData.tipoDocumento && guestData.numeroDocumento) {
            initialBoleta.tipoDocumento = guestData.tipoDocumento;
            initialBoleta.numeroDocumento = guestData.numeroDocumento;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Dirección (usar la de envío si existe, sino la del usuario si tuviera (pero auth user no tiene address explicita en User))
    // Usamos shippingData como fuente principal de dirección "por defecto"
    if (shippingData.calle) {
      initialBoleta.direccion =
        shippingData.calle +
        (shippingData.numeroDptoPiso ? ` ${shippingData.numeroDptoPiso}` : "");
      // Ubicación
      if (
        shippingData.departamento &&
        shippingData.provincia &&
        shippingData.distrito
      ) {
        initialBoleta.departamento = shippingData.departamento;
        initialBoleta.provincia = shippingData.provincia;
        initialBoleta.distrito = shippingData.distrito;

        // Actualizar hooks de location
        boletaLocations.setLocationValues(
          shippingData.departamento,
          shippingData.provincia,
          shippingData.distrito,
        );
      }
    }

    setDatosBoleta(initialBoleta);

    // 3. Pre-llenar Factura (Ubicación)
    if (
      shippingData.departamento &&
      shippingData.provincia &&
      shippingData.distrito
    ) {
      setDatosFactura((prev) => ({
        ...prev,
        departamento: shippingData.departamento,
        provincia: shippingData.provincia,
        distrito: shippingData.distrito,
      }));
      facturaLocations.setLocationValues(
        shippingData.departamento,
        shippingData.provincia,
        shippingData.distrito,
      );
    }
  }, [isAuthenticated, user]);

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

  // Control de duplicados y estado persistente para callbacks
  const processingToken = useRef<string | null>(null);
  const isProcessingRef = useRef(false);
  const pendingOrderIdRef = useRef<number | null>(null);
  const orderTotalRef = useRef<number>(0);
  const deviceFingerprintRef = useRef<string | null>(null);
  const pendingEmailRef = useRef<string | null>(null);

  // Persistence constant
  const STORAGE_KEY_3DS = "liwilu_3ds_context";

  // ============================================
  // VALIDACIÓN Y ERRORES
  // ============================================
  // Hooks for automated lookup
  const {
    isLoading: isConsultingDni,
    isConsulted: boletaConsulted,
    resetConsulted: resetBoletaConsulted,
  } = useDocumentLookup({
    type: datosBoleta.tipoDocumento,
    number: datosBoleta.numeroDocumento,
    enabled: tipoComprobante === "boleta",
    onSuccess: (data) => {
      if (datosBoleta.tipoDocumento === "DNI") {
        setDatosBoleta((prev) => ({
          ...prev,
          nombres: data.nombres,
          apellidos: `${data.apellido_paterno} ${data.apellido_materno}`,
        }));
      }
    },
  });

  // Hook for Factura (RUC)
  const {
    isLoading: isConsultingRuc,
    isConsulted: rucConsulted,
    resetConsulted: resetRucConsulted,
  } = useDocumentLookup({
    type: "RUC",
    number: datosFactura.ruc,
    enabled: tipoComprobante === "factura",
    onSuccess: (data) => {
      // Normalización de Ubicación (API devuelve UPPERCASE, App usa Title Case)
      let normalizedDept = datosFactura.departamento;
      let normalizedProv = datosFactura.provincia;
      let normalizedDist = datosFactura.distrito;

      if (data.departamento) {
        const departments = Object.keys(PERU_LOCATIONS);
        const matchDept = findMatchingLocation(data.departamento, departments);
        if (matchDept) {
          normalizedDept = matchDept;
          if (data.provincia) {
            const provinces = Object.keys(PERU_LOCATIONS[matchDept] || {});
            const matchProv = findMatchingLocation(data.provincia, provinces);
            if (matchProv) {
              normalizedProv = matchProv;
              if (data.distrito) {
                const districts = PERU_LOCATIONS[matchDept][matchProv] || [];
                const matchDist = findMatchingLocation(
                  data.distrito,
                  districts,
                );
                if (matchDist) normalizedDist = matchDist;
              }
            }
          }
        }
      }

      setDatosFactura((prev) => ({
        ...prev,
        razonSocial: data.nombre_o_razon_social,
        direccionFiscal: data.direccion_completa || prev.direccionFiscal,
        departamento: normalizedDept,
        provincia: normalizedProv,
        distrito: normalizedDist,
      }));

      // Actualizar location hooks
      if (normalizedDept && normalizedProv && normalizedDist) {
        facturaLocations.setLocationValues(
          normalizedDept,
          normalizedProv,
          normalizedDist,
        );
      }
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
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

  // Sincronizar total con Ref para callbacks asíncronos
  useEffect(() => {
    orderTotalRef.current = total;
  }, [total]);

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

    // Configurar listener para evento de cierre de 3DS (opcional, si Culqi emite uno)
    return () => {
      // Cleanup si necesario
    };
  }, []);

  const handleCulqiLoad = () => {
    logger.log("📦 Script de Culqi cargado");

    // Debug availability
    if (typeof window !== "undefined") {
      logger.log("🔍 [handleCulqiLoad] window.Culqi:", !!window.Culqi);
      logger.log("🔍 [handleCulqiLoad] window.Culqi3DS:", !!window.Culqi3DS);
    }

    // Configurar Culqi Checkout
    const configured = configureCulqi();

    // Configurar Culqi 3DS INMEDIATAMENTE para que publicKey esté disponible
    configureCulqi3DS();

    // Verificar que Culqi3DS quedó configurado correctamente
    if (window.Culqi3DS) {
      logger.log("✅ [handleCulqiLoad] Culqi3DS configurado:", {
        hasPublicKey: !!window.Culqi3DS.publicKey,
        publicKeyPreview: window.Culqi3DS.publicKey?.substring(0, 15) + "...",
      });
    }

    setCulqiReady(configured);
  };

  /**
   * ═══════════════════════════════════════════════════════════
   * CONFIGURAR CALLBACKS Y LISTENERS PARA 3DS
   * ═══════════════════════════════════════════════════════════
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // CALLBACK GLOBAL PARA CULQI 3DS
    // @ts-ignore
    window.culqi3DS = async () => {
      logger.log("🔐 [3DS CALLBACK] Respuesta recibida de Culqi3DS");

      const token = window.Culqi3DS?.token;
      const error = window.Culqi3DS?.error;

      if (token) {
        logger.log("🔐 [3DS] Autenticación completada con éxito:", token);
        // Evitar procesar si ya estamos en fase de éxito o limpiando
        if (isProcessingRef.current) {
          await handlePaymentWith3DS(token);
        }
      } else if (error) {
        logger.error("❌ [3DS] Error en autenticación:", error);
        handleCulqiError(error);
      } else {
        logger.warn("⚠️ [3DS] Callback ejecutado sin datos");
      }
    };

    // LISTENER PARA CIERRE DEL MODAL 3DS
    const handle3DSClosed = () => {
      logger.log("🚪 [3DS] Modal cerrado detectado");
      setProcessing(false);
      isProcessingRef.current = false;
      // Reiniciar etapa si no se completó el pago
      setProcessingStage("creating-order");
    };

    // LISTENER DE EMERGENCIA PARA postMessage
    const handleEmergency3DSMessage = async (event: MessageEvent) => {
      const allowedOrigins = [
        "https://checkout.culqi.com",
        "https://centinelapistag.cardinalcommerce.com",
        "https://0merchantacsstag.cardinalcommerce.com",
        "https://cas.client.cardinaltrusted.com",
        "https://1merchantacsstag.cardinalcommerce.com",
      ];

      // Verificar origen y contenido
      const isAllowedOrigin =
        allowedOrigins.some((origin) => event.origin.includes(origin)) ||
        event.origin === window.location.origin;

      if (isAllowedOrigin && event.data && event.data.parameters3DS) {
        if (isProcessingRef.current) {
          logger.log(
            "🚀 [3DS EMERGENCY] Forzando procesamiento detectado vía postMessage",
          );
          await handlePaymentWith3DS(event.data.parameters3DS);
        }
      }

      // Manejo de errores transmitidos vía postMessage
      if (isAllowedOrigin && event.data && event.data.error) {
        logger.error(
          "❌ [3DS EMERGENCY] Error detectado vía postMessage:",
          event.data.error,
        );
        handleCulqiError(event.data.error);
      }
    };

    window.addEventListener("culqi-3ds-closed", handle3DSClosed);
    window.addEventListener("message", handleEmergency3DSMessage);

    return () => {
      logger.log("🧹 [3DS] Limpiando listeners de autenticación");
      window.removeEventListener("culqi-3ds-closed", handle3DSClosed);
      window.removeEventListener("message", handleEmergency3DSMessage);
    };
  }, []);

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

  const handlePaymentWith3DS = async (auth3DS: any) => {
    try {
      logger.log("[3DS] Iniciando validación y reintento de pago:", auth3DS);

      // 1. Validar estado de la autenticación
      // authenticationStatus puede ser: 'Successful', 'Failed', 'Attempted', 'Unavailable', 'Error'
      const status = auth3DS?.authenticationStatus || auth3DS?.status;
      if (status === "Failed") {
        logger.error("❌ [3DS] Autenticación fallida según el banco");
        throw new Error(
          "La autenticación 3D Secure falló. Por favor, intenta con otra tarjeta o contacta a tu banco.",
        );
      }

      const recovered = recover3DSContext();

      const email =
        (await getEmailForPayment()) ||
        recovered.email ||
        pendingEmailRef.current;
      const token =
        processingToken.current ||
        (window.Culqi && window.Culqi.token?.id) ||
        recovered.token;
      const orderId =
        currentPendingOrderId ||
        pendingOrderIdRef.current ||
        recovered.pendingOrderId;

      if (!email || !token || !orderId) {
        logger.error("[3DS] Faltan datos críticos para el reintento:", {
          email: !!email,
          token: !!token,
          pendingOrder: !!orderId,
        });
        throw new Error(
          "No pudimos recuperar los datos de tu sesión de pago. Por favor, intenta de nuevo.",
        );
      }

      logger.log("[3DS] Reintentando pago para orden:", orderId);

      const payResponse = await payOrder(orderId.toString(), {
        token: token,
        email: email,
        authentication3DS: {
          eci: auth3DS?.eci,
          xid: auth3DS?.xid,
          cavv: auth3DS?.cavv,
          protocolVersion: auth3DS?.protocolVersion,
          directoryServerTransactionId:
            auth3DS?.directoryServerTransactionId || auth3DS?.dsTransactionId,
        },
        deviceFingerprint:
          deviceFingerprintRef.current ||
          recovered.deviceFingerprint ||
          undefined,
      });

      logger.log("[3DS] Respuesta de reintento:", payResponse);

      if (
        payResponse.success &&
        payResponse.data?.paymentStatus === "COMPLETED"
      ) {
        const confirmedOrderId = payResponse.data.orderId;
        logger.log("[3DS] Pago confirmado para orden #" + confirmedOrderId);
        clear3DSContext();
        await handlePaymentSuccess(confirmedOrderId);
      } else {
        const msg =
          payResponse.message ||
          "Tu tarjeta fue rechazada después de la autenticación.";
        throw new Error(msg);
      }
    } catch (error: any) {
      logger.error("[3DS] Error en flujo final:", error);
      handleCulqiError(error);
    } finally {
      isProcessingRef.current = false;
      processingToken.current = null;
    }
  };

  /**
   * Manejo de TOKEN (tarjetas) - VERSIÓN CORREGIDA
   *
   * Esta función se ejecuta cuando Culqi devuelve un token después de que
   * el usuario ingresa los datos de su tarjeta.
   */
  const handleCulqiToken = async (token: CulqiTokenResponse) => {
    logger.log("✅ [handleCulqiToken] Token recibido:", token.id);

    // Validación: Permitir tokens de tarjeta y yape (ype_)
    logger.log("✅ [handleCulqiToken] Procesando token:", token.id);

    // Prevenir duplicados
    if (processingToken.current === token.id) {
      logger.warn("⚠️ Token ya procesado, ignorando duplicado:", token.id);
      return;
    }

    processingToken.current = token.id;
    isProcessingRef.current = true;
    closeCulqi();

    let payResponse: any;
    try {
      if (!currentPendingOrderId) {
        throw new Error("No se ha generado un ID de orden para el pago");
      }

      setProcessing(true);
      setProcessingStage("processing-payment");

      // Obtener email y persistirlo
      const email = await getEmailForPayment();
      if (!email) {
        throw new Error(
          "No se encontró el correo electrónico para procesar el pago",
        );
      }

      // PERSISTIR CONTEXTO 3DS PREVENTIVAMENTE
      pendingEmailRef.current = email;
      save3DSContext({
        email,
        token: token.id,
        pendingOrderId: currentPendingOrderId,
      });

      // GENERAR DEVICE FINGERPRINT PARA 3DS (CON VALIDACIÓN)
      // ═══════════════════════════════════════════════════════════
      let deviceFingerprint: string | undefined;

      try {
        // Verificar disponibilidad de Culqi3DS
        logger.log("🔍 [Fingerprint] Verificando Culqi3DS:", {
          exists: !!window.Culqi3DS,
          hasPublicKey: !!window.Culqi3DS?.publicKey,
          publicKeyPreview:
            window.Culqi3DS?.publicKey?.substring(0, 15) + "...",
          hasGenerateDevice:
            typeof window.Culqi3DS?.generateDevice === "function",
        });

        if (
          typeof window !== "undefined" &&
          window.Culqi3DS &&
          typeof window.Culqi3DS.generateDevice === "function"
        ) {
          // Si publicKey no está configurada, intentar configurarla ahora
          if (!window.Culqi3DS.publicKey) {
            logger.warn(
              "⚠️ [Fingerprint] Culqi3DS no tiene publicKey, intentando configurar...",
            );
            try {
              // Intentar asignación directa
              window.Culqi3DS.publicKey = CULQI_PUBLIC_KEY;
              logger.log("✅ [Fingerprint] PublicKey asignada:", {
                success: !!window.Culqi3DS.publicKey,
                preview: window.Culqi3DS.publicKey?.substring(0, 15) + "...",
              });
            } catch (err) {
              logger.error("❌ [Fingerprint] Error asignando publicKey:", err);
            }
          }

          // Si aún no tiene publicKey, intentar continuar (el objeto puede ser un Proxy que no permite lectura)
          if (!window.Culqi3DS.publicKey) {
            logger.warn(
              "⚠️ [Fingerprint] No se pudo leer publicKey después de asignación (posible Proxy), continuando...",
            );
          } else {
            logger.log("✅ [Fingerprint] PublicKey verificada correctamente");
          }
          logger.log("🔄 [Fingerprint] Llamando generateDevice()...");

          // IMPORTANTE: generateDevice() devuelve una Promise
          const fingerprintPromise = window.Culqi3DS.generateDevice();

          logger.log("📱 [Fingerprint] Tipo de retorno:", {
            type: typeof fingerprintPromise,
            isPromise: fingerprintPromise instanceof Promise,
          });

          // Await la Promise para obtener el valor real
          const fingerprint = await fingerprintPromise;

          logger.log("📱 [Fingerprint] Resultado después de await:", {
            value: fingerprint,
            type: typeof fingerprint,
            isString: typeof fingerprint === "string",
            isNumber: typeof fingerprint === "number",
            isObject: typeof fingerprint === "object",
          });

          // Convertir a string si es necesario y validar
          let fingerprintStr: string | undefined;

          if (fingerprint !== null && fingerprint !== undefined) {
            // Convertir a string si no lo es
            fingerprintStr =
              typeof fingerprint === "string"
                ? fingerprint
                : String(fingerprint);

            logger.log("🔄 [Fingerprint] Convertido a string:", {
              value: fingerprintStr,
              length: fingerprintStr.length,
            });

            // Validar que no esté vacío
            if (fingerprintStr && fingerprintStr.trim().length > 0) {
              deviceFingerprint = fingerprintStr;
              deviceFingerprintRef.current = fingerprintStr;
              logger.log(
                "✅ [Fingerprint] Device fingerprint generado y persistido:",
                fingerprintStr.substring(0, 20) + "...",
              );
            } else {
              logger.warn(
                "⚠️ [Fingerprint] Device fingerprint vacío después de conversión",
              );
            }
          } else {
            logger.warn(
              "⚠️ [Fingerprint] generateDevice() devolvió null o undefined",
            );
          }
        } else {
          logger.warn("⚠️ [Fingerprint] Culqi3DS.generateDevice no disponible");
        }
      } catch (error) {
        logger.error(
          "❌ [Fingerprint] Error generando device fingerprint:",
          error,
        );
      }

      // ═══════════════════════════════════════════════════════════
      // CONSTRUIR PAYLOAD DE PAGO
      // ═══════════════════════════════════════════════════════════
      const payPayload: {
        token: string;
        email: string;
        deviceFingerprint?: string;
      } = {
        token: token.id,
        email: email,
      };

      // Solo agregar deviceFingerprint si es un string válido
      if (
        deviceFingerprint &&
        typeof deviceFingerprint === "string" &&
        deviceFingerprint.trim().length > 0
      ) {
        payPayload.deviceFingerprint = deviceFingerprint;
        logger.log("📱 Enviando deviceFingerprint al backend");
      } else {
        logger.log(
          "ℹ️ Enviando pago sin deviceFingerprint (3DS no requerido o no disponible)",
        );
      }

      logger.log("💳 Payload de pago:", {
        email: payPayload.email,
        token: `${payPayload.token.substring(0, 10)}...`,
        hasFingerprint: !!payPayload.deviceFingerprint,
      });

      // ═══════════════════════════════════════════════════════════
      // PROCESAR PAGO
      // ═══════════════════════════════════════════════════════════
      logger.log(
        "💳 Procesando pago con tarjeta para orden " +
        currentPendingOrderId +
        "...",
      );

      payResponse = await payOrder(
        currentPendingOrderId.toString(),
        payPayload,
      );

      logger.log("📦 Payment response:", payResponse);

      // ═══════════════════════════════════════════════════════════
      // MANEJAR 3DS SI ES REQUERIDO
      // ═══════════════════════════════════════════════════════════
      if (payResponse.requires3DS) {
        logger.log("🔐 [3DS] Se requiere autenticación 3D Secure");
        logger.log("🔍 [3DS] Verificando disponibilidad:", {
          hasCulqi3DS: !!window.Culqi3DS,
          publicKey: window.Culqi3DS?.publicKey,
          hasOptions: !!window.Culqi3DS?.options,
        });

        try {
          logger.log("🔐 [3DS] Iniciando autenticación para token:", token.id);

          // Usar la función helper que ya incluye validaciones y configuración robusta
          init3DSAuthentication({
            token: token.id,
            amount: orderTotalRef.current || total,
            email: email,
          });

          logger.log(
            "✅ [3DS] Autenticación iniciada, esperando respuesta del banco...",
          );
          return; // Detener flujo y esperar callback window.culqi3DS
        } catch (error: any) {
          logger.error("❌ [3DS] Error al iniciar autenticación:", error);
          throw new Error(
            "No se pudo iniciar la autenticación 3D Secure. Intenta nuevamente.",
          );
        }
      }

      // ═══════════════════════════════════════════════════════════
      // VALIDAR ÉXITO DEL PAGO
      // ═══════════════════════════════════════════════════════════
      if (
        payResponse.success &&
        payResponse.data?.paymentStatus === "COMPLETED" &&
        payResponse.data?.status === "PAID" &&
        payResponse.data?.orderId
      ) {
        const confirmedOrderId = payResponse.data.orderId;
        logger.log("✅ Pago confirmado para orden #" + confirmedOrderId);
        await handlePaymentSuccess(confirmedOrderId);
      } else {
        // Preferir merchantMessage (detallado) sobre el message genérico
        const errorMsg =
          payResponse.error?.merchantMessage ||
          payResponse.message ||
          "El pago no pudo ser completado.";
        const err: any = new Error(errorMsg);
        err.code = payResponse.error?.code;
        err.declineCode = payResponse.error?.declineCode;
        throw err;
      }
    } catch (error: any) {
      logger.error("❌ Error en pago con tarjeta:", error);

      // ✅ MANEJO ESPECÍFICO DE CONFLICTO AWAITING_PAYMENT
      const errorMsg = error.message || "";
      if (
        errorMsg.includes("AWAITING_PAYMENT") ||
        errorMsg.includes("ya está siendo procesado")
      ) {
        logger.warn(
          "⚠️ Detectado conflicto con orden en estado AWAITING_PAYMENT",
        );

        // Informar al usuario sobre el conflicto de estados
        handleCulqiError({
          message:
            "Esta orden tiene un pago pendiente por procesar. Si acabas de usar Yape QR o PagoEfectivo, por favor espera unos minutos. Si deseas usar otro método, intenta nuevamente en un momento.",
        });
      } else {
        handleCulqiError(error);
      }
    } finally {
      // SOLO resetear si NO entramos en flujo 3DS
      // Si entramos en 3DS, el reset lo hará handlePaymentWith3DS o el listener de cierre
      if (!payResponse?.requires3DS) {
        setProcessing(false);
        isProcessingRef.current = false;
        processingToken.current = null;
      }
    }
  };

  /**
   * Manejo de ORDER (pagos asíncronos)
   */
  /**
   * Manejo de ORDER (pagos asíncronos) - VERSIÓN CORREGIDA
   */
  const handleCulqiOrder = async (order: CulqiOrderResponse) => {
    logger.log("✅ [handleCulqiOrder] Order recibida:", order.id);

    // 🔍 LOG COMPLETO DE LA ESTRUCTURA
    logger.log(
      "🔍 [ESTRUCTURA COMPLETA] Toda la orden:",
      JSON.stringify(order, null, 2),
    );

    // Log de campos específicos que podrían contener el método
    logger.log("🔍 [CAMPOS CLAVE]:", {
      payment_method_type: order.payment_method_type,
      payment_method: (order as any).payment_method,
      method: (order as any).method,
      type: order.object,
      state: order.state,
      qr_string: order.qr_string,
      qr: order.qr,
      payment_code: order.payment_code,
      cip_code: order.cip_code,
      cip: order.cip,
    });
    logger.log("✅ [handleCulqiOrder] Order recibida:", order.id);
    logger.log("📦 [handleCulqiOrder] Order completa:", order);
    logger.log(
      "📍 [handleCulqiOrder] payment_method_type:",
      order.payment_method_type,
    );

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
        logger.error("📦 Datos de orden:", {
          payment_method_type: order.payment_method_type,
          hasQR: !!(order.qr_string || order.qr),
          hasCIP: !!(order.payment_code || order.cip_code || order.cip),
        });
        throw new Error("No se pudo determinar el método de pago");
      }

      logger.log(`✅ Método detectado: ${asyncPaymentMethod}`);
      logger.log(
        `📍 payment_method_type original: ${order.payment_method_type}`,
      );

      // ═══════════════════════════════════════════════════════════
      // EXTRAER DATOS SEGÚN EL MÉTODO
      // ═══════════════════════════════════════════════════════════
      let qrData: string | null = null;
      let cipCode: string | null = null;

      // SIEMPRE extraer ambos datos si están disponibles
      qrData = order.qr_string || order.qr || null;
      cipCode = order.payment_code || order.cip_code || order.cip || null;

      logger.log("📦 Datos extraídos:", {
        hasQR: !!qrData,
        hasCIP: !!cipCode,
        qrPreview: qrData ? qrData.substring(0, 30) + "..." : null,
        cipValue: cipCode,
      });

      // Validar que tengamos el código correcto según el método detectado
      if (asyncPaymentMethod === "qr" && !qrData) {
        logger.error("❌ Método detectado es QR pero no hay código QR");
        throw new Error("No se generó el código QR. Intenta nuevamente.");
      }

      if (asyncPaymentMethod === "pagoefectivo" && !cipCode) {
        logger.error("❌ Método detectado es CIP pero no hay código CIP");
        throw new Error("No se generó el código CIP. Intenta nuevamente.");
      }

      if (qrData) logger.log("✅ QR extraído correctamente");
      if (cipCode) logger.log("✅ CIP extraído correctamente:", cipCode);

      // ═══════════════════════════════════════════════════════════
      // GUARDAR DATOS COMPLETOS EN LOCALSTORAGE
      // ═══════════════════════════════════════════════════════════
      const orderData = {
        orderId: order.id,
        paymentMethod: asyncPaymentMethod, // "qr" o "pagoefectivo"
        paymentMethodType: order.payment_method_type, // "yape", "billetera", "bancaMovil", "agente", etc.
        pendingOrderId: currentPendingOrderId,
        amount: order.amount / 100,
        currency: order.currency_code || "PEN",
        expirationDate: order.expiration_date
          ? new Date(order.expiration_date * 1000).toISOString()
          : null,
        qr: qrData, // Puede ser null
        paymentCode: cipCode, // Puede ser null
        timestamp: Date.now(),
        clientDetails: order.client_details,
      };

      logger.log("💾 Guardando datos en localStorage:", orderData);
      localStorage.setItem(
        "liwilu_last_culqi_order",
        JSON.stringify(orderData),
      );

      // ═══════════════════════════════════════════════════════════
      // REDIRIGIR A PÁGINA DE PAGO PENDIENTE
      // ═══════════════════════════════════════════════════════════
      const redirectUrl = `/pago-pendiente?order=${currentPendingOrderId}&method=${asyncPaymentMethod}`;
      logger.log(`🔄 Redirigiendo a: ${redirectUrl}`);

      await new Promise((resolve) => setTimeout(resolve, 100));

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

    let message =
      error.user_message ||
      error.error?.merchantMessage ||
      error.message ||
      "Ocurrió un error al procesar el pago. Por favor, intenta con otra tarjeta o método de pago.";
    let actionLabel: string | undefined;
    let onAction: (() => void) | undefined;

    // Detectar error de pago duplicado / en proceso
    if (
      message.includes("Este pedido ya está siendo procesado") ||
      message.includes("AWAITING_PAYMENT")
    ) {
      message =
        "Este pedido ya está siendo procesado. Si ya realizaste el pago, puedes verificar su estado.";
      actionLabel = "Ver estado del pedido";
      onAction = () => {
        const orderId = currentPendingOrderId || pendingOrderIdRef.current;
        if (orderId) {
          // Detectar el método capturado o usar 'card' como fallback
          const capturedMethod = getSelectedPaymentMethod() || "card";
          router.push(
            `/pago-pendiente?order=${orderId}&method=${capturedMethod}`,
          );
        } else {
          router.push("/perfil");
        }
      };
    }

    setErrorModal({
      isOpen: true,
      message,
      actionLabel,
      onAction,
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

  // ═══════════════════════════════════════════════════════════
  // MANEJO DE PERSISTENCIA 3DS
  // ═══════════════════════════════════════════════════════════

  const save3DSContext = (data: {
    email: string;
    token: string;
    pendingOrderId: number;
  }) => {
    try {
      const context = {
        ...data,
        deviceFingerprint: deviceFingerprintRef.current,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY_3DS, JSON.stringify(context));
      logger.log("💾 [3DS] Contexto guardado en sessionStorage");
    } catch (e) {
      logger.error("❌ [3DS] Error guardando contexto:", e);
    }
  };

  const recover3DSContext = () => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_3DS);
      if (raw) {
        const data = JSON.parse(raw);
        // Validar antigüedad (máximo 30 min)
        if (Date.now() - data.timestamp < 30 * 60 * 1000) {
          logger.log("🔄 [3DS] Contexto recuperado de sessionStorage");
          return data;
        }
        logger.warn("⚠️ [3DS] Contexto en sessionStorage es demasiado antiguo");
      }
    } catch (e) {
      logger.error("❌ [3DS] Error recuperando contexto:", e);
    }
    return {
      email: null,
      token: null,
      pendingOrderId: null,
      deviceFingerprint: null,
    };
  };

  const clear3DSContext = () => {
    sessionStorage.removeItem(STORAGE_KEY_3DS);
    pendingEmailRef.current = null;
    logger.log("🧹 [3DS] Contexto limpiado");
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
      if (!datosBoleta.numeroDocumento) {
        newErrors.rucBoleta = "El número de documento es obligatorio";
      } else {
        if (
          datosBoleta.tipoDocumento === "DNI" &&
          datosBoleta.numeroDocumento.length !== 8
        ) {
          newErrors.rucBoleta = "El DNI debe tener 8 dígitos";
        } else if (
          datosBoleta.tipoDocumento === "CE" &&
          (datosBoleta.numeroDocumento.length < 6 ||
            datosBoleta.numeroDocumento.length > 12)
        ) {
          newErrors.rucBoleta = "El CE debe tener entre 6 y 12 caracteres";
        } else if (
          datosBoleta.tipoDocumento === "Pasaporte" &&
          !/^[a-zA-Z][0-9]{7}$/.test(datosBoleta.numeroDocumento)
        ) {
          newErrors.rucBoleta = "El pasaporte debe tener 1 letra y 7 números";
        }
      }
      if (!datosBoleta.nombres) newErrors.nombres = "El nombre es obligatorio";
      if (!datosBoleta.apellidos)
        newErrors.apellidos = "El apellido es obligatorio";
      if (!datosBoleta.direccion)
        newErrors.direccion = "La dirección es obligatoria";
      if (!datosBoleta.distrito)
        newErrors.distrito = "El distrito es obligatorio";
    } else {
      // Factura
      if (!datosFactura.ruc || datosFactura.ruc.length !== 11) {
        newErrors.rucFactura = "El RUC debe tener 11 dígitos";
      } else if (!validateRUC(datosFactura.ruc)) {
        newErrors.rucFactura = "RUC inválido";
      }

      if (!datosFactura.razonSocial) {
        newErrors.razonSocial = "La razón social es obligatoria";
      }
      if (!datosFactura.direccionFiscal) {
        newErrors.direccionFiscal = "La dirección fiscal es obligatoria";
      }
      if (!datosFactura.distrito)
        newErrors.facturaDistrito = "El distrito es obligatorio";
    }

    if (!metodoPago) {
      newErrors.metodoPago = "Selecciona un método de pago";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handleConsultaRUC and handleConsultaDNI removed - replaced by useDocumentLookup hook

  /**
   * Verifica si una orden está expirada
   * @param expirationDate - Fecha de expiración en formato ISO
   * @returns true si la orden está expirada
   */
  const isOrderExpired = (
    expirationDate: string | null | undefined,
  ): boolean => {
    if (!expirationDate) return false;
    try {
      const expDate = new Date(expirationDate);
      const now = new Date();
      return expDate <= now;
    } catch {
      return false;
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

    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // NOTA: Movido setProcessing(true) más adelante para cumplir con el requerimiento
    // de no mostrar el overlay antes del modal de Culqi.

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
        isProcessingRef.current = false;
        return;
      }

      const email = await getEmailForPayment();
      if (!email) throw new Error("No se pudo obtener el email del usuario");
      pendingEmailRef.current = email;

      let pendingOrderId: number | null = null;
      let shouldCreateNewOrder = false;

      // 0️⃣ VERIFICAR ÓRDENES PENDIENTES (Solo para ASYNC)
      if (metodoPago === "async") {
        logger.log("🔍 Buscando orden pendiente previa (AWAITING_PAYMENT)...");
        try {
          const pendingAttemptResp =
            await getPendingOrderAttempt("AWAITING_PAYMENT");

          if (
            pendingAttemptResp.success &&
            pendingAttemptResp.data?.pendingOrderId
          ) {
            const existingOrderId = pendingAttemptResp.data.pendingOrderId;
            logger.log("✅ Orden pendiente encontrada:", existingOrderId);

            // Verificar estado real de la orden encontrada
            try {
              const statusResp = await checkAsyncPaymentStatus(existingOrderId);
              const status = statusResp.data?.status;
              logger.log("📊 Estado de orden pendiente:", status);

              if (status === "paid" && statusResp.data?.orderId) {
                logger.log("✅ La orden ya fue pagada, redirigiendo...");
                await handlePaymentSuccess(statusResp.data.orderId);
                return;
              }

              if (status === "expired" || status === "failed") {
                logger.warn("⏰ Orden expirada o fallida, se creará nueva");
                shouldCreateNewOrder = true;
              } else if (status === "waiting") {
                if (isOrderExpired(statusResp.data?.expirationDate)) {
                  logger.warn("⏰ Orden expirada por tiempo, se creará nueva");
                  shouldCreateNewOrder = true;
                } else {
                  pendingOrderId = existingOrderId;
                  logger.log("✅ Reutilizando orden válida:", pendingOrderId);
                }
              }
            } catch (statusError) {
              logger.error("❌ Error al verificar estado:", statusError);
              shouldCreateNewOrder = true;
            }
          } else {
            shouldCreateNewOrder = true;
          }
        } catch (e) {
          logger.warn("⚠️ Error al buscar orden pendiente previa:", e);
          shouldCreateNewOrder = true;
        }
      } else {
        // Para 'card', siempre crear nueva
        shouldCreateNewOrder = true;
      }

      // 1️⃣ CREAR ORDEN SI ES NECESARIO
      if (shouldCreateNewOrder || !pendingOrderId) {
        logger.log("📝 Creando nueva orden pendiente...");

        let invoicePayload: any = {
          invoiceType: tipoComprobante === "boleta" ? "BOLETA" : "FACTURA",
          invoiceData:
            tipoComprobante === "boleta"
              ? {
                tipoDocumento: datosBoleta.tipoDocumento,
                numeroDocumento: datosBoleta.numeroDocumento,
                nombres: datosBoleta.nombres,
                apellidos: datosBoleta.apellidos,
                direccion: datosBoleta.direccion,
                departamento: datosBoleta.departamento,
                provincia: datosBoleta.provincia,
                distrito: datosBoleta.distrito,
              }
              : {
                ruc: datosFactura.ruc,
                razonSocial: datosFactura.razonSocial,
                direccionFiscal: datosFactura.direccionFiscal,
                departamento: datosFactura.departamento,
                provincia: datosFactura.provincia,
                distrito: datosFactura.distrito,
              },
        };

        const orderResponse = await createOrder({
          ...invoicePayload,
          ...(trimegistoPreOrderId ? { preOrderId: trimegistoPreOrderId } : {}),
        });
        if (!orderResponse.success || !orderResponse.data?.pendingOrderId) {
          throw new Error(orderResponse.message || "Error al crear la orden");
        }
        pendingOrderId = orderResponse.data.pendingOrderId;
        logger.log("✅ Nueva orden creada:", pendingOrderId);
      }

      setCurrentPendingOrderId(pendingOrderId);
      pendingOrderIdRef.current = pendingOrderId;
      orderTotalRef.current = totals.total;

      // 2️⃣ ABRIR MODAL O PROCESAR ASYNC
      if (metodoPago === "card") {
        logger.log("💳 Iniciando tokenización con Culqi...");
        save3DSContext({ email, token: "", pendingOrderId: pendingOrderId! });

        openCulqiForTokenization({
          title: "Liwilu",
          currency: "PEN",
          description: `Pedido ${pendingOrderId!} - Liwilu Shop`,
          amount: totals.total,
        });

        // No mostramos overlay aquí, se mostrará en handleCulqiToken (etapa completing)
      } else if (metodoPago === "async") {
        logger.log("📱 [checkout.tsx] Iniciando pago asíncrono...");
        // setProcessing(true); // Podríamos mostrarlo aquí brevemente si getAsyncPaymentStatus es lento
        // setProcessingStage("completing");

        try {
          // Obtener estado actual y culqiOrderId
          const asyncStatusResp = await checkAsyncPaymentStatus(
            pendingOrderId!,
          );

          if (asyncStatusResp.success && asyncStatusResp.data) {
            const { status, culqiOrderId } = asyncStatusResp.data;

            // Ya pagada (doble verificación por seguridad)
            if (status === "paid" && asyncStatusResp.data.orderId) {
              await handlePaymentSuccess(asyncStatusResp.data.orderId);
              return;
            }

            // Reutilizar Culqi Order existente
            if (culqiOrderId && (status === "waiting" || !status)) {
              if (isOrderExpired(asyncStatusResp.data.expirationDate)) {
                logger.warn("⏰ Culqi Order expirado, se creará uno nuevo");
                throw new Error("EXPIRED_CULQI_ORDER");
              }

              logger.log("✅ Usando Culqi Order existente:", culqiOrderId);
              setCulqiOrderId(culqiOrderId);
              openCulqiForAsyncOrder({
                title: "Liwilu",
                currency:
                  (asyncStatusResp.data.currency as "PEN" | "USD") || "PEN",
                description: `Pedido ${pendingOrderId!} - Liwilu Shop`,
                amount: asyncStatusResp.data.total
                  ? asyncStatusResp.data.total
                  : totals.total,
                orderId: culqiOrderId,
              });
              isProcessingRef.current = false;
              return;
            }
          }

          // Crear nuevo Culqi Order
          logger.log("🔄 Creando nuevo Culqi Order...");
          const createCulqiResp = await createCulqiOrder(
            pendingOrderId!,
            email,
          );

          if (createCulqiResp.success && createCulqiResp.data?.culqiOrderId) {
            const newCulqiOrderId = createCulqiResp.data.culqiOrderId;
            logger.log("✅ Culqi Order creado:", newCulqiOrderId);
            setCulqiOrderId(newCulqiOrderId);
            openCulqiForAsyncOrder({
              title: "Liwilu",
              currency:
                (createCulqiResp.data.currency as "PEN" | "USD") || "PEN",
              description: `Pedido ${pendingOrderId!} - Liwilu Shop`,
              amount: createCulqiResp.data.amount
                ? createCulqiResp.data.amount
                : totals.total,
              orderId: newCulqiOrderId,
            });
          } else {
            throw new Error(
              createCulqiResp.message || "No se pudo crear la orden en Culqi",
            );
          }
        } catch (asyncError: any) {
          if (
            asyncError.message === "EXPIRED_CULQI_ORDER" ||
            asyncError.message?.includes("409")
          ) {
            // Reintentar creación forzada o recuperación en caso de conflicto
            const retryResp = await createCulqiOrder(pendingOrderId!, email);
            if (retryResp.success && retryResp.data?.culqiOrderId) {
              setCulqiOrderId(retryResp.data.culqiOrderId);
              openCulqiForAsyncOrder({
                title: "Liwilu",
                currency: (retryResp.data.currency as "PEN" | "USD") || "PEN",
                description: `Pedido ${pendingOrderId!} - Liwilu Shop`,
                amount: retryResp.data.amount
                  ? retryResp.data.amount
                  : totals.total,
                orderId: retryResp.data.culqiOrderId,
              });
            } else {
              throw asyncError;
            }
          } else {
            throw asyncError;
          }
        } finally {
          isProcessingRef.current = false;
        }
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
        actionLabel={errorModal.actionLabel}
        onAction={errorModal.onAction}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 my-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
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

            {/* TRIMEGISTO NOTICE - Solo si viene del link del correo */}
            {trimegistoPreOrderId && (
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4 flex items-start gap-3">
                <div>
                  <p className="font-semibold text-purple-900 text-sm">Pago con saldo Trimegisto</p>
                  <p className="text-purple-700 text-sm mt-0.5">
                    Estás completando el pago de tu pre-orden aprobada. Selecciona tu comprobante, método de pago y confirma.
                  </p>
                </div>
              </div>
            )}

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
                        value={datosBoleta.tipoDocumento}
                        onChange={(e) => {
                          setDatosBoleta({
                            ...datosBoleta,
                            tipoDocumento: e.target.value,
                          });
                          // Reset number on type change if needed, or keep it
                        }}
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">Carnet de Extranjería</option>
                        <option value="PASAPORTE">Pasaporte</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Número de documento
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={datosBoleta.numeroDocumento}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (datosBoleta.tipoDocumento === "PASAPORTE") {
                              value = value.replace(/[^a-zA-Z0-9]/g, "");
                            } else {
                              value = value.replace(/\D/g, "");
                            }
                            setDatosBoleta({
                              ...datosBoleta,
                              numeroDocumento: value,
                            });
                            resetBoletaConsulted();
                          }}
                          placeholder={
                            datosBoleta.tipoDocumento === "PASAPORTE"
                              ? "A1234567"
                              : "12345678"
                          }
                          maxLength={
                            datosBoleta.tipoDocumento === "DNI" ||
                              datosBoleta.tipoDocumento === "PASAPORTE"
                              ? 8
                              : 12
                          }
                          className={`
                            w-full px-4 py-3 border-2 rounded-sm transition-all duration-200 outline-none
                            ${errors.rucBoleta
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                              : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-green-200 hover:border-green-400"
                            }
                            ${datosBoleta.tipoDocumento === "DNI" ? "pr-12" : ""}
                          `.trim()}
                        />
                        {datosBoleta.tipoDocumento === "DNI" && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2">
                            {isConsultingDni ? (
                              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            ) : boletaConsulted ? (
                              <svg
                                className="w-5 h-5 text-green-500"
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
                            ) : (
                              <svg
                                className="w-5 h-5 text-gray-300"
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
                          </div>
                        )}
                      </div>
                      {errors.rucBoleta && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in">
                          <PiWarningCircleFill size={14} /> {errors.rucBoleta}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Nuevos campos Boleta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Nombres"
                        value={datosBoleta.nombres}
                        onChange={(e) =>
                          setDatosBoleta({
                            ...datosBoleta,
                            nombres: e.target.value,
                          })
                        }
                        error={errors.nombres}
                        disabled={boletaConsulted && datosBoleta.tipoDocumento === "DNI"}
                      />
                    </div>
                    <div>
                      <Input
                        label="Apellidos"
                        value={datosBoleta.apellidos}
                        onChange={(e) =>
                          setDatosBoleta({
                            ...datosBoleta,
                            apellidos: e.target.value,
                          })
                        }
                        error={errors.apellidos}
                        disabled={boletaConsulted && datosBoleta.tipoDocumento === "DNI"}
                      />
                    </div>
                  </div>
                  <div>
                    <Input
                      label="Dirección"
                      value={datosBoleta.direccion}
                      onChange={(e) =>
                        setDatosBoleta({
                          ...datosBoleta,
                          direccion: e.target.value,
                        })
                      }
                      placeholder="Calle, Número, Dpto..."
                      error={errors.direccion}
                    />
                  </div>

                  {/* Selectores de Ubicación para Boleta */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Select
                        label="Departamento"
                        value={boletaLocations.selectedDept}
                        onChange={(e) => {
                          const val = e.target.value;
                          boletaLocations.handleDeptChange(val);
                          setDatosBoleta((prev) => ({
                            ...prev,
                            departamento: val,
                            provincia: "",
                            distrito: "",
                          }));
                        }}
                      >
                        <option value="">Departamento</option>
                        {boletaLocations.departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Select
                        label="Provincia"
                        value={boletaLocations.selectedProv}
                        onChange={(e) => {
                          const val = e.target.value;
                          boletaLocations.handleProvChange(val);
                          setDatosBoleta((prev) => ({
                            ...prev,
                            provincia: val,
                            distrito: "",
                          }));
                        }}
                        disabled={!boletaLocations.selectedDept}
                      >
                        <option value="">Provincia</option>
                        {boletaLocations.provinces.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Select
                        label="Distrito"
                        value={boletaLocations.selectedDist}
                        onChange={(e) => {
                          const val = e.target.value;
                          boletaLocations.handleDistChange(val);
                          setDatosBoleta((prev) => ({
                            ...prev,
                            distrito: val,
                          }));
                        }}
                        disabled={!boletaLocations.selectedProv}
                        error={errors.distrito}
                      >
                        <option value="">Distrito</option>
                        {boletaLocations.districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </Select>
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
                            });
                            resetRucConsulted();
                          }}
                          placeholder="20123456789"
                          maxLength={11}
                          className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition pr-12"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2">
                          {isConsultingRuc ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          ) : rucConsulted ? (
                            <svg
                              className="w-5 h-5 text-green-500"
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
                          ) : (
                            <svg
                              className="w-5 h-5 text-gray-300"
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
                        </div>
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

                  {/* Selectores de Ubicación para Factura */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Select
                        label="Departamento"
                        value={facturaLocations.selectedDept}
                        onChange={(e) => {
                          const val = e.target.value;
                          facturaLocations.handleDeptChange(val);
                          setDatosFactura((prev) => ({
                            ...prev,
                            departamento: val,
                            provincia: "",
                            distrito: "",
                          }));
                        }}
                      >
                        <option value="">Departamento</option>
                        {facturaLocations.departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Select
                        label="Provincia"
                        value={facturaLocations.selectedProv}
                        onChange={(e) => {
                          const val = e.target.value;
                          facturaLocations.handleProvChange(val);
                          setDatosFactura((prev) => ({
                            ...prev,
                            provincia: val,
                            distrito: "",
                          }));
                        }}
                        disabled={!facturaLocations.selectedDept}
                      >
                        <option value="">Provincia</option>
                        {facturaLocations.provinces.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Select
                        label="Distrito"
                        value={facturaLocations.selectedDist}
                        onChange={(e) => {
                          const val = e.target.value;
                          facturaLocations.handleDistChange(val);
                          setDatosFactura((prev) => ({
                            ...prev,
                            distrito: val,
                          }));
                        }}
                        disabled={!facturaLocations.selectedProv}
                        error={errors.facturaDistrito}
                      >
                        <option value="">Distrito</option>
                        {facturaLocations.districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </Select>
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
                <button
                  onClick={() => setMetodoPago("card")}
                  className={`w-full flex items-center justify-between p-4 rounded-sm border transition-all ${metodoPago === "card"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs overflow-hidden">
                        <FaCreditCard className="text-gray-600" />
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Tarjeta de crédito / débito</p>
                      <p className="text-xs text-gray-500">
                        Visa, Mastercard o Amex
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

                <button
                  onClick={() => setMetodoPago("async")}
                  className={`w-full flex items-center justify-between p-4 rounded-sm border transition-all ${metodoPago === "async"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <FaQrcode className="text-2xl text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium">PagoEfectivo / QR / Yape</p>
                      <p className="text-xs text-gray-500">
                        Generar código CIP, QR o código de aprobación
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

              {errors.metodoPago && (
                <p className="text-red-500 text-sm mt-3">{errors.metodoPago}</p>
              )}
            </div>

            {/* Botón de pago */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
              <div className="order-2 sm:order-1">
                <Button
                  onClick={handleProcesarPago}
                  disabled={processing || isProcessingRef.current}
                >
                  Confirmar Pago
                </Button>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA - RESUMEN */}
          <div className="lg:col-span-1 lg:sticky lg:top-32 self-start animate-fade-in relative z-10">
            <div className="bg-white rounded-md shadow-lg p-6">
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
                    {formatPrice(totals.subtotal.toString())}
                  </span>
                </div>

                {/* Descuentos por promociones/cupones */}
                {totals.promoDiscount !== undefined &&
                  totals.promoDiscount > 0 && (
                    <div className="flex justify-between text-primary font-medium text-sm">
                      <span className="flex items-center gap-1.5">
                        <FaTag size={12} />
                        Promociones / Cupones
                      </span>
                      <span>
                        -{formatPrice(totals.promoDiscount.toString())}
                      </span>
                    </div>
                  )}

                {/* Otros descuentos globales/reglas */}
                {totals.discount !== undefined && totals.discount > 0 && (
                  <div className="flex justify-between text-primary font-medium text-sm">
                    <span className="flex items-center gap-1.5">
                      Descuento Adicional
                    </span>
                    <span>-{formatPrice(totals.discount.toString())}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Envío</span>
                  <span className="font-medium text-gray-900">
                    {totals.shipping === 0 ? (
                      <span className="text-primary font-medium">Gratis</span>
                    ) : (
                      formatPrice(totals.shipping.toString())
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-4 border-t border-gray-100">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary">
                    {formatPrice(totals.total.toString())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Script
        src="https://3ds.culqi.com"
        strategy="afterInteractive"
        onLoad={() => {
          logger.log("📦 Script de Culqi 3DS cargado");
          configureCulqi3DS();
        }}
        onError={() => logger.error("❌ Error al cargar Culqi 3DS")}
      />
      <Script
        src="https://checkout.culqi.com/js/v4"
        strategy="afterInteractive"
        onLoad={handleCulqiLoad}
        onError={() => logger.error("❌ Error al cargar Culqi Checkout")}
      />
    </Layout>
  );
}
