// components/Contacto.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "./ui/Button";
import {
  contactoSchema,
  ContactoSchemaType,
} from "@/lib/componentcontactoSchema";
import { PiWarningCircleFill } from "react-icons/pi";
import { showToast } from "@/lib/notifications";
import { sanitizeObject } from "@/lib/sanitize";
import { apiPost } from "@/lib/auth/apiClient";

export default function Contacto() {
  const [formData, setFormData] = useState<ContactoSchemaType>({
    celular: "",
    documento: "",
    aceptaPrivacidad: false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactoSchemaType, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpiar error del campo
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Solo números
    if (value.length <= 9) {
      setFormData((prev) => ({ ...prev, celular: value }));
      setErrors((prev) => ({ ...prev, celular: undefined }));
    }
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Solo números
    if (value.length <= 11) {
      setFormData((prev) => ({ ...prev, documento: value }));
      setErrors((prev) => ({ ...prev, documento: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validación con Zod
    const result = contactoSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      const newErrors: Partial<Record<keyof ContactoSchemaType, string>> = {};

      for (const key in formattedErrors) {
        const errorArray = formattedErrors[key as keyof typeof formattedErrors];
        if (errorArray && errorArray.length > 0) {
          newErrors[key as keyof ContactoSchemaType] = errorArray[0];
        }
      }

      setErrors(newErrors);
      setIsSubmitting(false);
      console.log("Errores de validación:", newErrors);
      return;
    }

    // Si es válido
    setErrors({});
    const sanitizedFormData = sanitizeObject(formData);

    try {
      const response = await apiPost(
        "/general/solicitud-mayorista",
        {
          celular: `+51${sanitizedFormData.celular}`,
          numeroDocumento: sanitizedFormData.documento,
          aceptaPoliticasPrivacidad: sanitizedFormData.aceptaPrivacidad,
        },
        { skipAuth: true },
      );

      const apiResult = await response.json();

      if (response.ok && apiResult.success) {
        showToast("Solicitud enviada. Un asesor se contactará pronto.");
        // Resetear formulario
        setFormData({
          celular: "",
          documento: "",
          aceptaPrivacidad: false,
        });
      } else {
        const errorMsg =
          apiResult.message || "Hubo un error. Intenta nuevamente.";
        showToast(errorMsg, "error");

        // Si hay errores de validación específicos del backend, mostrarlos en el formulario
        if (apiResult.errors) {
          const backendErrors: Partial<Record<keyof ContactoSchemaType, string>> =
            {};
          if (apiResult.errors.celular)
            backendErrors.celular = apiResult.errors.celular;
          if (apiResult.errors.numeroDocumento)
            backendErrors.documento = apiResult.errors.numeroDocumento;
          if (apiResult.errors.aceptaPoliticasPrivacidad)
            backendErrors.aceptaPrivacidad =
              apiResult.errors.aceptaPoliticasPrivacidad;

          setErrors((prev) => ({ ...prev, ...backendErrors }));
        }
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      showToast("Hubo un error de conexión. Intenta nuevamente.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative md:min-h-screen flex flex-col md:flex-row bg-primary">
      {/* Lado Izquierdo */}
      <div className="relative w-full md:w-1/2 flex items-start justify-center px-8 py-16 overflow-hidden">
        {/* Imagen de fondo */}
        <Image
          src="/images/liwilu_contacto_banner.png"
          alt="Productos de limpieza"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover"
        />


        {/* Contenido */}
        <div className="relative z-10 text-white text-center flex flex-col items-center">
          <Image
            src="/images/liwilu_logo-xl.png"
            alt="Liwilu Logo"
            width={180}
            height={60}
            style={{ width: "180px", height: "auto" }}
          />

          <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
            Compra al por
          </h2>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-[65px] whitespace-nowrap">
            MAYOR
          </h1>
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="relative w-full md:w-1/2 bg-primary flex items-center justify-center p-10 md:-ml-12 z-20 rounded-tl-xl rounded-bl-xl">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md text-white space-y-6"
        >
          <h2 className="text-3xl md:text-6xl font-semibold text-white text-left md:text-left">
            ¿Estás interesado(a)?
          </h2>

          {/* Campo: Número de celular */}
          <div>
            <input
              type="tel"
              name="celular"
              value={formData.celular}
              onChange={handleCelularChange}
              className={`w-full bg-transparent border-b focus:outline-none text-white placeholder-white/60 py-2 ${errors.celular
                ? "border-red-500 focus:border-red-500"
                : "border-white/70 focus:border-white"
                }`}
              placeholder="Numero de celular (9 dígitos)"
              maxLength={9}
            />
            {errors.celular && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <PiWarningCircleFill size={14} /> {errors.celular}
              </p>
            )}
          </div>

          {/* Campo: DNI / CE / RUC */}
          <div>
            <input
              type="text"
              name="documento"
              value={formData.documento}
              onChange={handleDocumentoChange}
              className={`w-full bg-transparent border-b focus:outline-none text-white placeholder-white/60 py-2 ${errors.documento
                ? "border-red-500 focus:border-red-500"
                : "border-white/70 focus:border-white"
                }`}
              placeholder="DNI / CE / RUC"
              maxLength={11}
            />
            {errors.documento && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <PiWarningCircleFill size={14} /> {errors.documento}
              </p>
            )}
          </div>

          {/* Checkbox */}
          <div>
            <div className="flex items-start gap-2 text-sm mt-4">
              <input
                type="checkbox"
                id="privacidad"
                name="aceptaPrivacidad"
                checked={formData.aceptaPrivacidad}
                onChange={handleChange}
                className={`mt-1 accent-white ${errors.aceptaPrivacidad
                  ? "outline outline-2 outline-red-300"
                  : ""
                  }`}
              />
              <label
                htmlFor="privacidad"
                className="text-white/90 leading-snug"
              >
                He leído y acepto las{" "}
                <a
                  href="/privacidad"
                  className="underline text-white hover:text-white/80"
                >
                  políticas de privacidad
                </a>
              </label>
            </div>
            {errors.aceptaPrivacidad && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <PiWarningCircleFill size={14} /> {errors.aceptaPrivacidad}
              </p>
            )}
          </div>

          {/* Botón */}
          <div className="text-center pt-2">
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Enviando...
                </span>
              ) : (
                "Solicite un asesor"
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
