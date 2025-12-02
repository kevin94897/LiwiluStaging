// pages/404.tsx
'use client';

import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';

export default function Custom404() {
    return (
        // Se asume que el Layout maneja la estructura general, pero aquí se centra el contenido
        <Layout title="404 - Página no encontrada" description="La página que buscas no existe" background={true}>
            <div className="flex items-center justify-center">
                <div className="max-w-2xl mx-auto py-16 px-4 text-center">

                    <div className="relative p-10 md:p-16 ">

                        <p className="text-4xl font-bold text-gray-800 mb-6">
                            ¡Uy!
                        </p>

                        <div className="inline-block mb-8">
                            <h1 className="text-8xl md:text-9xl font-extrabold text-white bg-primary-dark py-4 px-10 border-4 border-green-400 shadow-2xl">
                                404
                            </h1>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-4">
                            Página no encontrada
                        </h2>

                        <p className="text-gray-500 mb-10 font-semibold text-xl leading-tight">
                            Lo sentimos, la página que buscas no existe si crees que algo no funciona, informa de un problema
                        </p>

                        <Button href="/" variant="outline" size="md">
                            Ir a inicio
                        </Button>
                    </div>

                </div>
            </div>
        </Layout>
    );
}