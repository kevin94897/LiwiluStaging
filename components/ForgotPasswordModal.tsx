// components/ForgotPasswordModal.tsx
"use client";

import { useEffect, useState } from "react";
import { PiWarningCircleFill } from "react-icons/pi";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { z } from "zod";

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBackToLogin: () => void;
}

// Schema de validación
const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "El correo electrónico es requerido")
        .email("Ingresa un correo electrónico válido"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordModal({
    isOpen,
    onClose,
    onBackToLogin,
}: ForgotPasswordModalProps) {
    const [formData, setFormData] = useState<ForgotPasswordFormValues>({
        email: "",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordFormValues, string>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [emailSent, setEmailSent] = useState(false);

    // Resetear formulario cuando se cierra el modal
    useEffect(() => {
        if (!isOpen) {
            setFormData({ email: "" });
            setErrors({});
            setGeneralError("");
            setSuccessMessage("");
            setEmailSent(false);
            setIsLoading(false);
        }
    }, [isOpen]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        setGeneralError("");
        setSuccessMessage("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError("");
        setSuccessMessage("");

        // Validación con Zod
        const result = forgotPasswordSchema.safeParse(formData);
        if (!result.success) {
            const formattedErrors = result.error.flatten().fieldErrors;
            const newErrors: Partial<Record<keyof ForgotPasswordFormValues, string>> = {};

            for (const key in formattedErrors) {
                const errorArray = formattedErrors[key as keyof typeof formattedErrors];
                if (errorArray?.length) {
                    newErrors[key as keyof ForgotPasswordFormValues] = errorArray[0];
                }
            }
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Llamada al endpoint de recuperación de contraseña
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al enviar el correo de recuperación");
            }

            // Mostrar mensaje de éxito
            setSuccessMessage("✅ Se ha enviado un correo con las instrucciones para recuperar tu contraseña");
            setEmailSent(true);

            // Limpiar formulario
            setFormData({ email: "" });

        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("❌ Error al enviar recuperación:", error.message);

                if (error.message.includes("no encontrado") || error.message.includes("not found")) {
                    setErrors({ email: "No existe una cuenta con este correo electrónico" });
                } else {
                    setGeneralError(error.message || "Error al enviar el correo de recuperación");
                }
            } else {
                setGeneralError("Error desconocido en el servidor");
            }
        } finally {
            setIsLoading(false);
        }
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
                            {!emailSent ? (
                                <>
                                    <h2 className="text-3xl font-bold text-primary-dark mb-2">
                                        ¿Olvidaste tu contraseña?
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        No te preocupes, ingresa tu correo electrónico y te enviaremos
                                        las instrucciones para recuperar tu contraseña.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-center mb-4">
                                        <svg
                                            className="w-16 h-16 text-green-500"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-primary-dark mb-2 text-center">
                                        ¡Correo enviado!
                                    </h2>
                                </>
                            )}
                        </div>

                        {/* Mensaje de éxito */}
                        {successMessage && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                                <svg
                                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p className="text-sm text-green-700">{successMessage}</p>
                            </div>
                        )}

                        {/* Error general */}
                        {generalError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <PiWarningCircleFill
                                    className="text-error flex-shrink-0 mt-0.5"
                                    size={18}
                                />
                                <p className="text-sm text-error">{generalError}</p>
                            </div>
                        )}

                        {!emailSent ? (
                            <>
                                {/* Formulario */}
                                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                                            autoFocus
                                        />
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
                                                Enviando...
                                            </span>
                                        ) : (
                                            "Enviar instrucciones"
                                        )}
                                    </Button>
                                </form>

                                {/* Link de regreso */}
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onBackToLogin();
                                        }}
                                        disabled={isLoading}
                                        className="text-sm text-primary hover:text-primary-dark font-medium flex items-center justify-center gap-1 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                            />
                                        </svg>
                                        Volver al inicio de sesión
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Vista de éxito */}
                                <div className="space-y-4">
                                    <p className="text-gray-700 text-center">
                                        Revisa tu bandeja de entrada y sigue las instrucciones para
                                        restablecer tu contraseña.
                                    </p>
                                    <p className="text-sm text-gray-500 text-center">
                                        Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
                                    </p>

                                    <div className="flex flex-col gap-3 mt-6">
                                        <Button
                                            variant="primary"
                                            size="md"
                                            className="w-full"
                                            onClick={() => {
                                                onClose();
                                                onBackToLogin();
                                            }}
                                        >
                                            Volver al inicio de sesión
                                        </Button>

                                        <button
                                            onClick={() => {
                                                setEmailSent(false);
                                                setSuccessMessage("");
                                            }}
                                            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                                        >
                                            ¿No recibiste el correo? Intentar de nuevo
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Información adicional */}
                        {!emailSent && (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <svg
                                        className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <p className="text-xs text-gray-700">
                                        El enlace de recuperación expirará en 1 hora por motivos de seguridad.
                                    </p>
                                </div>
                            </div>
                        )}
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