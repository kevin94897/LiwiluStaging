// pages/verificar-email.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import { showToast } from "@/lib/notifications";

export default function VerificarEmail() {
    const router = useRouter();
    const { token } = router.query;

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const confirmEmailChange = async () => {
            // Esperar a que el router esté listo
            if (!router.isReady) return;

            // Validar que exista el token
            if (!token || typeof token !== "string") {
                setStatus("error");
                setMessage("Token de verificación no válido o faltante.");
                return;
            }

            try {
                console.log("🔄 Confirmando cambio de email con token:", token);

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/confirm-email-change?token=${token}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                const result = await response.json();

                if (response.ok && result.success) {
                    setStatus("success");
                    setMessage(
                        result.message || "Tu correo electrónico ha sido actualizado exitosamente."
                    );

                    showToast("Email actualizado correctamente. Por favor, inicia sesión nuevamente.", "success");

                    // Limpiar la sesión actual
                    if (typeof window !== "undefined") {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        localStorage.removeItem("user");
                    }

                    // Redirigir al home con modal de login después de 3 segundos
                    setTimeout(() => {
                        router.push("/?login=true");
                    }, 3000);
                } else {
                    setStatus("error");
                    setMessage(
                        result.message || "No se pudo verificar el cambio de correo. El token puede ser inválido o haber expirado."
                    );
                }
            } catch (error) {
                console.error("❌ Error al confirmar cambio de email:", error);
                setStatus("error");
                setMessage("Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.");
            }
        };

        confirmEmailChange();
    }, [router.isReady, token, router]);

    return (
        <Layout
            title="Verificar Email - Liwilu"
            description="Verificación de cambio de correo electrónico"
            background={true}
        >
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        {status === "loading" && (
                            <>
                                <div className="mx-auto h-16 w-16 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
                                </div>
                                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                                    Verificando tu correo...
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Por favor espera mientras confirmamos tu cambio de email.
                                </p>
                            </>
                        )}

                        {status === "success" && (
                            <>
                                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
                                    <svg
                                        className="h-10 w-10 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                                    ¡Email Verificado!
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">{message}</p>
                                <p className="mt-4 text-sm text-gray-500">
                                    Serás redirigido al inicio de sesión en unos segundos...
                                </p>
                            </>
                        )}

                        {status === "error" && (
                            <>
                                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
                                    <svg
                                        className="h-10 w-10 text-red-600"
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
                                </div>
                                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                                    Error de Verificación
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">{message}</p>
                                <div className="mt-6">
                                    <Button
                                        variant="primary"
                                        size="md"
                                        onClick={() => router.push("/")}
                                    >
                                        Volver al inicio
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
