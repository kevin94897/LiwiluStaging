// app/trimegisto/autorizar-retiro/page.tsx
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { HiArrowLeft } from 'react-icons/hi';
import { PiWarningCircleFill } from 'react-icons/pi';
import router from 'next/router';
import Button from '@/components/ui/Button';
import { autorizacionSchema, AutorizacionSchemaType } from '@/lib/autorizacionSchema';

export default function AutorizarRetiroPage() {
    const [formData, setFormData] = useState<AutorizacionSchemaType>({
        documentType: 'DNI',
        documentNumber: '',
        fullName: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof AutorizacionSchemaType, string>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo al escribir
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleDocumentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
            setFormData(prev => ({ ...prev, documentNumber: value }));
            setErrors(prev => ({ ...prev, documentNumber: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validación con Zod
        const result = autorizacionSchema.safeParse(formData);

        if (!result.success) {
            const formattedErrors = result.error.flatten().fieldErrors;
            const newErrors: Partial<Record<keyof AutorizacionSchemaType, string>> = {};

            for (const key in formattedErrors) {
                const errorArray = formattedErrors[key as keyof typeof formattedErrors];
                if (errorArray && errorArray.length > 0) {
                    newErrors[key as keyof AutorizacionSchemaType] = errorArray[0];
                }
            }

            setErrors(newErrors);
            console.log("Errores de validación:", newErrors);
            return;
        }

        // Si es válido
        setErrors({});
        console.log('Autorización de retiro exitosa:', formData);
        // Aquí iría la lógica para guardar la autorización
        alert('✅ Autorización guardada exitosamente');
        router.back();
    };

    return (
        <Layout title="Políticas - Liwilu" description="Políticas de envío y recojo de productos" background={true}>
            <div className="flex items-center justify-center px-8 py-24 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-10 right-10 w-32 h-32 border-4 border-green-200 rounded-full opacity-20"></div>
                <div className="absolute top-20 right-32 w-20 h-20 border-4 border-green-300 rounded-full opacity-30"></div>
                <div className="absolute bottom-10 right-20 w-40 h-20 border-4 border-green-200 rounded-full opacity-20 transform rotate-45"></div>
                <div className="absolute bottom-32 right-10 w-24 h-24 border-4 border-green-300 rounded-full opacity-25"></div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-12 relative z-10">
                    {/* Botón Retroceder */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-6 group"
                    >
                        <HiArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition" />
                        <span className="font-medium">Volver</span>
                    </button>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3">
                            Autorizo que alguien más retire
                        </h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Tipo de documento */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tipo de documento *
                            </label>
                            <select
                                name="documentType"
                                value={formData.documentType}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-sm transition bg-white text-gray-700 ${errors.documentType
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                                    }`}
                            >
                                <option value="">Seleccionar tipo</option>
                                <option value="DNI">DNI</option>
                                <option value="CE">Carnet de Extranjería</option>
                                <option value="Pasaporte">Pasaporte</option>
                            </select>
                            {errors.documentType && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <PiWarningCircleFill size={16} /> {errors.documentType}
                                </p>
                            )}
                        </div>

                        {/* Número de Documento */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Número de Documento *
                            </label>
                            <input
                                type="text"
                                name="documentNumber"
                                value={formData.documentNumber}
                                onChange={handleDocumentNumberChange}
                                placeholder="74218601"
                                className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.documentNumber
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                                    }`}
                                maxLength={8}
                            />
                            {errors.documentNumber && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <PiWarningCircleFill size={16} /> {errors.documentNumber}
                                </p>
                            )}
                        </div>

                        {/* Nombre y apellido */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nombre y apellido *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Gonzalo Vera"
                                className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.fullName
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                                    }`}
                            />
                            {errors.fullName && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <PiWarningCircleFill size={16} /> {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Botón Guardar */}
                        <Button size='md' className='w-full' type='submit'>
                            Guardar autorización
                        </Button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}