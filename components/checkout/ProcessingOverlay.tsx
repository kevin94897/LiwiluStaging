import { useEffect, useState } from "react";

interface ProcessingOverlayProps {
  isProcessing: boolean;
  stage: "creating-order" | "processing-payment" | "completing";
}

export default function ProcessingOverlay({
  isProcessing,
  stage,
}: ProcessingOverlayProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing]);

  if (!isProcessing) return null;

  const getMessage = () => {
    if (elapsedSeconds < 5) {
      return "Procesando tu pedido...";
    } else if (elapsedSeconds < 10) {
      return "Estamos validando tu información...";
    } else if (elapsedSeconds < 20) {
      return "Tu banco está procesando la solicitud, por favor espera...";
    } else {
      return "Gracias por tu paciencia. Esto puede tomar un momento con conexiones lentas...";
    }
  };

  const getStageMessage = () => {
    switch (stage) {
      case "creating-order":
        return "Generando tu orden de compra";
      case "processing-payment":
        return "Procesando el pago con tu banco";
      case "completing":
        return "Finalizando tu compra";
      default:
        return "Procesando";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full mx-4 animate-scale-in">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
        </div>

        {/* Stage */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          {getStageMessage()}
        </h2>

        {/* Dynamic Message */}
        <p className="text-gray-600 text-center mb-6">{getMessage()}</p>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">
                No refresques esta página
              </p>
              <p className="text-xs text-amber-700">
                Cerrar o recargar la página puede causar problemas con tu pago.
                Por favor espera hasta que el proceso termine.
              </p>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        {elapsedSeconds > 15 && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Tiempo transcurrido: {elapsedSeconds}s
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
