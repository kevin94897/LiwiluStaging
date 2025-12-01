// components/TrimegistoDNIModal.tsx
'use client';

import { useEffect, useState } from 'react';

// ============================================
// TrimegistoDNIModal (No modificado, solo incluido)
// ============================================

interface TrimegistoDNIModalProps {
    isOpen: boolean;
    onClose: () => void;
    onValidated: () => void; // Abre LoginModal si DNI ya existe
    onNewUser: () => void;   // Abre TrimegistoRegisterModal si es nuevo
}

export function TrimegistoDNIModal({
    isOpen,
    onClose,
    onValidated,
    onNewUser,
}: TrimegistoDNIModalProps) {
    const [dni, setDni] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

        // Simular validación de DNI
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Aquí iría tu lógica de validación con el backend
        // Si el DNI existe -> onValidated() para abrir LoginModal
        // Si el DNI no existe -> onNewUser() para abrir TrimegistoRegisterModal

        const dniExists = dni === '12345678'; // Ejemplo de validación

        if (dniExists) {
            onValidated(); // Usuario registrado -> Login
        } else {
            onNewUser(); // Usuario nuevo -> Registro Trimegisto
        }

        setIsLoading(false);
        setDni('');
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
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-scale-in relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-8">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Ingresa tu DNI
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Valida tu documento para continuar con tu compra
                            </p>
                        </div>

                        {/* Formulario */}
                        <div className="space-y-6">
                            <div>
                                <input
                                    type="text"
                                    value={dni}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 8) setDni(value);
                                    }}
                                    placeholder="Ingresa su DNI"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-center text-lg"
                                    maxLength={8}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={dni.length !== 8 || isLoading}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Validando...' : 'Continuar'}
                            </button>
                        </div>
                    </div>

                    {/* Botón cerrar */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                    >
                        {/* Icono X (no incluido en el código original, pero es buena práctica) */}
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
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
// TrimegistoRegisterModal (ACTUALIZADO)
// ============================================

interface TrimegistoRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Después del registro exitoso
}

export function TrimegistoRegisterModal({
    isOpen,
    onClose,
    onSuccess,
}: TrimegistoRegisterModalProps) {
    const [formData, setFormData] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        emailConfirm: string;
        password: string;
        passwordConfirm: string;
        contactNumber: string;
        acceptTerms: boolean;
        receiveOffers: boolean;
        acceptDataDeclaration: boolean;
        signatureFile: File | null; // ✅ CAMBIO 1: Reemplazado uploadSignature por signatureFile
    }>({
        firstName: '',
        lastName: '',
        email: '',
        emailConfirm: '',
        password: '',
        passwordConfirm: '',
        contactNumber: '',
        acceptTerms: false,
        receiveOffers: false,
        acceptDataDeclaration: false,
        signatureFile: null, // ✅ CAMBIO 1: Inicializado como null
    });

    // ✅ CAMBIO 2: Nueva función para manejar la subida de archivos
    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData({ ...formData, signatureFile: file });
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

        // Validaciones (manteniendo las existentes)
        if (formData.email !== formData.emailConfirm) {
            alert('Los correos electrónicos no coinciden');
            return;
        }

        if (formData.password !== formData.passwordConfirm) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (!formData.acceptTerms) {
            alert('Debes aceptar los términos y condiciones');
            return;
        }

        console.log('Trimegisto Register:', formData);
        onSuccess();
        onClose();
    };

    // Variable de ayuda para la visualización del nombre del archivo
    const fileName = formData.signatureFile ? formData.signatureFile.name : null;

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
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Crea tu cuenta
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Regístrate para comprar más rápido, hacer seguimiento a tus pedidos y recibir promociones exclusivas.
                            </p>
                        </div>

                        {/* Formulario */}
                        <div className="space-y-4">
                            {/* Nombre y Apellido */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, firstName: e.target.value })
                                        }
                                        placeholder="Gonzalo"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Apellido
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, lastName: e.target.value })
                                        }
                                        placeholder="Gonzalo"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    placeholder="Ingrese tu correo electrónico"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                />
                            </div>

                            {/* Confirmar Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Confirmar correo electrónico
                                </label>
                                <input
                                    type="email"
                                    value={formData.emailConfirm}
                                    onChange={(e) =>
                                        setFormData({ ...formData, emailConfirm: e.target.value })
                                    }
                                    placeholder="Ingrese tu correo electrónico"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                />
                            </div>

                            {/* Contraseña */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    placeholder="Crea una contraseña segura"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                />
                            </div>

                            {/* Confirmar Contraseña */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Confirmar contraseña
                                </label>
                                <input
                                    type="password"
                                    value={formData.passwordConfirm}
                                    onChange={(e) =>
                                        setFormData({ ...formData, passwordConfirm: e.target.value })
                                    }
                                    placeholder="Repite tu contraseña"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                />
                            </div>

                            {/* ✅ CAMBIO 3: Subida de Archivos */}
                            <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
                                <label htmlFor="signature-upload" className="flex flex-col items-center justify-center gap-3 cursor-pointer">

                                    {/* Input de archivo oculto */}
                                    <input
                                        type="file"
                                        id="signature-upload"
                                        accept=".png,.jpg,.jpeg,.pdf"
                                        onChange={handleSignatureUpload} // ✅ Usando el nuevo manejador
                                        className="sr-only"
                                    />

                                    <div className="flex items-center gap-2 text-green-700">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {/* SVG de Carga/Nube */}
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        {/* Texto condicional */}
                                        <span className="text-sm font-medium">
                                            {fileName
                                                ? `Archivo seleccionado: ${fileName}`
                                                : 'Subir su Firma Electrónica (PNG, JPG o PDF)'
                                            }
                                        </span>
                                    </div>

                                    {/* Muestra un indicador de 'Cambiar archivo' si ya hay un archivo */}
                                    {fileName && (
                                        <span className="text-xs text-green-600 border border-green-600 px-2 py-0.5 rounded-full mt-1 hover:bg-green-100 transition">
                                            Cambiar archivo
                                        </span>
                                    )}

                                </label>
                            </div>
                            {/* FIN: Subida de Archivos */}

                            {/* Número de contacto */}
                            <div className="bg-green-50 rounded-lg p-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <input
                                        type="tel"
                                        value={formData.contactNumber}
                                        onChange={(e) =>
                                            setFormData({ ...formData, contactNumber: e.target.value })
                                        }
                                        placeholder="Número de contacto"
                                        className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
                                    />
                                </label>
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.acceptTerms}
                                        onChange={(e) =>
                                            setFormData({ ...formData, acceptTerms: e.target.checked })
                                        }
                                        className="mt-1 w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Acepto los Términos y Condiciones y la política de Privacidad
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.receiveOffers}
                                        onChange={(e) =>
                                            setFormData({ ...formData, receiveOffers: e.target.checked })
                                        }
                                        className="mt-1 w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Quiero recibir ofertas y beneficios exclusivos
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.acceptDataDeclaration}
                                        onChange={(e) =>
                                            setFormData({ ...formData, acceptDataDeclaration: e.target.checked })
                                        }
                                        className="mt-1 w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Acepto declaración jurada de datos personales
                                    </span>
                                </label>
                            </div>

                            {/* Link olvidó contraseña */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    ¿Olvidó la contraseña?
                                </button>
                            </div>

                            {/* Botón Submit */}
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition"
                            >
                                Registrarse
                            </button>
                        </div>
                    </div>

                    {/* Botón cerrar */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                    >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
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