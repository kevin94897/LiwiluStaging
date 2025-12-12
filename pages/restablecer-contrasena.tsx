// pages/reestablecer-contraseña.tsx
'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiPost } from '@/lib/auth/apiClient';
import { PiWarningCircleFill } from 'react-icons/pi';
import Input from '@/components/ui/Input';
import { z } from 'zod';
import Button from '@/components/ui/Button';

// Schema de validación
const resetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[a-z]/, 'Debe contener al menos una minúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string().min(1, 'Debes confirmar la contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
    const router = useRouter();
    const { token } = router.query;

    const [formData, setFormData] = useState<ResetPasswordFormValues>({
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordFormValues, string>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isValidatingToken, setIsValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [generalError, setGeneralError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    // Validar el token cuando se carga la página
    useEffect(() => {
        const validateToken = async () => {
            if (!token || typeof token !== 'string') {
                setIsValidatingToken(false);
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-reset-token/${token}`);

                if (response.ok) {
                    setTokenValid(true);
                } else {
                    const errorData = await response.json();
                    setGeneralError(errorData.message || 'El enlace de recuperación es inválido o ha expirado');
                }
            } catch (error) {
                console.error('Error validating token:', error);
                setGeneralError('Error al validar el enlace de recuperación');
            } finally {
                setIsValidatingToken(false);
            }
        };

        validateToken();
    }, [token]);

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

        if (!token || typeof token !== 'string') {
            setGeneralError('Token inválido');
            return;
        }

        // Validación con Zod
        const result = resetPasswordSchema.safeParse(formData);
        if (!result.success) {
            const formattedErrors = result.error.flatten().fieldErrors;
            const newErrors: Partial<Record<keyof ResetPasswordFormValues, string>> = {};

            for (const key in formattedErrors) {
                const errorArray = formattedErrors[key as keyof typeof formattedErrors];
                if (errorArray?.length) {
                    newErrors[key as keyof ResetPasswordFormValues] = errorArray[0];
                }
            }
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiPost('/auth/reset-password', {
                token: token,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
            }, {
                skipAuth: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al restablecer la contraseña');
            }

            setSuccessMessage('✅ Contraseña restablecida correctamente. Redirigiendo al inicio de sesión...');

            // Limpiar formulario
            setFormData({
                newPassword: '',
                confirmPassword: '',
            });

            // Redirigir después de 3 segundos
            setTimeout(() => {
                router.push('/');
            }, 3000);

        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('❌ Error al restablecer contraseña:', error.message);
                setGeneralError(error.message || 'Error al restablecer la contraseña');
            } else {
                setGeneralError('Error desconocido en el servidor');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidatingToken) {
        return (
            <Layout title="Validando enlace - Liwilu" description="Validando enlace de recuperación" background={true}>
                <div className="min-h-screen flex items-center justify-center py-8">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <div className="flex flex-col items-center gap-4">
                            <svg className="animate-spin h-12 w-12 text-primary" viewBox="0 0 24 24">
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
                            <p className="text-gray-600">Validando enlace de recuperación...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!tokenValid) {
        return (
            <Layout title="Enlace inválido - Liwilu" description="Enlace de recuperación inválido" background={true}>
                <div className="min-h-screen flex items-center justify-center py-8">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="mb-4 flex justify-center">
                                <PiWarningCircleFill className="text-error" size={64} />
                            </div>
                            <h1 className="text-2xl font-semibold mb-4">Enlace inválido o expirado</h1>
                            <p className="text-gray-600 mb-6">
                                {generalError || 'El enlace de recuperación que intentas usar es inválido o ha expirado.'}
                            </p>
                            <Button
                                variant="primary"
                                size="md"
                                className="mt-4"
                                onClick={() => router.push('/mi-cuenta/cambiar-password')}
                            >
                                Solicitar nuevo enlace
                            </Button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Restablecer contraseña - Liwilu" description="Establece tu nueva contraseña" background={true}>
            <div className="min-h-screen flex items-center justify-center py-8">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-lg p-8">
                        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center">
                            Restablecer contraseña
                        </h1>

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

                        <p className="text-gray-600 mb-6 text-center">
                            Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                                    placeholder="Mínimo 6 caracteres"
                                    error={errors.newPassword}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Debe contener al menos una mayúscula, una minúscula y un número
                                </p>
                            </div>

                            {/* Confirmar contraseña */}
                            <div>
                                <Input
                                    label="Confirmar contraseña"
                                    name="confirmPassword"
                                    type="password"
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    placeholder="Repite tu contraseña"
                                    error={errors.confirmPassword}
                                />
                            </div>

                            {/* Botón de envío */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                variant="primary"
                                size="md"
                                className="mt-4 w-full !rounded-md"
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
                                        Restableciendo...
                                    </span>
                                ) : (
                                    'Restablecer contraseña'
                                )}
                            </Button>
                        </form>

                        {/* Consejos de seguridad */}
                        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-primary-dark mb-2 text-sm">
                                Consejos de seguridad
                            </h3>
                            <ul className="text-xs text-gray-700 space-y-1">
                                <li>• Usa una contraseña única</li>
                                <li>• Combina letras, números y símbolos</li>
                                <li>• Evita información personal</li>
                                <li>• No compartas tu contraseña</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}