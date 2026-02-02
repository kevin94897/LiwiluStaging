"use client";

import { useEffect, useState } from "react";
import { PiWarningCircleFill } from "react-icons/pi";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import {
  autorizacionSchema,
  AutorizacionSchemaType,
} from "@/lib/autorizacionSchema";
import { consultaDNI, consultaRUC } from "@/lib/general";
import { showToast } from "@/lib/notifications";
import { FaSearch, FaSpinner } from "react-icons/fa";

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

  const [isConsulted, setIsConsulted] = useState(false);
  const [consulting, setConsulting] = useState(false);

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
        setIsConsulted(false);
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
    if (name === "documentType") {
      setIsConsulted(false);
    }
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
      setIsConsulted(false);
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

  const handleConsultation = async () => {
    if (!formData.documentType || !formData.documentNumber) {
      showToast("Selecciona un tipo y número de documento", "error");
      return;
    }

    setConsulting(true);
    setErrors({});

    try {
      if (formData.documentType === "DNI") {
        if (formData.documentNumber.length !== 8) {
          showToast("El DNI debe tener 8 dígitos", "error");
          setConsulting(false);
          return;
        }

        const res = await consultaDNI(formData.documentNumber);
        if (res.success) {
          setFormData((prev) => ({
            ...prev,
            fullName: res.data.nombre_completo,
          }));
          setIsConsulted(true);
          showToast("Datos encontrados", "success");
        } else {
          showToast("No se encontraron datos para este DNI", "error");
        }
      } else if (formData.documentType === "RUC") {
        if (formData.documentNumber.length !== 11) {
          showToast("El RUC debe tener 11 números y empezar con 10, 15 o 20", "error");
          setConsulting(false);
          return;
        }

        const res = await consultaRUC(formData.documentNumber);
        if (res.success) {
          setFormData((prev) => ({
            ...prev,
            fullName: res.data.nombre_o_razon_social,
          }));
          setIsConsulted(true);
          showToast("Datos de empresa encontrados", "success");
        } else {
          showToast("No se encontraron datos para este RUC", "error");
        }
      } else {
        showToast("Consulta disponible solo para DNI y RUC", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error al consultar el documento", "error");
    } finally {
      setConsulting(false);
    }
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
                <Select
                  label="Tipo de documento *"
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  error={errors.documentType}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">Carnet de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </Select>
              </div>

              {/* Número de Documento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Documento *
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleDocumentNumberChange}
                    className="pr-12"
                    error={errors.documentNumber}
                  />
                  {(formData.documentType === "DNI" ||
                    formData.documentType === "RUC") && (
                      <button
                        type="button"
                        onClick={handleConsultation}
                        disabled={consulting || !formData.documentNumber}
                        className="absolute right-3 top-[14px] text-gray-400 hover:text-primary transition disabled:opacity-50"
                        title="Consultar Documento"
                      >
                        {consulting ? (
                          <FaSpinner className="animate-spin text-lg" />
                        ) : (
                          <FaSearch className="text-lg" />
                        )}
                      </button>
                    )}
                </div>
              </div>

              {/* Nombre y apellido */}
              <div>
                <Input
                  label="Nombre y apellido *"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={
                    isConsulted
                      ? "bg-gray-100 text-gray-500"
                      : "bg-white text-gray-700"
                  }
                  error={errors.fullName}
                />
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
