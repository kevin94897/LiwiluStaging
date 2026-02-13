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
  configureCulqi3DS,
  init3DSAuthentication,
  closeCulqi,
  resetCulqi,
  detectAsyncPaymentMethod,
  CULQI_PUBLIC_KEY,
} from "@/lib/culqi";
import { showToast } from "@/lib/notifications";
import { createOrder, payOrder, createCulqiOrder } from "@/lib/cart";
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

  // Control de duplicados y estado persistente para callbacks
  const processingToken = useRef<string | null>(null);
  const isProcessingRef = useRef(false);
  const pendingOrderIdRef = useRef<number | null>(null);
  const orderTotalRef = useRef<number>(0);
  const deviceFingerprintRef = useRef<string | null>(null);

  // ============================================
  // VALIDACIÓN Y ERRORES
  // ============================================
  const [isConsultingRuc, setIsConsultingRuc] = useState(false);
  const [rucConsulted, setRucConsulted] = useState(false);
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

    // ═══════════════════════════════════════════════════════════
    // CONFIGURAR CALLBACK PARA 3DS
    // ═══════════════════════════════════════════════════════════
    if (typeof window !== "undefined") {
      // @ts-ignore
      window.culqi3DS = async () => {
        logger.log("🔐 [3DS CALLBACK] Respuesta recibida de Culqi3DS");
        logger.log("📦 [3DS STATE] window.Culqi3DS:", {
          hasToken: !!window.Culqi3DS?.token,
          hasError: !!window.Culqi3DS?.error,
          token: window.Culqi3DS?.token,
          error: window.Culqi3DS?.error,
        });

        if (window.Culqi3DS?.token) {
          const result = window.Culqi3DS.token;
          logger.log("🔐 [3DS] Autenticación completada con éxito:", result);

          // Reintentar pago con datos 3DS
          await handlePaymentWith3DS(result);
        } else if (window.Culqi3DS?.error) {
          logger.error(
            "❌ [3DS] Error en autenticación:",
            window.Culqi3DS.error,
          );
          showToast(
            window.Culqi3DS.error.user_message || "Error en autenticación 3DS",
            "error",
          );
          setProcessing(false);
          isProcessingRef.current = false;
        } else {
          logger.warn("⚠️ [3DS] Callback sin token ni error");
        }
      };

      // Listener para cierre del modal 3DS
      const handle3DSClosed = () => {
        logger.log("🚪 [3DS] Modal cerrado detectado");
        setProcessing(false);
        isProcessingRef.current = false;
      };

      window.addEventListener("culqi-3ds-closed", handle3DSClosed);

      // ═══════════════════════════════════════════════════════════
      // LISTENER DE EMERGENCIA PARA postMessage (Bypass de bloqueo de origen)
      // ═══════════════════════════════════════════════════════════
      /**
       * Algunos navegadores bloquean el mensaje de Cardinal (3DS)
       * por ser cross-origin. Este listener captura el mensaje
       * manualmente si el SDK de Culqi no lo procesa.
       */
      const handleEmergency3DSMessage = async (event: MessageEvent) => {
        // Orígenes conocidos de 3DS/Cardinal y Culqi
        const allowedOrigins = [
          "https://checkout.culqi.com",
          "https://centinelapistag.cardinalcommerce.com",
          "https://0merchantacsstag.cardinalcommerce.com",
          "https://cas.client.cardinaltrusted.com",
          "https://1merchantacsstag.cardinalcommerce.com",
        ];

        // Logs de diagnóstico para ver qué llega exactamente
        if (
          event.data &&
          (event.data.parameters3DS ||
            event.data.error ||
            event.data.action?.includes("3ds"))
        ) {
          logger.log("🔍 [3DS EVT] Mensaje interceptado:", {
            origin: event.origin,
            hasParams: !!event.data.parameters3DS,
            processing: isProcessingRef.current,
          });
        }

        // Si el mensaje viene de un origen permitido y contiene parámetros de 3DS
        if (
          (allowedOrigins.some((origin) => event.origin.includes(origin)) ||
            event.origin === window.location.origin) &&
          event.data &&
          event.data.parameters3DS
        ) {
          if (isProcessingRef.current) {
            logger.log("🚀 [3DS EMERGENCY] Forzando procesamiento de pago...");
            await handlePaymentWith3DS(event.data.parameters3DS);
          }
        }
      };

      window.addEventListener("message", handleEmergency3DSMessage, false);

      // Nota: El cleanup se hace en el useEffect principal si fuera necesario.
    }
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

  // Función para reintentar pago con 3DS (Definida fuera para acceso global en componente)
  const handlePaymentWith3DS = async (auth3DS: any) => {
    try {
      logger.log("[3DS] Reintentando pago con parametros de autenticacion...");

      const email = await getEmailForPayment();
      // Usar processingToken.current o buscar el token reciente
      const token =
        processingToken.current || (window.Culqi && window.Culqi.token?.id);

      const orderId = currentPendingOrderId || pendingOrderIdRef.current;

      if (!email || !token || !orderId) {
        logger.error("[3DS] Faltan datos:", {
          email,
          token,
          pendingOrder: orderId,
        });
        throw new Error("Datos incompletos para reintento 3DS");
      }

      const payResponse = await payOrder(orderId.toString(), {
        token: token,
        email: email,
        authentication3DS: {
          eci: auth3DS.eci,
          xid: auth3DS.xid,
          cavv: auth3DS.cavv,
          protocolVersion: auth3DS.protocolVersion,
          directoryServerTransactionId: auth3DS.directoryServerTransactionId,
        },
        deviceFingerprint: deviceFingerprintRef.current || undefined,
      });

      logger.log("[3DS] Respuesta de reintento:", payResponse);

      if (
        payResponse.success &&
        payResponse.data?.paymentStatus === "COMPLETED"
      ) {
        const confirmedOrderId = payResponse.data.orderId;
        logger.log("[3DS] Pago confirmado para orden #" + confirmedOrderId);
        await handlePaymentSuccess(confirmedOrderId);
      } else {
        const msg = payResponse.message || "Error al confirmar pago 3DS";
        throw new Error(msg);
      }
    } catch (error: any) {
      logger.error("[3DS] Error final:", error);
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

      // Obtener email
      const email = await getEmailForPayment();
      if (!email) {
        throw new Error(
          "No se encontró el correo electrónico para procesar el pago",
        );
      }

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
        const errorMsg =
          payResponse.message || "El pago no pudo ser completado.";
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      logger.error("❌ Error en pago con tarjeta:", error);
      handleCulqiError(error);
    } finally {
      // SOLO resetear si NO entramos en flujo 3DS
      // Si entramos en 3DS, el reset lo hará handlePaymentWith3DS o el listener de cierre
      if (!payResponse?.requires3DS) {
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
          router.push(`/pago-pendiente?order=${orderId}&method=card`);
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
      pendingOrderIdRef.current = pendingOrderId;

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

        const culqiOrderResponse = await createCulqiOrder(
          pendingOrderId,
          email,
        );

        logger.log(
          "✅ [checkout.tsx] Orden Culqi generada:",
          culqiOrderResponse,
        );

        if (
          culqiOrderResponse.success &&
          culqiOrderResponse.data?.culqiOrderId
        ) {
          const culqiOrderId = culqiOrderResponse.data.culqiOrderId;
          setCulqiOrderId(culqiOrderId);

          openCulqiForAsyncOrder({
            title: "Liwilu",
            currency: culqiOrderResponse.data.currency || "PEN",
            description: `Pedido ${pendingOrderId} - Liwilu Shop`,
            amount: culqiOrderResponse.data.amount || total,
            orderId: culqiOrderId,
          });

          setProcessing(false);
        } else {
          throw new Error("No se pudo generar el ID de orden de Culqi");
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
                {/* Tarjeta y Yape (Código) */}
                <button
                  onClick={() => setMetodoPago("card")}
                  className={`w-full flex items-center justify-between p-4 rounded-sm border transition-all ${
                    metodoPago === "card"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs overflow-hidden">
                        <FaCreditCard className="text-gray-600" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-purple-100 border border-white flex items-center justify-center text-[10px] font-bold text-purple-600 overflow-hidden">
                        Yape
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Tarjeta o Yape con Código</p>
                      <p className="text-xs text-gray-500">
                        Visa, Mastercard, Amex, Yape (Código aprobación)
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
                  className={`w-full flex items-center justify-between p-4 rounded-sm border transition-all ${
                    metodoPago === "async"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaQrcode className="text-2xl text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium">PagoEfectivo / QR</p>
                      <p className="text-xs text-gray-500">
                        Generar código CIP o QR
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
