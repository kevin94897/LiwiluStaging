// pages/nosotros.tsx
'use client';

import Layout from '@/components/Layout';
import Image from 'next/image';

export default function Nosotros() {
    return (
        <Layout title="Nosotros - Liwilu" description="Conoce más sobre Liwilu" background={true}>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="relative md:h-[200px] h-[150px] z-10">
                    <Image
                        src="/images/liwilu-nosotros-banner.png"
                        alt="Políticas de envío y recojo de productos"
                        width={1438}
                        height={201}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative py-16 px-4 overflow-hidden">
                    {/* Decoración de fondo con círculos */}
                    <div className="absolute top-10 right-10 w-32 h-32 border-2 border-green-200 rounded-full opacity-50"></div>
                    <div className="absolute top-32 right-32 w-20 h-20 border-2 border-green-200 rounded-full opacity-30"></div>
                    <div className="absolute bottom-20 right-20 w-40 h-40 border-2 border-green-200 rounded-full opacity-40"></div>

                    <div className="max-w-6xl mx-auto relative z-10">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-8">
                            ¿Quiénes somos?
                        </h1>

                        <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                            <p>
                                En LIWILU somos una empresa distribuidora y comercializadora de uniformes, equipos de
                                protección personal (EPPs) y artículos escolares, comprometida con brindar soluciones
                                confiables y de calidad a clientes en todo el Perú.
                            </p>

                            <p>
                                Nuestro propósito es acompañar a cada cliente con un servicio cercano, eficiente y
                                transparente, asegurando que cada compra se convierta en una experiencia segura y
                                satisfactoria.
                            </p>

                            <p>
                                Nos respaldan años de experiencia, una red sólida de proveedores y una logística que nos
                                permite llegar a cada rincón del país. Operamos bajo principios de responsabilidad social y
                                ambiental, convencidos de que el crecimiento empresarial debe ir de la mano con el bienestar
                                de nuestra comunidad y el cuidado del entorno.
                            </p>

                            <p className="font-semibold">
                                En LIWILU, más que vender productos, construimos relaciones de confianza que generan valor a
                                largo plazo.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Misión y Visión Section */}
                <div className="max-w-6xl mx-auto px-4 py-16">
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        {/* Imagen del equipo */}
                        <div className="relative rounded-2xl">
                            <Image
                                src="/images/liwilu-nosotros-image.png"
                                alt="Equipo Liwilu"
                                width={584}
                                height={597}
                                className="object-cover rounded-2xl"
                                unoptimized
                            />
                        </div>

                        {/* Misión y Visión */}
                        <div className="space-y-10">
                            {/* Misión */}
                            <div>
                                <div className="mb-4">
                                    <h2 className="text-3xl md:text-4xl font-bold text-primary-dark relative inline-block">
                                        Nuestra Misión
                                        <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary-dark"></span>
                                    </h2>
                                </div>
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    Brindar productos de calidad a través de un servicio confiable, eficiente y accesible, que satisfaga
                                    las necesidades de nuestros clientes en todo el Perú, contribuyendo al bienestar social y al cuidado del
                                    medio ambiente.
                                </p>
                            </div>

                            {/* Visión */}
                            <div>
                                <div className="mb-4">
                                    <h2 className="text-3xl md:text-4xl font-bold text-primary-dark relative inline-block">
                                        Nuestra Visión
                                        <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary-dark"></span>
                                    </h2>
                                </div>
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    Ser reconocidos a nivel nacional como la plataforma de e-commerce de referencia, destacando por la
                                    innovación en nuestros procesos digitales, la atención personalizada y la excelencia logística que garantizan
                                    experiencias de compra seguras y satisfactorias.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Valores Section */}
                <div className="py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
                            Nuestros Valores
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Valor 1 */}
                            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Calidad</h3>
                                <p className="text-gray-700 text-center">
                                    Nos comprometemos a ofrecer productos de la más alta calidad que superen las expectativas de nuestros clientes.
                                </p>
                            </div>

                            {/* Valor 2 */}
                            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Confianza</h3>
                                <p className="text-gray-700 text-center">
                                    Construimos relaciones duraderas basadas en la transparencia, honestidad y cumplimiento de nuestras promesas.
                                </p>
                            </div>

                            {/* Valor 3 */}
                            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Innovación</h3>
                                <p className="text-gray-700 text-center">
                                    Mejoramos continuamente nuestros procesos y servicios para ofrecer la mejor experiencia de compra digital.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="max-w-6xl mx-auto px-4 py-16">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            ¿Listo para trabajar con nosotros?
                        </h2>
                        <p className="text-green-50 text-lg mb-8 max-w-2xl mx-auto">
                            Únete a los cientos de clientes satisfechos que confían en LIWILU para sus necesidades de uniformes, EPPs y artículos escolares.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/contacto"
                                className="bg-white text-green-600 font-bold px-8 py-4 rounded-full hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Contáctanos
                            </a>
                            <a
                                href="/catalogo"
                                className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105"
                            >
                                Ver catálogo
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}