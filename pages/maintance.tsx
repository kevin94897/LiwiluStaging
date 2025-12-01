// pages/mantenimiento.tsx
'use client';

import Layout from '@/components/Layout';
import Image from 'next/image';

export default function Mantenimiento() {
    return (
        <Layout title="Mantenimiento - Volvemos pronto" description="Estamos realizando mejoras" background={true}>
            <div className="flex items-center justify-center">
                <div className="max-w-2xl mx-auto py-16 px-4 text-center">

                    {/* Contenido principal con el diseño de la imagen de Mantenimiento */}
                    <div className="relative p-10 md:p-16">

                        {/* Imagen de mantenimiento */}
                        <div className="mb-8 w-full max-w-lg mx-auto">
                            {/* Reemplazar con una imagen SVG o PNG de mantenimiento alojada en /public */}
                            <Image
                                src="/images/liwilu-maintance.png" // Usar la imagen de mantenimiento real
                                alt="Página en mantenimiento"
                                width={517}
                                height={308}
                                className="w-full h-auto object-contain"
                            />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Página en mantenimiento
                        </h1>

                        <p className="text-gray-500 mb-10 font-semibold text-xl leading-tight">
                            Este espacio se encuentra en mantenimiento. Pronto estará disponible nuevamente
                        </p>
                    </div>

                </div>
            </div>
        </Layout>
    );
}