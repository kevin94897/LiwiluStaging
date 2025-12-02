// app/trimegisto/autorizar-retiro/page.tsx
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { HiArrowLeft } from 'react-icons/hi';
import router from 'next/router';

export default function AutorizarRetiroPage() {
    const [formData, setFormData] = useState({
        documentType: 'DNI',
        documentNumber: '',
        fullName: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Autorización de retiro:', formData);
        // Aquí iría la lógica para guardar la autorización
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
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            Autorizo que alguien<br />más retire
                        </h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Tipo de documento */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tipo de documento
                            </label>
                            <select
                                value={formData.documentType}
                                onChange={(e) =>
                                    setFormData({ ...formData, documentType: e.target.value })
                                }
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white text-gray-700"
                            >
                                <option value="DNI">DNI</option>
                                <option value="CE">Carnet de Extranjería</option>
                                <option value="Pasaporte">Pasaporte</option>
                            </select>
                        </div>

                        {/* Número de Documento */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Número de Documento
                            </label>
                            <input
                                type="text"
                                value={formData.documentNumber}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 8) {
                                        setFormData({ ...formData, documentNumber: value });
                                    }
                                }}
                                placeholder="74218601"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                maxLength={8}
                                required
                            />
                        </div>

                        {/* Nombre y apellido */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nombre y apellido
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) =>
                                    setFormData({ ...formData, fullName: e.target.value })
                                }
                                placeholder="Gonzalo"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                required
                            />
                        </div>

                        {/* Botón Guardar */}
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-green-600 text-white font-bold py-4 rounded-full transition shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Guardar
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}