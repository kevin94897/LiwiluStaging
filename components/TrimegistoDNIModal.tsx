// components/TrimegistoDNIModal.tsx
'use client';

import { useEffect, useState } from 'react';
import Button from './ui/Button';
import { dniSchema } from '../lib/dniSchema';
import { z } from 'zod';
import { trimegistoRegisterSchema } from '@/lib/trimegistoRegisterSchema';
import { PiWarningCircleFill } from 'react-icons/pi';

// ============================================
// TrimegistoDNIModal
// ============================================

interface TrimegistoDNIModalProps {
    isOpen: boolean;
    onClose: () => void;
    onValidated: () => void;
    onNewUser: () => void;
}

type DniFormType = z.infer<typeof dniSchema>;

export function TrimegistoDNIModal({
    isOpen,
    onClose,
    onValidated,
    onNewUser,
}: TrimegistoDNIModalProps) {
    const [dni, setDni] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof DniFormType, string>>>({});

    // ✅ Resetear formulario cuando se cierra el modal
    useEffect(() => {
        if (!isOpen) {
            setDni('');
            setErrors({});
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const parsed = dniSchema.safeParse({ dni });

        if (!parsed.success) {
            setErrors({
                dni: parsed.error.flatten().fieldErrors.dni?.[0],
            });
            setIsLoading(false);
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const dniExists = dni === "12345678";

        if (dniExists) {
            onValidated();
        } else {
            onNewUser();
        }

        setDni("");
        setIsLoading(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-scale-in relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-8">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Ingresa tu DNI
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Valida tu documento para continuar con tu compra
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <input
                                    name="dni"
                                    value={dni}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    maxLength={8}
                                    onChange={(e) => {
                                        setDni(e.target.value.replace(/\D/g, ""));
                                        setErrors({});
                                    }}
                                />
                                {errors.dni && (
                                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                        <PiWarningCircleFill size={16} /> {errors.dni}
                                    </p>
                                )}
                            </div>

                            <Button
                                variant="primary"
                                size="md"
                                className="w-full"
                                onClick={handleSubmit}
                                disabled={dni.length !== 8 || isLoading}
                            >
                                {isLoading ? 'Validando...' : 'Continuar'}
                            </Button>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                    >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
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

// ============================================
// TrimegistoRegisterModal - CORREGIDO
// ============================================

interface TrimegistoRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FullRegisterValues = z.infer<typeof trimegistoRegisterSchema>;

export function TrimegistoRegisterModal({
    isOpen,
    onClose,
    onSuccess,
}: TrimegistoRegisterModalProps) {
    // ✅ Estado completo para todos los campos
    const [formData, setFormData] = useState<FullRegisterValues>({
        firstName: '',
        lastName: '',
        email: '',
        emailConfirm: '',
        password: '',
        passwordConfirm: '',
        contactNumber: '',
        signatureFile: null,
        acceptTerms: false,
        acceptDeclarations: false,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FullRegisterValues, string>>>({});

    // ✅ Manejador de cambios para inputs de texto
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    // ✅ Manejador de checkboxes
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
        // Limpiar error del campo
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    // ✅ Manejador de archivo
    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({ ...prev, signatureFile: file }));
        if (file) {
            setErrors(prev => ({ ...prev, signatureFile: undefined }));
        }
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();

        // ✅ Validación con Zod
        const result = trimegistoRegisterSchema.safeParse(formData);

        if (!result.success) {
            const formattedErrors = result.error.flatten().fieldErrors;
            const newErrors: Partial<Record<keyof FullRegisterValues, string>> = {};

            for (const key in formattedErrors) {
                const errorArray = formattedErrors[key as keyof typeof formattedErrors];
                if (errorArray && errorArray.length > 0) {
                    newErrors[key as keyof FullRegisterValues] = errorArray[0];
                }
            }

            setErrors(newErrors);
            console.log("Errores de validación:", newErrors);
            return;
        }

        // Si es válido
        setErrors({});
        console.log("Registro exitoso:", formData);
        onSuccess();
        onClose();
    };

    const inputClasses = (fieldName: keyof FullRegisterValues) =>
        `w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'
        }`;

    const fileName = formData.signatureFile ? formData.signatureFile.name : null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-scale-in overflow-y-auto max-h-[90vh] relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-8">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Crea tu cuenta
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Regístrate para comprar más rápido, hacer seguimiento a tus pedidos y recibir promociones exclusivas.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Nombre y Apellido */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Nombre
                                    </label>
                                    <input
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Gonzalo"
                                        className={inputClasses('firstName')}
                                    />
                                    {errors.firstName && (
                                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                            <PiWarningCircleFill size={16} /> {errors.firstName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Apellido
                                    </label>
                                    <input
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="García"
                                        className={inputClasses('lastName')}
                                    />
                                    {errors.lastName && (
                                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                            <PiWarningCircleFill size={16} /> {errors.lastName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Correo electrónico
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="correo@ejemplo.com"
                                    className={inputClasses('email')}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                        <PiWarningCircleFill size={16} /> {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Confirmar Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Confirmar correo electrónico
                                </label>
                                <input
                                    name="emailConfirm"
                                    type="email"
                                    value={formData.emailConfirm}
                                    onChange={handleChange}
                                    placeholder="correo@ejemplo.com"
                                    className={inputClasses('emailConfirm')}
                                />
                                {errors.emailConfirm && (
                                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                        <PiWarningCircleFill size={16} /> {errors.emailConfirm}
                                    </p>
                                )}
                            </div>

                            {/* Contraseña */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Contraseña
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mínimo 6 caracteres"
                                    className={inputClasses('password')}
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                        <PiWarningCircleFill size={16} /> {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirmar Contraseña */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Confirmar contraseña
                                </label>
                                <input
                                    name="passwordConfirm"
                                    type="password"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    placeholder="Repite tu contraseña"
                                    className={inputClasses('passwordConfirm')}
                                />
                                {errors.passwordConfirm && (
                                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                        <PiWarningCircleFill size={16} /> {errors.passwordConfirm}
                                    </p>
                                )}
                            </div>

                            {/* Número de contacto */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Número de contacto
                                </label>
                                <input
                                    name="contactNumber"
                                    type="tel"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    placeholder="999 999 999"
                                    className={inputClasses('contactNumber')}
                                />
                                {errors.contactNumber && (
                                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                        <PiWarningCircleFill size={16} /> {errors.contactNumber}
                                    </p>
                                )}
                            </div>

                            {/* Subida de Firma */}
                            <div className={`border-2 border-dashed rounded-sm p-4 ${errors.signatureFile ? 'border-red-500 bg-red-50' : 'border-green-300 bg-green-50'
                                }`}>
                                <label htmlFor="signature-upload" className="flex flex-col items-center justify-center gap-3 cursor-pointer">
                                    <input
                                        type="file"
                                        id="signature-upload"
                                        name="signatureFile"
                                        accept=".png,.jpg,.jpeg,.pdf"
                                        onChange={handleSignatureUpload}
                                        className="sr-only"
                                    />

                                    <div className="flex items-center gap-2 text-green-700">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-sm font-medium">
                                            {fileName
                                                ? `Archivo: ${fileName}`
                                                : 'Subir Firma Electrónica (PNG, JPG o PDF)'}
                                        </span>
                                    </div>

                                    {fileName && (
                                        <span className="text-xs text-green-600 border border-green-600 px-2 py-0.5 rounded-full mt-1 hover:bg-green-100 transition">
                                            Cambiar archivo
                                        </span>
                                    )}
                                </label>
                            </div>
                            {errors.signatureFile && (
                                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                    <PiWarningCircleFill size={16} /> {errors.signatureFile}
                                </p>
                            )}

                            {/* Checkboxes */}
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={handleCheckboxChange}
                                        className="mt-1 w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Acepto los Términos y Condiciones y la política de Privacidad
                                    </span>
                                </label>
                                {errors.acceptTerms && (
                                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                        <PiWarningCircleFill size={16} /> {errors.acceptTerms}
                                    </p>
                                )}

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="acceptDeclarations"
                                        checked={formData.acceptDeclarations}
                                        onChange={handleCheckboxChange}
                                        className="mt-1 w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Acepto declaración jurada de datos personales
                                    </span>
                                </label>
                                {errors.acceptDeclarations && (
                                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                        <PiWarningCircleFill size={16} /> {errors.acceptDeclarations}
                                    </p>
                                )}
                            </div>

                            {/* Botón Submit */}
                            <Button variant="primary" size="md" className="w-full" onClick={handleSubmit}>
                                Registrarse
                            </Button>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                    >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
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