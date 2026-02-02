// pages/terminosycondiciones.tsx
'use client';

import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import Image from 'next/image';

export default function TerminosyCondiciones() {
    return (
        <Layout title="Terminos y Condiciones - Liwilu" description="Terminos y Condiciones de envío y recojo de productos" background={true}>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="relative md:h-[200px] h-[150px] z-10">
                    <Image
                        src="/images/liwilu-politicas-banner.png"
                        alt="Políticas de envío y recojo de productos"
                        width={1438}
                        height={201}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative py-16 px-4 overflow-hidden">

                    <div className="max-w-6xl mx-auto relative z-10">
                        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center mb-8">
                            Términos y Condiciones de Uso de la Página Web de Liwilu S.A.C.
                        </h1>

                        <div className="space-y-6 text-gray-700 text-lg">
                            <p>
                                Lea detenidamente estos Términos y Condiciones del Sitio Web de Liwilu S.A.C. (en adelante, LIWILU) www.liwilu.com.pe antes de utilizarlo.
                            </p>
                            <p>
                                Los datos personales que el usuario registre en el Sitio Web serán tratados conforme a la Política de Privacidad de Datos Personales de LIWILU, la que está publicada en la página web de LIWILU www.liwilu.com.pe
                            </p>

                            <p className="font-semibold">
                                En LIWILU nos comprometemos a brindarle un servicio transparente y eficiente para que su experiencia
                                de compra sea completamente satisfactoria.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Políticas Section */}
                <div className="max-w-6xl mx-auto z-10 relative px-4">
                    <div className="space-y-6">
                        {/* Termino 1 */}
                        <div className="bg-white rounded-md p-6 md:p-8 shadow-lg">
                            <div className="mb-4">
                                <h2 className="text-xl md:text-2xl font-semibold relative inline-block">
                                    1. Información general
                                </h2>
                            </div>
                            <p className="text-gray-700 md:text-lg">
                                El presente documento regula el acceso, uso y compra de productos en la página web oficial de LIWILU, con RUC N.° 20544481470, con domicilio en Av. Santa Lucía 359, distrito de Ate, provincia y departamento de Lima, Perú. Al ingresar y utilizar este sitio web, el usuario acepta en su totalidad los presentes Términos y Condiciones, así como nuestras Políticas de Envío, Recojo en Tienda, Cambios y Devoluciones, los que están publicados en la página web de LIWILU www.liwilu.com.pe. LIWILU se reserva el derecho de modificar, actualizar o complementar los presentes Términos y Condiciones en cualquier momento, los cuales entrarán en vigencia desde su publicación en la web, sin que ello implique algún perjuicio a los usuarios.
                            </p>
                        </div>

                        {/* Termino 2 */}
                        <div className="rounded-md p-6 md:p-8 shadow-lg">
                            <div className="mb-4">
                                <h2 className="text-xl md:text-2xl font-semibold relative inline-block">
                                    2. Propiedad Intelectual
                                </h2>
                            </div>
                            <p className="text-gray-700 md:text-lg">
                                Todos los contenidos del sitio web (imágenes, marcas, logotipos, fotografías, textos, gráficos, diseños, software, videos, entre otros) son de propiedad exclusiva de LIWILU o de terceros que han autorizado su uso y goce. Queda prohibida la reproducción, distribución, transformación, transmisión, almacenamiento, comunicación pública, copia, conceder licencias, publicar, crear trabajos derivados, vender información, software  o cualquier otro uso sin autorización expresa, previa y por escrito de LIWILU.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="max-w-6xl mx-auto px-4 py-16">
                    <div className="bg-primary rounded-3xl p-8 md:p-12 text-center shadow-2xl">
                        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                            ¿Tienes alguna duda?
                        </h2>
                        <p className="text-green-50 text-lg mb-8 max-w-2xl mx-auto">
                            Nuestro equipo está listo para ayudarte con cualquier consulta sobre tus pedidos y entregas.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button href="/contacto" variant="secondary" size="md">
                                Contáctanos
                            </Button>
                            <Button href="/catalogo" variant="outline_white" size="md">
                                Ver catálogo
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}