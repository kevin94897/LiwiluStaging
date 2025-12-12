// pages/mi-cuenta/cambiar-password/index.tsx
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import AccountSidebar from '@/components/AccountSidebar';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiPost } from '@/lib/auth/apiClient';
import { PiWarningCircleFill } from 'react-icons/pi';
import Input from '@/components/ui/Input';
import { z } from 'zod';

// Schema de validación
const forgotPasswordSchema = z.object({
    email: z.string().email('Ingresa un correo electrónico válido'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function CambiarPassword() {
    const [formData, setFormData] = useState<ForgotPasswordFormValues>({
        email: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordFormValues, string>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        setGeneralError('');
        setSuccessMessage('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError('');
        setSuccessMessage('');

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
            const response = await apiPost('/auth/forgot-password', {
                email: formData.email,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar el correo de recuperación');
            }

            setSuccessMessage('✅ Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.');

            // Limpiar formulario
            setFormData({
                email: '',
            });

        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('❌ Error al enviar correo:', error.message);
                setGeneralError(error.message || 'Error al enviar el correo de recuperación');
            } else {
                setGeneralError('Error desconocido en el servidor');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <Layout title="Cambiar contraseña - Liwilu" description="Actualiza tu contraseña" background={true}>
                <div className="min-h-screen py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Sidebar */}
                            <AccountSidebar activeSection="mi-cuenta" />

                            {/* Main Content */}
                            <main className="flex-1">
                                <div className="md:px-8 z-10 relative">
                                    <h1 className="text-xl md:text-4xl font-semibold mb-8 border-b pb-4">
                                        Cambiar contraseña
                                    </h1>

                                    <div className="bg-white rounded-lg p-6 max-w-2xl">
                                        {/* Mensaje de éxito */}
                                        {successMessage && (
                                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                                                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-sm text-green-700">{successMessage}</p>
                                            </div>
                                        )}

                                        {/* Error general */}
                                        {generalError && (
                                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                                <PiWarningCircleFill className="text-error flex-shrink-0 mt-0.5" size={18} />
                                                <p className="text-sm text-error">{generalError}</p>
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <p className="text-gray-700">
                                                Para cambiar tu contraseña, ingresa tu correo electrónico. Te enviaremos un enlace seguro para que puedas establecer una nueva contraseña.
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                            {/* Correo electrónico */}
                                            <div>
                                                <Input
                                                    label="Correo electrónico"
                                                    name="email"
                                                    type="email"
                                                    id="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                    placeholder="tu@email.com"
                                                    error={errors.email}
                                                />
                                            </div>

                                            {/* Botones de acción */}
                                            <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-6 border-t">
                                                <Link
                                                    href="/mi-cuenta"
                                                    className="px-6 py-3 text-center border border-gray-300 rounded-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Cancelar
                                                </Link>
                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="px-6 py-3 bg-primary text-white rounded-sm hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                        'Enviar enlace de recuperación'
                                                    )}
                                                </button>
                                            </div>
                                        </form>

                                        {/* Información adicional */}
                                        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                            <h3 className="font-semibold text-primary-dark mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                ¿Qué sucede después?
                                            </h3>
                                            <ul className="text-sm text-gray-700 space-y-1 ml-7">
                                                <li>• Recibirás un correo con un enlace seguro</li>
                                                <li>• El enlace expirará después de un tiempo por seguridad</li>
                                                <li>• Haz clic en el enlace para establecer tu nueva contraseña</li>
                                                <li>• Si no recibes el correo, revisa tu carpeta de spam</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}