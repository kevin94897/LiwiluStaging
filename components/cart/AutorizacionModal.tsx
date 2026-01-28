"use client";

import { useEffect, useState } from "react";
import { PiWarningCircleFill } from "react-icons/pi";
import Button from "../ui/Button";
import {
  autorizacionSchema,
  AutorizacionSchemaType,
} from "@/lib/autorizacionSchema";

interface AutorizacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AutorizacionSchemaType) => void;
  initialData?: AutorizacionSchemaType | null;
}

export default function AutorizacionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AutorizacionModalProps) {
  const [formData, setFormData] = useState<AutorizacionSchemaType>({
    documentType: "DNI",
    documentNumber: "",
    fullName: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AutorizacionSchemaType, string>>
  >({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          documentType: "DNI",
          documentNumber: "",
          fullName: "",
        });
      }
      setErrors({});
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, initialData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleDocumentNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value.replace(/\D/g, "");
    const maxLength = formData.documentType === "RUC" ? 11 : 15;
    if (value.length <= maxLength) {
      setFormData((prev) => ({ ...prev, documentNumber: value }));
      setErrors((prev) => ({ ...prev, documentNumber: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = autorizacionSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      const newErrors: Partial<Record<keyof AutorizacionSchemaType, string>> =
        {};

      for (const key in formattedErrors) {
        const errorArray = formattedErrors[key as keyof typeof formattedErrors];
        if (errorArray && errorArray.length > 0) {
          newErrors[key as keyof AutorizacionSchemaType] = errorArray[0];
        }
      }

      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full pointer-events-auto animate-scale-in overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 md:p-12 relative z-10">
            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
              aria-label="Cerrar modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary-dark mb-3">
                Autorizo que alguien más retire
              </h2>
              <p className="text-gray-600 text-sm">
                Ingresa los datos de la persona que recogerá tu pedido.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Tipo de documento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de documento *
                </label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-sm transition bg-white text-gray-700 ${
                    errors.documentType
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-primary focus:border-transparent"
                  }`}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">Carnet de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
                {errors.documentType && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <PiWarningCircleFill size={16} /> {errors.documentType}
                  </p>
                )}
              </div>

              {/* Número de Documento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleDocumentNumberChange}
                  // placeholder="74218601"
                  className={`w-full px-4 py-3 border-2 rounded-sm transition ${
                    errors.documentNumber
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-primary focus:border-transparent"
                  }`}
                />
                {errors.documentNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <PiWarningCircleFill size={16} /> {errors.documentNumber}
                  </p>
                )}
              </div>

              {/* Nombre y apellido */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre y apellido *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  // placeholder="Nombres Apellidos"
                  className={`w-full px-4 py-3 border-2 rounded-sm transition ${
                    errors.fullName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-primary focus:border-transparent"
                  }`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <PiWarningCircleFill size={16} /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Botón Guardar */}
              <Button
                size="md"
                variant="primary"
                className="w-full"
                type="submit"
              >
                Guardar autorización
              </Button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
