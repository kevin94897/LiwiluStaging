// components/cart/TrismegistoConsentModal.tsx
"use client";

import { useState } from "react";
import { PiX, PiFilePdfFill, PiCheckCircleFill, PiDownloadSimpleFill } from "react-icons/pi";
import Button from "@/components/ui/Button";
import { CheckmarkIcon } from "react-hot-toast";
import { FaCheckCircle } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";

interface TrismegistoConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Relative URL to the PDF document (e.g. /uploads/consent-files/consent_f3b...a1.pdf) */
  documentUrl: string;
  isLoading?: boolean;
}

export default function TrismegistoConsentModal({
  isOpen,
  onClose,
  onConfirm,
  documentUrl,
  isLoading = false,
}: TrismegistoConsentModalProps) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  // NEXT_PUBLIC_API_URL = "https://backend.com/api"
  // El PDF vive en la raíz del backend: "https://backend.com/uploads/..."
  const backendBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/?$/, "");

  const absoluteDocumentUrl = documentUrl.startsWith("http")
    ? documentUrl
    : `${backendBase}${documentUrl}`;

  // Proxy same-origin para evitar X-Frame-Options / CORS del servidor de Railway
  const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(absoluteDocumentUrl)}`;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-[100] animate-fade-in backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto flex flex-col animate-scale-in overflow-hidden"
          style={{ maxHeight: "100vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <PiFilePdfFill className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Documento de consentimiento
                </h2>
                {/* <p className="text-sm text-gray-500">
                  Revisa el documento antes de continuar
                </p> */}
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

          {/* PDF via iframe (proxy same-origin) */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <iframe
              src={`${proxyUrl}#navpanes=0&view=FitH`}
              className="w-full h-full border-0"
              style={{ minHeight: "900px" }}
              title="Documento de consentimiento"
            />
          </div>

          {/* Descarga */}
          {/* <div className="px-6 pt-3 shrink-0">
            <a
              href={proxyUrl}
              download="consentimiento-trimegisto.pdf"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <PiDownloadSimpleFill size={14} />
              Descargar documento
            </a>
          </div> */}

          {/* Aceptación y acciones */}
          <div className="px-6 py-5 border-t border-gray-100 space-y-4 shrink-0">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  id="consent-accept"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${accepted
                      ? "bg-primary border-primary"
                      : "border-gray-300 group-hover:border-primary/60"
                    }`}
                >
                  {accepted && <FaCheck className="text-white" size={14} />}
                </div>
              </div>
              <span className="text-sm text-gray-700 leading-snug">
                He leído y acepto el documento de consentimiento informado referido
                al uso de mi saldo Trismegisto para esta compra.
              </span>
            </label>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onConfirm}
                disabled={!accepted || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  "Continuar"
                )}
              </Button>
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
