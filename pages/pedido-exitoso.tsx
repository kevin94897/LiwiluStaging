// pages/pedido-exitoso.tsx
'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/prestashop';
import { FaCheckCircle } from 'react-icons/fa';

export default function PedidoExitoso() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [numeroPedido, setNumeroPedido] = useState('');
    const [nombreCliente] = useState('RENZO R.');

    // Datos de ejemplo del pedido (en producción vendrían del backend)
    const pedidoData = {
        productos: [
            {
                id: '1',
                nombre: 'Polo Sport Saco Oliveros',
                cantidad: 2,
                precio: 82.00,
                imagen: '/images/productos/liwilu_producto_example.png'
            }
        ],
        subtotal: 328.00,
        envio: 7.00,
        total: 407.00
    };

    useEffect(() => {
        const order = searchParams?.get('order');
        if (order) {
            setNumeroPedido(order);
        } else {
            // Si no hay número de orden, generar uno
            setNumeroPedido(String(Math.floor(Math.random() * 9000) + 1000));
        }

        // Limpiar el carrito después de una compra exitosa
        // clearCart(); // Descomentar en producción
    }, [searchParams]);

    return (
        <Layout title="Pedido Exitoso - Liwilu" description="Tu pedido ha sido procesado">
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Columna izquierda - Confirmación */}
                        <div className="flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
                            {/* Logo */}
                            <div className="mb-4">
                                <Image
                                    src="/images/liwilu_logo_dark.png"
                                    alt="Liwilu"
                                    width={127}
                                    height={39}
                                    priority
                                />
                            </div>

                            {/* Icono de éxito */}
                            <div className="relative">
                                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                                    <FaCheckCircle className="text-green-500 text-7xl" />
                                </div>
                                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                            </div>

                            {/* Mensaje de éxito */}
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold text-gray-900">
                                    GRACIAS {nombreCliente}
                                </h1>

                                <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
                                    <p className="text-gray-700 text-lg mb-2">
                                        Tu pedido N° <span className="font-bold text-primary">{numeroPedido}</span>
                                    </p>
                                    <p className="text-gray-700 text-lg font-semibold">
                                        ha sido registrado con éxito
                                    </p>
                                </div>

                                <p className="text-gray-600 text-lg max-w-md mx-auto">
                                    Estamos gestionando tu compra
                                </p>
                            </div>

                            {/* Botones de acción */}
                            <div className="space-y-3 w-full max-w-md">
                                <button
                                    onClick={() => router.push(`/pedido/${numeroPedido}`)}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    Seguir tu pedido
                                </button>

                                <button
                                    onClick={() => router.push('/productos')}
                                    className="w-full bg-white hover:bg-gray-50 border-2 border-green-600 text-green-600 font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
                                >
                                    Ir a la tienda
                                </button>
                            </div>

                            {/* Información adicional */}
                            {/* <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto mt-8">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    📧 Hemos enviado un correo de confirmación con los detalles de tu pedido
                                </p>
                                <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                                    📱 Recibirás notificaciones sobre el estado de tu envío
                                </p>
                            </div> */}
                        </div>

                        {/* Columna derecha - Resumen del pedido */}
                        <div className="animate-fade-in-right">
                            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 sticky top-24">
                                <h2 className="text-2xl font-bold mb-6 pb-4 border-b-2 border-gray-100">
                                    Resumen del pedido
                                </h2>

                                {/* Lista de productos */}
                                <div className="space-y-6 mb-6">
                                    {pedidoData.productos.map((producto) => (
                                        <div key={producto.id} className="flex gap-4">
                                            <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={producto.imagen}
                                                    alt={producto.nombre}
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {producto.nombre}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    X{producto.cantidad}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">
                                                    {formatPrice((producto.precio * producto.cantidad).toString())}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totales */}
                                <div className="space-y-3 pt-6 border-t-2 border-gray-100">
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Subtotal</span>
                                        <span className="font-semibold">
                                            S/ {pedidoData.subtotal.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Envío</span>
                                        <span className="font-semibold">
                                            S/ {pedidoData.envio.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t-2 border-gray-100">
                                        <span>Total</span>
                                        <span className="text-primary">
                                            S/ {pedidoData.total.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-green-800">
                                                Pagado
                                            </span>
                                            <span className="text-xl font-bold text-green-600">
                                                S/ {pedidoData.total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Información del pedido */}
                                <div className="mt-8 pt-6 border-t-2 border-gray-100 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Número de pedido:</span>
                                        <span className="font-bold text-gray-900">#{numeroPedido}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Fecha:</span>
                                        <span className="font-semibold text-gray-900">
                                            {new Date().toLocaleDateString('es-PE', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Método de pago:</span>
                                        <span className="font-semibold text-gray-900">Tarjeta VISA</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Estado:</span>
                                        <span className="font-semibold text-green-600 flex items-center gap-1">
                                            <FaCheckCircle className="text-sm" />
                                            Confirmado
                                        </span>
                                    </div>
                                </div>

                                {/* Tiempo estimado de entrega */}
                                <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                Entrega estimada
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                10 días hábiles
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección de ayuda */}
                    <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            ¿Necesitas ayuda con tu pedido?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Nuestro equipo de atención al cliente está disponible para ayudarte
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/contacto" className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-full transition">
                                Contactar soporte
                            </Link>
                            <Link href="/ayuda" className="bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-full transition">
                                Centro de ayuda
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
				@keyframes fade-in {
					from { opacity: 0; transform: translateY(20px); }
					to { opacity: 1; transform: translateY(0); }
				}
				@keyframes fade-in-right {
					from { opacity: 0; transform: translateX(30px); }
					to { opacity: 1; transform: translateX(0); }
				}
				@keyframes scale-in {
					0% { transform: scale(0); opacity: 0; }
					50% { transform: scale(1.1); }
					100% { transform: scale(1); opacity: 1; }
				}
				.animate-fade-in {
					animation: fade-in 0.6s ease-out;
				}
				.animate-fade-in-right {
					animation: fade-in-right 0.6s ease-out;
				}
				.animate-scale-in {
					animation: scale-in 0.5s ease-out;
				}
			`}</style>
        </Layout>
    );
}