// pages/mi-cuenta/cambiar-password/index.tsx
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import AccountSidebar from '@/components/AccountSidebar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiPut } from '@/lib/auth/apiClient';
import { PiWarningCircleFill } from 'react-icons/pi';
import Input from '@/components/ui/Input';
import { z } from 'zod';

// Schema de validación
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[a-z]/, 'Debe contener al menos una minúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmNewPassword: z.string().min(1, 'Debes confirmar la contraseña'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmNewPassword'],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function CambiarPassword() {
    const router = useRouter();
    const [formData, setFormData] = useState<ChangePasswordFormValues>({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordFormValues, string>>>({});
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
        const result = changePasswordSchema.safeParse(formData);
        if (!result.success) {
            const formattedErrors = result.error.flatten().fieldErrors;
            const newErrors: Partial<Record<keyof ChangePasswordFormValues, string>> = {};

            for (const key in formattedErrors) {
                const errorArray = formattedErrors[key as keyof typeof formattedErrors];
                if (errorArray?.length) {
                    newErrors[key as keyof ChangePasswordFormValues] = errorArray[0];
                }
            }
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiPut('/users/reset-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmNewPassword,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cambiar la contraseña');
            }

            const data = await response.json();

            setSuccessMessage('✅ Contraseña actualizada correctamente');

            // Limpiar formulario
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });

            // Redirigir después de 2 segundos
            setTimeout(() => {
                router.push('/mi-cuenta');
            }, 2000);

        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('❌ Error al cambiar contraseña:', error.message);

                if (error.message.includes('incorrecta') || error.message.includes('invalid')) {
                    setErrors({ currentPassword: 'La contraseña actual es incorrecta' });
                } else {
                    setGeneralError(error.message || 'Error al cambiar la contraseña');
                }
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

                                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                            {/* Contraseña actual */}
                                            <div>
                                                <Input
                                                    label="Contraseña actual"
                                                    name="currentPassword"
                                                    type="password"
                                                    id="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                    placeholder="Ingresa tu contraseña actual"
                                                    error={errors.currentPassword}
                                                />
                                            </div>

                                            {/* Nueva contraseña */}
                                            <div>
                                                <Input
                                                    label="Nueva contraseña"
                                                    name="newPassword"
                                                    type="password"
                                                    id="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                    placeholder="Mínimo 6 caracteres con mayúsculas, minúsculas y números"
                                                    error={errors.newPassword}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    La contraseña debe contener al menos una mayúscula, una minúscula y un número
                                                </p>
                                            </div>

                                            {/* Confirmar nueva contraseña */}
                                            <div>
                                                <Input
                                                    label="Confirmar nueva contraseña"
                                                    name="confirmNewPassword"
                                                    type="password"
                                                    id="confirmNewPassword"
                                                    value={formData.confirmNewPassword}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                    placeholder="Repite tu nueva contraseña"
                                                    error={errors.confirmNewPassword}
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
                                                            Actualizando...
                                                        </span>
                                                    ) : (
                                                        'Cambiar contraseña'
                                                    )}
                                                </button>
                                            </div>
                                        </form>

                                        {/* Consejos de seguridad */}
                                        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h3 className="font-semibold text-primary-dark mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                Consejos de seguridad
                                            </h3>
                                            <ul className="text-sm text-gray-700 space-y-1 ml-7">
                                                <li>• Usa una contraseña única que no uses en otros sitios</li>
                                                <li>• Combina letras mayúsculas, minúsculas, números y símbolos</li>
                                                <li>• Evita información personal fácil de adivinar</li>
                                                <li>• Cambia tu contraseña regularmente</li>
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