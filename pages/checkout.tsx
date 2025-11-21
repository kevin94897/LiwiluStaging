// pages/checkout.tsx
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { getProductImageUrl, formatPrice } from '@/lib/prestashop';
import { FaCreditCard, FaMoneyBillWave, FaTimes } from 'react-icons/fa';

type TipoComprobante = 'boleta' | 'factura';
type MetodoPago = 'visa' | 'debito' | 'yape' | 'efectivo';

export default function Checkout() {
    const router = useRouter();
    const { items, getCartTotal } = useCart();
    const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>('factura');
    const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
    const [processing, setProcessing] = useState(false);

    // Datos para Boleta
    const [datosBoletaRUC, setDatosBoletaRUC] = useState('');

    // Datos para Factura
    const [datosFactura, setDatosFactura] = useState({
        ruc: '',
        razonSocial: 'DNI'
    });

    // Datos de tarjeta
    const [datosTarjeta, setDatosTarjeta] = useState({
        numero: '',
        nombre: '',
        vencimiento: '',
        cvv: ''
    });

    // Tarjetas guardadas (simulado)
    const tarjetasGuardadas = [
        { id: '1', tipo: 'visa', ultimos4: '1513' }
    ];

    const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<string | null>('1');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const subtotal = getCartTotal();
    const envio = 7;
    const total = subtotal + envio;

    // Validar campos según tipo de comprobante
    const validarDatos = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (tipoComprobante === 'boleta') {
            if (!datosBoletaRUC || datosBoletaRUC.length < 8) {
                newErrors.rucBoleta = 'Ingresa un RUC válido';
            }
        } else {
            if (!datosFactura.ruc || datosFactura.ruc.length !== 11) {
                newErrors.rucFactura = 'El RUC debe tener 11 dígitos';
            }
            if (!datosFactura.razonSocial) {
                newErrors.razonSocial = 'Selecciona una razón social';
            }
        }

        if (!metodoPago) {
            newErrors.metodoPago = 'Selecciona un método de pago';
        }

        // Validar datos de tarjeta si se eligió tarjeta nueva
        if ((metodoPago === 'visa' || metodoPago === 'debito') && !tarjetaSeleccionada) {
            if (!datosTarjeta.numero || datosTarjeta.numero.length < 16) {
                newErrors.numeroTarjeta = 'Número de tarjeta inválido';
            }
            if (!datosTarjeta.nombre) {
                newErrors.nombreTarjeta = 'Ingresa el nombre del titular';
            }
            if (!datosTarjeta.vencimiento) {
                newErrors.vencimiento = 'Ingresa la fecha de vencimiento';
            }
            if (!datosTarjeta.cvv || datosTarjeta.cvv.length !== 3) {
                newErrors.cvv = 'CVV inválido';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProcesarPago = async () => {
        if (!validarDatos()) {
            return;
        }

        setProcessing(true);

        // Simular procesamiento de pago
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generar número de pedido
        const numeroPedido = Math.floor(Math.random() * 9000) + 1000;

        // Redirigir a página de confirmación
        router.push(`/pedido-exitoso?order=${numeroPedido}`);
    };

    // Formatear número de tarjeta
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0; i < match.length; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        return parts.length ? parts.join(' ') : value;
    };

    if (items.length === 0) {
        return (
            <Layout title="Checkout - Liwilu" description="Finalizar compra" background={true}>
                <div className="max-w-7xl mx-auto px-6 py-16 mt-32 text-center">
                    <h2 className="text-2xl font-bold mb-4">No hay productos en el carrito</h2>
                    <button onClick={() => router.push('/productos')} className="bg-primary text-white px-6 py-3 rounded-full">
                        Ir a la tienda
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Checkout - Liwilu" description="Finalizar compra" background={true}>
            <div className="max-w-7xl mx-auto px-6 py-8 my-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna izquierda - Formulario */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tipo de Comprobante */}
                        <div className="bg-white rounded-md shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6">Comprobante de Pago</h2>
                            <p className="text-gray-600 mb-4 text-sm">Selecciona el comprobante de pago que prefieras</p>

                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => setTipoComprobante('boleta')}
                                    className={`flex-1 py-3 px-4 rounded-sm border-2 font-semibold transition-all ${tipoComprobante === 'boleta'
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-gray-200 text-gray-700 hover:border-primary'
                                        }`}
                                >
                                    Boleta
                                </button>
                                <button
                                    onClick={() => setTipoComprobante('factura')}
                                    className={`flex-1 py-3 px-4 rounded-sm border-2 font-semibold transition-all ${tipoComprobante === 'factura'
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-gray-200 text-gray-700 hover:border-primary'
                                        }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                        </svg>
                                        Factura
                                    </span>
                                </button>
                            </div>

                            {/* Formulario Boleta */}
                            {tipoComprobante === 'boleta' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            RUC
                                        </label>
                                        <input
                                            type="text"
                                            value={datosBoletaRUC}
                                            onChange={(e) => setDatosBoletaRUC(e.target.value)}
                                            placeholder="Gonzalo"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                                        />
                                        {errors.rucBoleta && (
                                            <p className="text-red-500 text-xs mt-1">{errors.rucBoleta}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Formulario Factura */}
                            {tipoComprobante === 'factura' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                RUC
                                            </label>
                                            <input
                                                type="text"
                                                value={datosFactura.ruc}
                                                onChange={(e) => setDatosFactura({ ...datosFactura, ruc: e.target.value })}
                                                placeholder="Gonzalo"
                                                maxLength={11}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                                            />
                                            {errors.rucFactura && (
                                                <p className="text-red-500 text-xs mt-1">{errors.rucFactura}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Razón Social
                                            </label>
                                            <select
                                                value={datosFactura.razonSocial}
                                                onChange={(e) => setDatosFactura({ ...datosFactura, razonSocial: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition appearance-none"
                                            >
                                                <option value="DNI">DNI</option>
                                                <option value="RUC">RUC</option>
                                                <option value="CE">Carnet de Extranjería</option>
                                            </select>
                                            {errors.razonSocial && (
                                                <p className="text-red-500 text-xs mt-1">{errors.razonSocial}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tipo de pago */}
                        <div className="bg-white rounded-md shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6">Tipo de pago</h2>

                            <div className="space-y-3">
                                {/* Tarjetas guardadas */}
                                {metodoPago === 'visa' && tarjetasGuardadas.map((tarjeta) => (
                                    <div
                                        key={tarjeta.id}
                                        onClick={() => setTarjetaSeleccionada(tarjeta.id)}
                                        className={`flex items-center justify-between p-4 rounded-sm border-2 cursor-pointer transition-all ${tarjetaSeleccionada === tarjeta.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FaCreditCard className="text-2xl text-gray-600" />
                                            <span className="font-medium">VISA ****{tarjeta.ultimos4}</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Eliminar tarjeta
                                            }}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}

                                {/* Tarjeta de débito */}
                                <button
                                    onClick={() => {
                                        setMetodoPago('debito');
                                        setTarjetaSeleccionada(null);
                                    }}
                                    className={`w-full flex items-center gap-3 p-4 rounded-sm border-2 transition-all ${metodoPago === 'debito'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 hover:border-primary/50'
                                        }`}
                                >
                                    <FaCreditCard className="text-2xl text-gray-600" />
                                    <span className="font-medium">Tarjeta de débito</span>
                                </button>

                                {/* Yape */}
                                <button
                                    onClick={() => setMetodoPago('yape')}
                                    className={`w-full flex items-center gap-3 p-4 rounded-sm border-2 transition-all ${metodoPago === 'yape'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 hover:border-primary/50'
                                        }`}
                                >
                                    <div className="w-8 h-8 bg-purple-600 rounded-sm flex items-center justify-center text-white font-bold">
                                        Y
                                    </div>
                                    <span className="font-medium">Yape</span>
                                </button>

                                {/* Pago Efectivo */}
                                <button
                                    onClick={() => setMetodoPago('efectivo')}
                                    className={`w-full flex items-center gap-3 p-4 rounded-sm border-2 transition-all ${metodoPago === 'efectivo'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 hover:border-primary/50'
                                        }`}
                                >
                                    <FaMoneyBillWave className="text-2xl text-green-600" />
                                    <span className="font-medium">Pago Efectivo</span>
                                </button>
                            </div>

                            {errors.metodoPago && (
                                <p className="text-red-500 text-sm mt-3">{errors.metodoPago}</p>
                            )}

                            {/* Formulario de tarjeta nueva */}
                            {(metodoPago === 'visa' || metodoPago === 'debito') && !tarjetaSeleccionada && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-sm space-y-4 animate-fade-in">
                                    <h3 className="font-semibold text-gray-900 mb-3">Datos de la tarjeta</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Número de tarjeta
                                        </label>
                                        <input
                                            type="text"
                                            value={datosTarjeta.numero}
                                            onChange={(e) => setDatosTarjeta({
                                                ...datosTarjeta,
                                                numero: formatCardNumber(e.target.value)
                                            })}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                                        />
                                        {errors.numeroTarjeta && (
                                            <p className="text-red-500 text-xs mt-1">{errors.numeroTarjeta}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre del titular
                                        </label>
                                        <input
                                            type="text"
                                            value={datosTarjeta.nombre}
                                            onChange={(e) => setDatosTarjeta({ ...datosTarjeta, nombre: e.target.value.toUpperCase() })}
                                            placeholder="JUAN PEREZ"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                                        />
                                        {errors.nombreTarjeta && (
                                            <p className="text-red-500 text-xs mt-1">{errors.nombreTarjeta}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Vencimiento
                                            </label>
                                            <input
                                                type="text"
                                                value={datosTarjeta.vencimiento}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, '');
                                                    if (value.length >= 2) {
                                                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                                    }
                                                    setDatosTarjeta({ ...datosTarjeta, vencimiento: value });
                                                }}
                                                placeholder="MM/AA"
                                                maxLength={5}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                                            />
                                            {errors.vencimiento && (
                                                <p className="text-red-500 text-xs mt-1">{errors.vencimiento}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                value={datosTarjeta.cvv}
                                                onChange={(e) => setDatosTarjeta({
                                                    ...datosTarjeta,
                                                    cvv: e.target.value.replace(/\D/g, '')
                                                })}
                                                placeholder="123"
                                                maxLength={3}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                                            />
                                            {errors.cvv && (
                                                <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="text-center md:text-left">
                            <button
                                onClick={handleProcesarPago}
                                disabled={processing}
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-28 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Procesando pago...
                                    </span>
                                ) : (
                                    'Siguiente'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Columna derecha - Resumen */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-md shadow-lg p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Resumen del pedido</h2>

                            <div className="space-y-4 mb-6">
                                {items.map((item) => {
                                    const imageId = item.product.associations?.images?.[0]?.id;
                                    const imageUrl = imageId ? getProductImageUrl(item.product.id, imageId) : '/no-image.png';

                                    return (
                                        <div key={item.product.id} className="flex gap-3">
                                            <div className="relative w-16 h-16 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={imageUrl}
                                                    alt={item.product.name?.[0]?.value || 'Producto'}
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                                                    {item.product.name?.[0]?.value || 'Producto'}
                                                </h3>
                                                <p className="text-xs text-gray-500">X{item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    {formatPrice((parseFloat(item.product.price || '0') * item.quantity).toString())}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t pt-4 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">{formatPrice(subtotal.toString())}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Envío</span>
                                    <span className="font-semibold">{formatPrice(envio.toString())}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-3 border-t">
                                    <span>Total</span>
                                    <span className="text-primary">{formatPrice(total.toString())}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-green-600 bg-green-50 p-3 rounded-sm">
                                    <span>Pagado</span>
                                    <span>{formatPrice(total.toString())}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
				@keyframes fade-in {
					from { opacity: 0; transform: translateY(10px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.animate-fade-in {
					animation: fade-in 0.3s ease-out;
				}
			`}</style>
        </Layout>
    );
}