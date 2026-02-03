"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { PiWarningCircleFill } from "react-icons/pi";
import { registerSchema } from "../lib/registerSchema";
import { z } from "zod";
import { registerUser } from "../pages/api/auth/register";
import { showToast } from "@/lib/notifications";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const [formData, setFormData] = useState<RegisterFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    emailConfirm: "",
    password: "",
    passwordConfirm: "",
    acceptTerms: false,
    receiveOffers: false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({});

  // 🆕 Estados adicionales
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string>("");

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        emailConfirm: "",
        password: "",
        passwordConfirm: "",
        acceptTerms: false,
        receiveOffers: false,
      });
      setErrors({});
      setGeneralError("");
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setGeneralError(""); // Limpiar error general
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    // 1️⃣ Validación con Zod
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      const newErrors: Partial<Record<keyof RegisterFormValues, string>> = {};

      for (const key in formattedErrors) {
        const errorArray = formattedErrors[key as keyof typeof formattedErrors];
        if (errorArray?.length) {
          newErrors[key as keyof RegisterFormValues] = errorArray[0];
        }
      }
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // 2️⃣ Enviar a la API
      const response = await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        confirmEmail: formData.emailConfirm,
        password: formData.password,
        confirmPassword: formData.passwordConfirm,
        acceptTerms: formData.acceptTerms,
        receiveOffers: formData.receiveOffers,
      });

      console.log("Registro exitoso", response);
      showToast("Cuenta creada con éxito. ¡Bienvenido!");
      onClose();
    } catch (error: unknown) {
      console.log("Error en registro", error);

      if (error instanceof Error) {
        console.error("Error en registro:", error.message);

        if (error.message.includes("correo ya está registrado")) {
          setErrors({ email: "Este correo ya está registrado" });
        } else if (error.message.includes("validación")) {
          setGeneralError("Por favor verifica los datos ingresados");
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError("Error desconocido en el servidor");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log("Signup with Google");
    // TODO: Implementar OAuth con Google
  };

  const handleFacebookSignup = () => {
    console.log("Signup with Facebook");
    // TODO: Implementar OAuth con Facebook
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-scale-in overflow-y-auto max-h-[90vh] relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-semibold text-primary-dark mb-2">
                Crea tu cuenta
              </h2>
              <p className="text-gray-600 text-sm">
                Regístrate para comprar más rápido, hacer seguimiento a tus
                pedidos y recibir promociones exclusivas.
              </p>
            </div>

            {/* 🆕 Error General */}
            {generalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <PiWarningCircleFill
                  className="text-error flex-shrink-0 mt-0.5"
                  size={18}
                />
                <p className="text-sm text-error">{generalError}</p>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Nombre"
                    name="firstName"
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Nombres"
                    error={errors.firstName}
                  />
                </div>

                <div>
                  <Input
                    label="Apellido"
                    name="lastName"
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="García"
                    error={errors.lastName}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Input
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="correo@ejemplo.com"
                  error={errors.email}
                />
              </div>

              {/* Confirmar Email */}
              <div>
                <Input
                  label="Confirmar correo electrónico"
                  name="emailConfirm"
                  type="email"
                  id="emailConfirm"
                  value={formData.emailConfirm}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="correo@ejemplo.com"
                  error={errors.emailConfirm}
                />
              </div>

              {/* Contraseña */}
              <div>
                <Input
                  label="Contraseña"
                  name="password"
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Mínimo 6 caracteres"
                  error={errors.password}
                />
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <Input
                  label="Confirmar contraseña"
                  name="passwordConfirm"
                  type="password"
                  id="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Repite tu contraseña"
                  error={errors.passwordConfirm}
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleCheckboxChange}
                    disabled={isLoading}
                    className={`mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary disabled:cursor-not-allowed ${errors.acceptTerms ? "border-error" : ""
                      }`}
                  />
                  <span className="text-sm text-gray-700">
                    Acepto los{" "}
                    <Link
                      href="/terminos-y-condiciones"
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      Términos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link
                      href="/politicas/politica-de-privacidad"
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      Política de Privacidad
                    </Link>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-error text-xs mt-1 flex items-start gap-1">
                    <PiWarningCircleFill size={16} /> {errors.acceptTerms}
                  </p>
                )}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="receiveOffers"
                    checked={formData.receiveOffers}
                    onChange={handleCheckboxChange}
                    disabled={isLoading}
                    className={`mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary disabled:cursor-not-allowed ${errors.receiveOffers ? "border-error" : ""
                      }`}
                  />
                  <span className="text-sm text-gray-700">
                    Quiero recibir ofertas y beneficios exclusivos
                  </span>
                </label>
              </div>

              {/* Botón Submit */}
              <Button
                variant="primary"
                size="md"
                className="w-full"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Registrando...
                  </span>
                ) : (
                  "Registrarse"
                )}
              </Button>
            </form>

            {/* Divider */}
            {/* <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">O</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div> */}

            {/* Social Login */}
            {/* <div className="space-y-3">
              <button
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FcGoogle size={20} />
                <span className="text-gray-700 font-medium">
                  Registrarse con Google
                </span>
              </button>

              <button
                onClick={handleFacebookSignup}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaFacebook size={20} className="text-blue-600" />
                <span className="text-gray-700 font-medium">
                  Registrarse con Facebook
                </span>
              </button>
            </div> */}

            {/* Link a Login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <button
                  onClick={() => {
                    onClose();
                    onSwitchToLogin();
                  }}
                  disabled={isLoading}
                  className="text-primary hover:text-primary-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </div>

          {/* Botón cerrar (X) */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cerrar"
          >
            <svg
              className="w-5 h-5 text-gray-400"
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
