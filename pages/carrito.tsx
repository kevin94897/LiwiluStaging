// pages/carrito.tsx
'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getProductImageUrl, formatPrice } from '@/lib/prestashop';
import { FaRegTrashAlt, FaMapMarkerAlt, FaTruck, FaStore, FaCheck, FaTimes, FaCheckCircle, FaRegClock, FaTimesCircle } from 'react-icons/fa';

// Interfaz de tienda
interface Tienda {
	id_store: string;
	name: string;
	district: string;
	address: string;
	phone?: string;
	schedule?: string;
	stock?: number;
}

// Interfaz de disponibilidad de producto en tienda
interface ProductoEnTienda {
	id_product: string;
	tiendas: Tienda[];
}

// const DISTRITOS_LIMA = [
// 	'Ate', 'Barranco', 'Breña', 'Cercado de Lima', 'Chorrillos',
// 	'Jesús María', 'La Molina', 'La Victoria', 'Lince', 'Magdalena',
// 	'Miraflores', 'Pueblo Libre', 'San Borja', 'San Isidro',
// 	'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Luis',
// 	'San Miguel', 'Santa Anita', 'Santiago de Surco', 'Surquillo',
// 	'Villa El Salvador', 'Villa María del Triunfo',
// ];

const DISTRITOS_LIMA = [
	'Miraflores', 'San Isidro', 'Santiago de Surco',
];

export default function Carrito() {
	const { items, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
	const [couponCode, setCouponCode] = useState('');
	const [metodoEnvio, setMetodoEnvio] = useState<'delivery' | 'retiro'>('delivery');
	const [distritoSeleccionado, setDistritoSeleccionado] = useState('');
	const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string | null>(null);
	const [mostrarMapa, setMostrarMapa] = useState(false);
	const [productosEnTiendas, setProductosEnTiendas] = useState<Record<string, Tienda[]>>({});
	const [loadingStores, setLoadingStores] = useState(false);

	// Función para obtener tiendas con stock desde PrestaShop
	const fetchTiendasConStock = async (productIds: string[]) => {
		setLoadingStores(true);
		try {
			const response = await fetch('/api/prestashop/product-stores', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ product_ids: productIds })
			});

			if (!response.ok) throw new Error('Error al obtener tiendas');

			const data = await response.json();
			setProductosEnTiendas(data);
		} catch (error) {
			console.error('Error al cargar tiendas:', error);
		} finally {
			setLoadingStores(false);
		}
	};

	// Cargar tiendas cuando cambia el carrito
	useEffect(() => {
		if (items.length > 0) {
			const productIds = items.map(item => item.product.id);
			fetchTiendasConStock(productIds);
		}
	}, [items]);

	const handleUpdateQuantity = (productId: string, newQuantity: number) => {
		if (newQuantity < 1) return;
		updateQuantity(productId, newQuantity);
	};

	const handleCambiarARetiro = () => {
		setMetodoEnvio('retiro');
		setMostrarMapa(false);
		setTiendaSeleccionada(null);
		setDistritoSeleccionado('');
	};

	const handleSeleccionarDistrito = (distrito: string) => {
		setDistritoSeleccionado(distrito);
		setMostrarMapa(true);
		setTiendaSeleccionada(null);
	};

	// Obtener tiendas por distrito
	const getTiendasPorDistrito = (distrito: string): Tienda[] => {
		const tiendasDelDistrito: Tienda[] = [];

		Object.entries(productosEnTiendas).forEach(([productId, tiendas]) => {
			tiendas.forEach(tienda => {
				if (tienda.district === distrito) {
					// Evitar duplicados
					const existe = tiendasDelDistrito.find(t => t.id_store === tienda.id_store);
					if (!existe) {
						tiendasDelDistrito.push(tienda);
					}
				}
			});
		});

		return tiendasDelDistrito;
	};

	// Verificar si un producto tiene stock en una tienda específica
	const checkStockEnTienda = (productId: string, tiendaId: string): boolean => {
		const tiendasDelProducto = productosEnTiendas[productId] || [];
		const tienda = tiendasDelProducto.find(t => t.id_store === tiendaId);
		return tienda ? (tienda.stock || 0) > 0 : false;
	};

	// Obtener stock de un producto en una tienda
	const getStockEnTienda = (productId: string, tiendaId: string): number => {
		const tiendasDelProducto = productosEnTiendas[productId] || [];
		const tienda = tiendasDelProducto.find(t => t.id_store === tiendaId);
		return tienda?.stock || 0;
	};

	const subtotal = getCartTotal();
	const envio = metodoEnvio === 'delivery' ? (subtotal > 100 ? 0 : 15) : 0;
	const total = subtotal + envio;

	const tiendasDisponibles = distritoSeleccionado ? getTiendasPorDistrito(distritoSeleccionado) : [];

	// Obtener información de la tienda seleccionada
	const infoTiendaSeleccionada = tiendasDisponibles.find(t => t.id_store === tiendaSeleccionada);

	if (items.length === 0) {
		return (
			<Layout title="Carrito - Liwilu" description="Tu carrito de compras">
				<div className="max-w-7xl mx-auto px-6 py-16 mt-32">
					<div className="text-center animate-fade-in">
						<svg className="mx-auto h-24 w-24 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
						<h2 className="text-3xl font-bold text-primary-dark mb-4">Tu carrito está vacío</h2>
						<p className="text-gray-600 mb-8">Agrega productos para comenzar tu compra</p>
						<Link href="/productos" className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition">
							Ir a la tienda
						</Link>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout title="Carrito - Liwilu" description="Tu carrito de compras">
			<div className="max-w-7xl mx-auto px-6 py-8">
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold animate-fade-in">
						Carrito de compras <span className="text-gray-500 text-xl">({items.length} productos)</span>
					</h1>
					<Link href="/productos" className="text-sm text-gray-600 hover:text-primary">← Seguir comprando</Link>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
					<div className="lg:col-span-2 space-y-6">
						{/* Método de envío */}
						<div className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
							<h2 className="text-lg font-bold mb-4">Selecciona tu método de entrega</h2>
							<div className="grid grid-cols-2 gap-4">
								<button
									onClick={() => setMetodoEnvio('delivery')}
									className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${metodoEnvio === 'delivery' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
										}`}
								>
									<FaTruck className={`text-2xl ${metodoEnvio === 'delivery' ? 'text-primary' : 'text-gray-400'}`} />
									<div className="text-left">
										<p className="font-semibold">Delivery</p>
										<p className="text-xs text-gray-500">10 días hábiles</p>
									</div>
								</button>

								<button
									onClick={handleCambiarARetiro}
									className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${metodoEnvio === 'retiro' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
										}`}
								>
									<FaStore className={`text-2xl ${metodoEnvio === 'retiro' ? 'text-primary' : 'text-gray-400'}`} />
									<div className="text-left">
										<p className="font-semibold">Retiro en tienda</p>
										<p className="text-xs text-gray-500">Gratis</p>
									</div>
								</button>
							</div>

							{metodoEnvio === 'delivery' && (
								<div className="mt-4 p-4 bg-blue-50 rounded-lg animate-fade-in">
									<p className="text-sm text-gray-700">📦 El envío se realizará en el transcurso de 10 días hábiles.</p>
									<p className="text-sm font-semibold text-primary mt-2">
										Costo: {envio === 0 ? 'Gratis' : formatPrice(envio.toString())}
									</p>
								</div>
							)}

							{metodoEnvio === 'retiro' && !distritoSeleccionado && (
								<div className="mt-4 animate-fade-in">
									<p className="text-sm text-gray-700 mb-3">Selecciona el distrito para consultar los puntos de retiro disponibles</p>
									<select
										value={distritoSeleccionado}
										onChange={(e) => handleSeleccionarDistrito(e.target.value)}
										className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
									>
										<option value="">Seleccionar distrito</option>
										{DISTRITOS_LIMA.map((distrito) => (
											<option key={distrito} value={distrito}>{distrito}</option>
										))}
									</select>
								</div>
							)}
						</div>

						{/* Mapa y tiendas disponibles */}
						{metodoEnvio === 'retiro' && mostrarMapa && (
							<div className="bg-white rounded-xl shadow-md p-6 animate-fade-in-up">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-lg font-bold">Puntos de retiro más cercanos</h2>
									<button onClick={() => { setDistritoSeleccionado(''); setMostrarMapa(false); }} className="text-sm text-primary hover:text-primary-dark">
										✏️ Editar
									</button>
								</div>

								<div className="mb-4 p-3 bg-gray-100 rounded-lg">
									<p className="text-sm text-gray-700"><strong>Distrito:</strong> {distritoSeleccionado}</p>
								</div>

								{/* Mapa simulado */}
								<div className="relative h-64 bg-gray-200 rounded-lg mb-6 overflow-hidden">
									<Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop" alt="Mapa" fill className="object-cover opacity-70" />
									<div className="absolute inset-0 flex items-center justify-center">
										<FaMapMarkerAlt className="text-red-500 text-4xl animate-bounce" />
									</div>
								</div>

								{/* Lista de tiendas */}
								{loadingStores ? (
									<div className="text-center py-8">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
										<p className="mt-4 text-gray-600">Cargando tiendas disponibles...</p>
									</div>
								) : tiendasDisponibles.length === 0 ? (
									<div className="text-center py-8 bg-amber-50 rounded-lg">
										<FaTimesCircle className="text-amber-500 text-4xl mx-auto mb-3" />
										<p className="text-amber-800 font-semibold">No hay tiendas disponibles en este distrito</p>
										<p className="text-sm text-amber-700 mt-2">Intenta con otro distrito cercano</p>
									</div>
								) : (
									<div className="space-y-3">
										{tiendasDisponibles.map((tienda) => {
											const todosDisponibles = items.every((item) => checkStockEnTienda(item.product.id, tienda.id_store));

											return (
												<div
													key={tienda.id_store}
													className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${tiendaSeleccionada === tienda.id_store ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
														}`}
													onClick={() => setTiendaSeleccionada(tienda.id_store)}
												>
													<div className="flex items-start justify-between">
														<div className="flex-1">
															<h3 className="font-semibold text-gray-900">{tienda.name}</h3>
															<p className="text-sm text-gray-600">{tienda.address}</p>
															<p className="text-xs text-gray-500 mt-1">{tienda.schedule}</p>
														</div>
														<div className="ml-4">
															{tiendaSeleccionada === tienda.id_store && (
																<div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
																	<FaCheck className="text-white text-xs" />
																</div>
															)}
														</div>
													</div>

													{/* Disponibilidad de productos */}
													<div className="mt-3 pt-3 border-t border-gray-200">
														<p className="text-xs font-semibold text-gray-700 mb-2">Disponibilidad:</p>
														<div className="space-y-1">
															{items.map((item) => {
																const disponible = checkStockEnTienda(item.product.id, tienda.id_store);
																const stock = getStockEnTienda(item.product.id, tienda.id_store);

																return (
																	<div key={item.product.id} className="flex items-center justify-between gap-2 text-xs">
																		<div className="flex items-center gap-2">
																			{disponible ? (
																				<FaCheck className="text-green-500 flex-shrink-0" />
																			) : (
																				<FaTimes className="text-red-500 flex-shrink-0" />
																			)}
																			<span className={disponible ? 'text-gray-700' : 'text-gray-500'}>
																				{item.product.name?.[0]?.value}
																			</span>
																		</div>
																		{disponible && (
																			<span className="text-green-600 font-semibold">{stock} unid.</span>
																		)}
																	</div>
																);
															})}
														</div>
													</div>

													{!todosDisponibles && (
														<div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-800">
															⚠️ Algunos productos no están disponibles en esta tienda
														</div>
													)}
												</div>
											);
										})}
									</div>
								)}
							</div>
						)}

						{/* Productos en el carrito */}
						<div className="space-y-4">
							{items.map((item, index) => {
								const imageId = item.product.associations?.images?.[0]?.id;
								const imageUrl = imageId ? getProductImageUrl(item.product.id, imageId) : '/no-image.png';

								// Verificar si el producto está en la tienda seleccionada
								const enTiendaSeleccionada = tiendaSeleccionada && checkStockEnTienda(item.product.id, tiendaSeleccionada);
								const stockDisponible = tiendaSeleccionada ? getStockEnTienda(item.product.id, tiendaSeleccionada) : 0;

								return (
									<div key={item.product.id} className="bg-white rounded-md shadow-md p-6 flex gap-4 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
										<div>
											{metodoEnvio === 'retiro' && tiendaSeleccionada ? (
												enTiendaSeleccionada ? (
													<FaCheckCircle size={25} className='text-primary' />
												) : (
													<FaTimesCircle size={25} className='text-red-500' />
												)
											) : (
												<FaCheckCircle size={25} className='text-primary' />
											)}
										</div>

										<div className='w-full'>
											{metodoEnvio === 'retiro' && tiendaSeleccionada && infoTiendaSeleccionada && (
												<div className="w-full mb-5">
													<div className="flex items-center gap-4 mb-3">
														<Image src="/images/liwilu_logo_dark.png" alt="Liwilu" width={70} height={22} priority />
														<span className="font-semibold">{infoTiendaSeleccionada.name}</span>
													</div>
													<div className="flex items-center justify-between">
														<div className='text-neutral-grayLighter text-sm'>
															<p className='pb-1'>{infoTiendaSeleccionada.address}</p>
															<div className="flex items-center gap-4">
																{enTiendaSeleccionada ? (
																	<>
																		<span className='text-primary inline-flex gap-1 items-center'>
																			<FaRegClock size={15} /> Disponible
																		</span>
																		<span>{infoTiendaSeleccionada.schedule}</span>
																		<span className="text-green-600 font-semibold">{stockDisponible} en stock</span>
																	</>
																) : (
																	<span className='text-red-500 inline-flex gap-1 items-center'>
																		<FaTimes size={15} /> No disponible en esta tienda
																	</span>
																)}
															</div>
														</div>
														<div className="font-bold text-green-600">GRATIS</div>
													</div>
												</div>
											)}

											<div className="flex gap-6">
												<div className="relative w-32 h-32 flex-shrink-0 bg-gray-50 rounded-sm overflow-hidden">
													<Image src={imageUrl} alt={item.product.name?.[0]?.value || 'Producto'} fill className="object-contain" unoptimized />
												</div>

												<div className="flex-1">
													<Link href={`/tienda/${item.product.id}`}>
														<h3 className="font-semibold text-lg mb-2 hover:text-primary transition">
															{item.product.name?.[0]?.value || 'Producto'}
														</h3>
													</Link>
													<p className="text-gray-600 text-sm mb-4">SKU: {item.product.reference || 'N/A'}</p>

													<div className="flex items-center justify-between">
														<div className="flex items-center border border-gray-300 rounded-lg">
															<button onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100 transition">-</button>
															<span className="px-4 py-1 border-x">{item.quantity}</span>
															<button onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100 transition">+</button>
														</div>

														<div className="text-right">
															<p className="text-2xl font-bold text-primary-dark">
																{formatPrice((parseFloat(item.product.price || '0') * item.quantity).toString())}
															</p>
															<p className="text-sm text-gray-500">{formatPrice(item.product.price || '0')} c/u</p>
														</div>
													</div>

													<button onClick={() => removeFromCart(item.product.id)} className="mt-4 text-red-500 hover:text-red-700 text-sm font-medium flex gap-2">
														<FaRegTrashAlt size={18} /> Eliminar
													</button>
												</div>
											</div>
										</div>
									</div>
								);
							})}

							<button onClick={clearCart} className="text-gray-600 hover:text-red-600 text-sm font-medium transition">
								🗑️ Vaciar carrito
							</button>
						</div>
					</div>

					{/* Resumen del pedido */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-xl shadow-lg p-6 sticky top-32 animate-fade-in">
							<h2 className="text-xl font-bold mb-6">Resumen del pedido</h2>

							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-2">Código de cupón</label>
								<div className="flex gap-2">
									<input
										type="text"
										value={couponCode}
										onChange={(e) => setCouponCode(e.target.value)}
										placeholder="Ingresa tu cupón"
										className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
									/>
									<button className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg transition">Aplicar</button>
								</div>
							</div>

							<div className="space-y-3 mb-6 pb-6 border-b">
								<div className="flex justify-between text-gray-600">
									<span>Subtotal</span>
									<span className="font-semibold">{formatPrice(subtotal.toString())}</span>
								</div>
								<div className="flex justify-between text-gray-600">
									<span>Envío</span>
									<span className="font-semibold">
										{envio === 0 ? <span className="text-green-600">Gratis ✓</span> : formatPrice(envio.toString())}
									</span>
								</div>
								{metodoEnvio === 'delivery' && envio > 0 && (
									<p className="text-xs text-gray-500">¡Envío gratis en compras mayores a S/ 100!</p>
								)}
							</div>

							<div className="flex justify-between text-2xl font-bold mb-6">
								<span>Total</span>
								<span className="text-primary">{formatPrice(total.toString())}</span>
							</div>

							<Link href="/checkout">
								<button
									className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-full transition-all duration-300 mb-3 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={metodoEnvio === 'retiro' && !tiendaSeleccionada}
								>
									Finalizar compra
								</button>
							</Link>

							<Link href="/productos">
								<button className="w-full bg-white hover:bg-gray-50 border-2 border-primary text-primary font-semibold py-3 rounded-full transition-all duration-300 hover:scale-105">
									Seguir comprando
								</button>
							</Link>
						</div>
					</div>
				</div>
			</div>

			<style jsx global>{`
				@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
				@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
				.animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
				.animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; opacity: 0; }
			`}</style>
		</Layout>
	);
}