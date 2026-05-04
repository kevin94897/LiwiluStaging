// components/cart/TrismegistoOTPModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { PiX, PiEnvelopeFill, PiWarningCircleFill, PiCheckCircleFill } from "react-icons/pi";
import { FaSpinner } from "react-icons/fa";
import Button from "@/components/ui/Button";
import { verifyTrismegistoOTP, resendTrismegistoOTP, VerifyOTPResponse, InvoiceDataBoleta, InvoiceDataFactura } from "@/lib/trimegisto";
import logger from "@/lib/logger";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

interface TrismegistoOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** preOrderId from /initiate response */
  preOrderId: string;
  /** Called with verify-otp response on success */
  onSuccess: (data: VerifyOTPResponse) => void;
  /** Invoice type to include in the verify-otp request */
  invoiceType?: 'BOLETA' | 'FACTURA';
  /** Invoice data to include in the verify-otp request */
  invoiceData?: InvoiceDataBoleta | InvoiceDataFactura;
}

export default function TrismegistoOTPModal({
  isOpen,
  onClose,
  preOrderId,
  onSuccess,
  invoiceType,
  invoiceData,
}: TrismegistoOTPModalProps) {
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start cooldown timer immediately when modal opens
  useEffect(() => {
    if (isOpen) {
      setCooldown(RESEND_COOLDOWN);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setError(null);
      setResendSuccess(false);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Auto-focus first input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const otpCode = otpDigits.join("");

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError(null);

    // auto-advance
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otpCode.length === OTP_LENGTH) {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newDigits = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { newDigits[i] = ch; });
    setOtpDigits(newDigits);
    const nextEmpty = pasted.length < OTP_LENGTH ? pasted.length : OTP_LENGTH - 1;
    inputRefs.current[nextEmpty]?.focus();
  };

  const handleVerify = async () => {
    if (otpCode.length !== OTP_LENGTH) return;
    setIsVerifying(true);
    setError(null);
    try {
      const data = await verifyTrismegistoOTP(preOrderId, otpCode, invoiceType, invoiceData);
      onSuccess(data);
    } catch (err: any) {
      logger.error("[OTP Modal] Verification error:", err);
      setError(err.message || "Código OTP inválido o expirado");
      // Clear input for retry
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setResendSuccess(false);
    setError(null);
    try {
      await resendTrismegistoOTP(preOrderId);
      setResendSuccess(true);
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      setError(err.message || "Error al reenviar el código");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-[100] animate-fade-in backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-scale-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <PiEnvelopeFill className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Verificación de código
                </h2>
                <p className="text-sm text-gray-500">
                  Ingresa el código enviado a tu correo
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <PiX size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-8 space-y-6">
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Te hemos enviado un código OTP de{" "}
              <strong>{OTP_LENGTH} dígitos</strong> a tu correo electrónico.
              El código tiene una vigencia de <strong>10 minutos</strong>.
            </p>

            {/* OTP inputs */}
            <div
              className="flex justify-center gap-3"
              onPaste={handlePaste}
            >
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-sm outline-none transition-all
                    ${error
                      ? "border-red-400 bg-red-50"
                      : digit
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <PiWarningCircleFill size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Resend success */}
            {resendSuccess && !error && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <PiCheckCircleFill size={16} className="shrink-0" />
                Nuevo código enviado exitosamente
              </div>
            )}

            {/* Verify button */}
            <Button
              variant="primary"
              size="md"
              onClick={handleVerify}
              disabled={otpCode.length !== OTP_LENGTH || isVerifying}
              className="w-full"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" size={14} />
                  Verificando...
                </span>
              ) : (
                "Verificar código"
              )}
            </Button>

            {/* Resend */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">¿No recibiste el código?</p>
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || isResending}
                className="text-sm font-semibold text-primary hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto"
              >
                {isResending ? (
                  <>
                    <FaSpinner className="animate-spin" size={12} />
                    Reenviando...
                  </>
                ) : cooldown > 0 ? (
                  `Reenviar código (${cooldown}s)`
                ) : (
                  "Reenviar código"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.25s ease-out; }
      `}</style>
    </>
  );
}
