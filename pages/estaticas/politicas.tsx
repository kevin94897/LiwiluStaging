// pages/politicas.tsx
'use client';

import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import Image from 'next/image';

export default function Politicas() {
    return (
        <Layout title="Políticas - Liwilu" description="Políticas de envío y recojo de productos" background={true}>
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
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8">
                            Políticas de envío y recojo de productos
                        </h1>

                        <div className="space-y-6 text-gray-700 text-lg">
                            <p>
                                Estimados padres de familia y público en general; es grato comunicarnos con ustedes para hacer de su
                                conocimiento nuestras políticas de envío y recojo de productos.
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
                        {/* Política 1 */}
                        <div className="bg-white rounded-md p-6 md:p-8 shadow-lg">
                            <div className="mb-4">
                                <h2 className="text-xl md:text-2xl font-bold relative inline-block">
                                    1. ¿Cuáles son los tipos de entrega de pedido?
                                </h2>
                            </div>
                            <p className="text-gray-700 md:text-lg">
                                Puede acceder a su pedido de dos formas: solicitando un envío a su domicilio o acercándose a uno de los
                                puntos de recojo (puntos de despacho alrededor de Lima y provincia).
                            </p>
                        </div>

                        {/* Política 2 */}
                        <div className="rounded-md p-6 md:p-8 shadow-lg">
                            <div className="mb-4">
                                <h2 className="text-xl md:text-2xl font-bold relative inline-block">
                                    2. ¿Cuáles son los puntos de recojo de pedidos?
                                </h2>
                            </div>
                            <p className="text-gray-700 md:text-lg">
                                Estamos en el siguiente punto:<br />
                                <span className="font-semibold">– Ate: Calle Santa Lucía, n° 359 – Urb.Aurora, Etapa II Mz. E Lt. 6 –Ate</span>
                            </p>
                        </div>

                        {/* Política 3 */}
                        <div className="rounded-md p-6 md:p-8 shadow-lg">
                            <div className="mb-4">
                                <h2 className="text-xl md:text-2xl font-bold relative inline-block">
                                    3. ¿Cuánto tardará en llegar mi pedido si solicité un envío a domicilio?
                                </h2>
                            </div>
                            <div className="text-gray-700 md:text-lg space-y-3">
                                <p>
                                    En 5 días hábiles (no considerar sábados ni domingos), contando desde la emisión de su comprobante, el
                                    cual le llegará a su correo registrado en la compra.
                                </p>
                                <p>
                                    Si existe algún error en la información brindada al realizar su compra, su pedido se reprogramará para la
                                    semana siguiente.
                                </p>
                            </div>
                        </div>

                        {/* Política 4 */}
                        <div className="rounded-md p-6 md:p-8 shadow-lg">
                            <div className="mb-4">
                                <h2 className="text-xl md:text-2xl font-bold relative inline-block">
                                    4. ¿Y si solicité recogerlo en un punto autorizado?
                                </h2>
                            </div>
                            <div className="text-gray-700 md:text-lg space-y-3">
                                <p>
                                    Puede recoger su pedido luego de 5 días hábiles (no considerar sábados ni domingos) desde la emisión
                                    de su comprobante, en el punto que seleccionó. Tener en cuenta lo siguiente: llevar su comprobante de
                                    pago, DNI físico y la copia del titular de la compra.
                                </p>
                                <p>
                                    El horario de atención es de lunes a viernes, de 8:00 a. m. a 4:30 p. m. y los sábados de 8:00 a. m. a 12:30
                                    p. m.
                                </p>
                            </div>
                        </div>

                        {/* Política 5 */}
                        <div className="rounded-md p-6 md:p-8 shadow-lg">
                            <div className="mb-4">
                                <h2 className="text-xl md:text-2xl font-bold relative inline-block">
                                    5. ¿Por qué me están cobrando doble delivery?
                                </h2>
                            </div>
                            <p className="text-gray-700 md:text-lg">
                                Si tu pedido excede el peso máximo del costo de envío, se considera como un pedido extra.
                            </p>
                        </div>

                        {/* Política 6 */}
                        <div className="rounded-md p-6 md:p-8 shadow-lg">
                            <div className="mb-4">
                                <h2 className="text-xl md:text-2xl font-bold relative inline-block">
                                    6. Mi pedido debería haber llegado, pero aún no lo he recibido ¿Qué puedo hacer?
                                </h2>
                            </div>
                            <p className="text-gray-700 md:text-lg">
                                Puede llenar este formulario para comunicarnos con usted a la brevedad posible.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info adicional Section */}
                <div className="py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
                            Información importante
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Info 1 */}
                            <div className="bg-neutral-white rounded-md p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Tiempo de entrega</h3>
                                <p className="text-gray-700 text-center">
                                    5 días hábiles desde la emisión de su comprobante de pago
                                </p>
                            </div>

                            {/* Info 2 */}
                            <div className="bg-neutral-white rounded-md p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Puntos de recojo</h3>
                                <p className="text-gray-700 text-center">
                                    Disponibles en Lima y provincia para su comodidad
                                </p>
                            </div>

                            {/* Info 3 */}
                            <div className="bg-neutral-white rounded-md p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Compra segura</h3>
                                <p className="text-gray-700 text-center">
                                    Seguimiento completo de su pedido desde la compra hasta la entrega
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="max-w-6xl mx-auto px-4 py-16">
                    <div className="bg-primary rounded-3xl p-8 md:p-12 text-center shadow-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
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