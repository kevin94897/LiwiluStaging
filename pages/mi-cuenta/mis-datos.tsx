// pages/mi-cuenta/mis-datos.tsx
"use client";

import { useState, useEffect } from "react";
import { useDocumentLookup } from "@/hooks/useDocumentLookup";
import logger from "@/lib/logger";
import Layout from "@/components/Layout";
import Link from "next/link";
import AccountSidebar from "@/components/AccountSidebar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  misDatosSchema,
  MisDatosSchemaType,
} from "@/lib/mi-cuenta/misDatosSchema";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiGet, apiPut, apiPost } from "@/lib/auth/apiClient";
import toast from "react-hot-toast";
import { showToast } from "@/lib/notifications";

export default function MisDatos() {
  const [formData, setFormData] = useState<MisDatosSchemaType>({
    nombre: "",
    apellido: "",
    tipoDocumento: "",
    numeroDocumento: "",
    celular: "",
    email: "",
    telefonoSecundario: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof MisDatosSchemaType, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalUser, setOriginalUser] = useState<any>(null);
  const [originalEmail, setOriginalEmail] = useState("");
  const [showEmailChangeDialog, setShowEmailChangeDialog] = useState(false);
  const [pendingEmailChange, setPendingEmailChange] = useState("");

  const { isLoading: isConsultingDoc, isConsulted: isConsultedDoc, resetConsulted } = useDocumentLookup({
    type: formData.tipoDocumento,
    number: formData.numeroDocumento,
    enabled: !isLoading, // Solo cuando ya cargó el usuario inicial
    onSuccess: (data) => {
      if (formData.tipoDocumento === "DNI") {
        setFormData((prev) => ({
          ...prev,
          nombre: data.nombres,
          apellido: `${data.apellido_paterno} ${data.apellido_materno}`,
        }));
      } else if (formData.tipoDocumento === "RUC") {
        setFormData((prev) => ({
          ...prev,
          nombre: data.nombre_o_razon_social,
          apellido: "No aplica",
        }));
      }
    },
  });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        const response = await apiGet("/users/profile");

        if (!response.ok) {
          throw new Error("Error al cargar los datos del usuario");
        }

        const result = await response.json();

        if (result.success && result.data) {
          const { mapApiUserToUser, updateUserSession } =
            await import("@/lib/auth/authUtils");
          const userData = mapApiUserToUser(result.data);

          if (userData) {
            setOriginalUser(userData);
            setOriginalEmail(userData.email || "");

            // Mapear los campos estandarizados al formulario
            setFormData({
              nombre: userData.firstName || "",
              apellido: userData.lastName || "",
              tipoDocumento: userData.documentType || "",
              numeroDocumento: userData.documentNumber || "",
              celular: userData.phone || "",
              email: userData.email || "",
              telefonoSecundario: userData.secondaryPhone || "",
            });

            // Actualizar localStorage con datos frescos usando la utilidad centralizada
            updateUserSession(userData);
          }
        }
      } catch (error) {
        logger.error("❌ Error al cargar datos del usuario:", error);
        showToast(
          "Error al cargar tus datos. Por favor, recarga la página.",
          "error",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Solo restringir a números si NO es pasaporte
    if (formData.tipoDocumento !== "PASAPORTE") {
      value = value.replace(/\D/g, "");
    } else {
      // Para pasaporte, permitir letras y números, restringir otros símbolos si se desea,
      // pero la validación estricta ya está en el schema.
      // Podríamos limpiar espacios por UX.
      value = value.replace(/[^a-zA-Z0-9]/g, "");
    }

    // Max length validation logic needs to be dynamic too
    const maxLength =
      formData.tipoDocumento === "RUC"
        ? 11
        : formData.tipoDocumento === "DNI"
          ? 8
          : formData.tipoDocumento === "PASAPORTE"
            ? 8
            : 12; // CE up to 12

    if (value.length <= maxLength) {
      setFormData((prev) => ({ ...prev, numeroDocumento: value }));
      setErrors((prev) => ({ ...prev, numeroDocumento: undefined }));
      resetConsulted();
    }
  };

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 9) {
      setFormData((prev) => ({ ...prev, celular: value }));
      setErrors((prev) => ({ ...prev, celular: undefined }));
    }
  };

  const handleTelefonoSecundarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 9) {
      setFormData((prev) => ({ ...prev, telefonoSecundario: value }));
      setErrors((prev) => ({ ...prev, telefonoSecundario: undefined }));
    }
  };

  const handleEmailChangeRequest = async () => {
    setShowEmailChangeDialog(false);
    setIsSubmitting(true);

    try {
      const response = await apiPost("/users/request-email-change", {
        newEmail: pendingEmailChange,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast(
          result.message ||
            "Se ha enviado un correo de verificación a tu nueva dirección. Por favor, revisa tu bandeja de entrada.",
          "success",
        );
        setPendingEmailChange("");
      } else {
        throw new Error(result.message || "Error al solicitar cambio de email");
      }
    } catch (error) {
      logger.error("❌ Error al solicitar cambio de email:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Error al solicitar el cambio de email. Intenta nuevamente.",
        "error",
      );
      // Revertir el email al original en caso de error
      setFormData((prev) => ({ ...prev, email: originalEmail }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar si el email cambió
    if (formData.email !== originalEmail) {
      setPendingEmailChange(formData.email);
      setShowEmailChangeDialog(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Validación con Zod
      const result = misDatosSchema.safeParse(formData);

      if (!result.success) {
        const formattedErrors = result.error.flatten().fieldErrors;
        const newErrors: Partial<Record<keyof MisDatosSchemaType, string>> = {};

        for (const key in formattedErrors) {
          const errorArray =
            formattedErrors[key as keyof typeof formattedErrors];
          if (errorArray && errorArray.length > 0) {
            newErrors[key as keyof MisDatosSchemaType] = errorArray[0];
          }
        }

        setErrors(newErrors);
        logger.log("Errores de validación:", newErrors);

        // Scroll al primer error
        const firstError = document.querySelector(".border-red-500");
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });

        showToast("Por favor, corrige los errores en el formulario", "error");

        return;
      }

      // Si es válido, limpiar errores
      setErrors({});

      // Mapear los campos del formulario a los campos de la API
      // Nota: El email NO se actualiza aquí, se maneja por separado con el flujo de verificación
      const updateData = {
        firstName: formData.nombre,
        lastName: formData.apellido,
        documentType: formData.tipoDocumento
          ? formData.tipoDocumento.toUpperCase()
          : "",
        documentNumber: formData.numeroDocumento,
        phone: formData.celular,
        secondaryPhone: formData.telefonoSecundario || "",
        // email: formData.email, // ❌ NO actualizar email aquí
        receiveOffers: originalUser?.receiveOffers || false, // ✅ Mantener preferencia actual
      };

      const accessToken = localStorage.getItem("accessToken");

      const response = await apiPut(
        "/users/profile",
        updateData,
        accessToken
          ? {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          : {},
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar los datos");
      }

      const updateResult = await response.json();

      if (updateResult.success) {
        // Actualizar el usuario en localStorage usando la utilidad centralizada
        const { updateUserSession } = await import("@/lib/auth/authUtils");
        updateUserSession(updateResult.data || updateData);

        // Actualizar el estado local con los datos frescos del servidor
        if (updateResult.data) {
          setOriginalUser(updateResult.data);
        }

        // ✅ Usar el mensaje del endpoint
        showToast(
          updateResult.message || "Datos actualizados correctamente",
          "success",
        );

        // ✅ NO recargar la página - dejar que el usuario continúe navegando
      }
    } catch (error) {
      logger.error("❌ Error al guardar:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "❌ Hubo un error al guardar. Intenta nuevamente.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout
        title="Mis datos - Liwilu"
        description="Edita tu información personal"
        background={true}
      >
        <div className="min-h-screen py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar */}
              <AccountSidebar activeSection="mis-datos" />

              {/* Main Content */}
              <main className="flex-1">
                <div className="md:px-8 z-10 relative">
                  <h1 className="text-xl md:text-4xl font-semibold mb-8 border-b pb-4">
                    Información de mi cuenta
                  </h1>

                  {/* Mis datos */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-dark rounded-full flex items-center justify-center">
                        <svg
                          className="h-5 w-5 md:w-6 md:h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl md:text-2xl font-semibold">
                        Mis datos
                      </h2>
                    </div>

                    {/* Diálogo de confirmación de cambio de email */}
                    {showEmailChangeDialog && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                          <h3 className="text-xl font-semibold mb-4">
                            Confirmar cambio de correo
                          </h3>
                          <p className="text-gray-600 mb-2">
                            Estás a punto de cambiar tu correo electrónico a:
                          </p>
                          <p className="font-semibold text-primary mb-4">
                            {pendingEmailChange}
                          </p>
                          <p className="text-sm text-gray-500 mb-6">
                            Se enviará un correo de verificación a esta
                            dirección. Deberás confirmar el cambio antes de que
                            sea efectivo.
                          </p>
                          <div className="flex gap-3 justify-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setShowEmailChangeDialog(false);
                                setPendingEmailChange("");
                                setFormData((prev) => ({
                                  ...prev,
                                  email: originalEmail,
                                }));
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleEmailChangeRequest}
                            >
                              Confirmar cambio
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="ml-4 text-gray-600">
                          Cargando tus datos...
                        </p>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        noValidate
                      >
                        {/* Nombre y Apellido */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Input
                              label="Nombre *"
                              type="text"
                              id="nombre"
                              name="nombre"
                              value={formData.nombre}
                              onChange={handleChange}
                              maxLength={50}
                              disabled={isSubmitting || (isConsultedDoc && formData.tipoDocumento === "DNI")}
                              error={errors.nombre}
                            />
                          </div>

                          <div>
                            <Input
                              label="Apellido"
                              type="text"
                              name="apellido"
                              value={formData.apellido}
                              onChange={handleChange}
                              placeholder={
                                formData.tipoDocumento === "RUC"
                                  ? "No requerido para RUC"
                                  : undefined
                              }
                              disabled={
                                isSubmitting || formData.tipoDocumento === "RUC" || (isConsultedDoc && formData.tipoDocumento === "DNI")
                              }
                              error={errors.apellido}
                            />
                          </div>
                        </div>

                        {/* Tipo de documento y Número */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Select
                              label="Tipo de documento *"
                              id="tipoDocumento"
                              name="tipoDocumento"
                              value={formData.tipoDocumento}
                              onChange={(e) => {
                                handleChange(e);
                                const newDocType = e.target.value;
                                // Clear document number and its errors when type changes
                                setFormData((prev) => ({
                                  ...prev,
                                  numeroDocumento: "",
                                  // Auto-fill apellido with "No aplica" for RUC to avoid empty submission
                                  apellido:
                                    newDocType === "RUC"
                                      ? "No aplica"
                                      : prev.apellido,
                                }));
                                setErrors((prev) => ({
                                  ...prev,
                                  numeroDocumento: undefined,
                                }));
                              }}
                              disabled={isSubmitting}
                              error={errors.tipoDocumento}
                            >
                              <option value="">Seleccionar tipo</option>
                              <option value="DNI">DNI</option>
                              {/* <option value="RUC">RUC</option> */}
                              <option value="CE">Carnet de Extranjería</option>
                              <option value="PASAPORTE">Pasaporte</option>
                            </Select>
                          </div>

                          <div className="relative">
                            <Input
                              label="Número de Documento *"
                              type="text"
                              id="numeroDocumento"
                              name="numeroDocumento"
                              value={formData.numeroDocumento}
                              onChange={handleDocumentoChange}
                              placeholder={
                                formData.tipoDocumento === "RUC"
                                  ? "20100000001"
                                  : formData.tipoDocumento === "PASAPORTE"
                                    ? "A1234567" // Example placeholder
                                    : "74218601"
                              }
                              maxLength={
                                formData.tipoDocumento === "RUC"
                                  ? 11
                                  : formData.tipoDocumento === "DNI" ||
                                      formData.tipoDocumento === "PASAPORTE"
                                    ? 8
                                    : 12
                              }
                              inputMode={
                                formData.tipoDocumento === "PASAPORTE"
                                  ? "text"
                                  : "numeric"
                              }
                              disabled={isSubmitting}
                              error={errors.numeroDocumento}
                              className="pr-12"
                            />
                            {(formData.tipoDocumento === "DNI" || formData.tipoDocumento === "RUC") && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!formData.numeroDocumento) {
                                    showToast("Ingresa un número de documento", "error");
                                  }
                                }}
                                disabled={isConsultingDoc || !formData.numeroDocumento}
                                className="absolute right-2 top-[35px] text-primary hover:text-primary-dark disabled:text-gray-300 p-1"
                                title="Consultar"
                              >
                                {isConsultingDoc ? (
                                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                ) : (
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
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Celular y Teléfono Secundario */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Input
                              label="Celular *"
                              type="tel"
                              id="celular"
                              name="celular"
                              value={formData.celular}
                              onChange={handleCelularChange}
                              placeholder="973820088"
                              maxLength={9}
                              disabled={isSubmitting}
                              error={errors.celular}
                            />
                          </div>
                          <div>
                            <Input
                              label="Teléfono (opcional)"
                              type="tel"
                              id="telefonoSecundario"
                              name="telefonoSecundario"
                              value={formData.telefonoSecundario || ""}
                              onChange={handleTelefonoSecundarioChange}
                              placeholder="973820088"
                              maxLength={9}
                              disabled={isSubmitting}
                              error={errors.telefonoSecundario}
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <Input
                            label="Correo electrónico *"
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="ejemplo@correo.com"
                            disabled={isSubmitting}
                            error={errors.email}
                          />
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col-reverse md:flex-row justify-between mt-8 pt-6 border-t gap-6 text-center items-center">
                          <Link
                            href="/mi-cuenta"
                            className="text-gray-500 hover:text-gray-700 font-medium transition"
                          >
                            Volver
                          </Link>
                          <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Guardando...
                              </span>
                            ) : (
                              "Guardar cambios"
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                  </section>
                </div>
              </main>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
