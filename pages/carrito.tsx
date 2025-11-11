// pages/carrito.tsx
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getProductImageUrl, formatPrice } from '@/lib/prestashop';

export default function Carrito() {
	const { items, removeFromCart, updateQuantity, clearCart, getCartTotal } =
		useCart();
	const [couponCode, setCouponCode] = useState('');

	const handleUpdateQuantity = (productId: string, newQuantity: number) => {
		if (newQuantity < 1) return;
		updateQuantity(productId, newQuantity);
	};

	const subtotal = getCartTotal();
	const envio = subtotal > 100 ? 0 : 15; // Envío gratis si el total es mayor a S/ 100
	const total = subtotal + envio;

	if (items.length === 0) {
		return (
			<Layout title="Carrito - Liwilu" description="Tu carrito de compras">
				<div className="max-w-7xl mx-auto px-6 py-16 mt-32">
					<div className="text-center">
						<svg
							className="mx-auto h-24 w-24 text-gray-400 mb-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Tu carrito está vacío
						</h2>
						<p className="text-gray-600 mb-8">
							Agrega productos para comenzar tu compra
						</p>
						<Link
							href="/productos"
							className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition"
						>
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
				<h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Lista de productos */}
					<div className="lg:col-span-2 space-y-4">
						{items.map((item) => {
							const imageId = item.product.associations?.images?.[0]?.id;
							const imageUrl = imageId
								? getProductImageUrl(item.product.id, imageId)
								: '/no-image.png';

							return (
								<div
									key={item.product.id}
									className="bg-white rounded-xl shadow-md p-6 flex gap-6"
								>
									{/* Imagen */}
									<div className="relative w-32 h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
										<Image
											src={imageUrl}
											alt={item.product.name?.[0]?.value || 'Producto'}
											fill
											className="object-contain"
											unoptimized
										/>
									</div>

									{/* Info del producto */}
									<div className="flex-1">
										<Link href={`/producto/${item.product.id}`}>
											<h3 className="font-semibold text-lg mb-2 hover:text-primary transition">
												{item.product.name?.[0]?.value || 'Producto'}
											</h3>
										</Link>
										<p className="text-gray-600 text-sm mb-4">
											SKU: {item.product.reference || 'N/A'}
										</p>

										<div className="flex items-center justify-between">
											{/* Cantidad */}
											<div className="flex items-center border border-gray-300 rounded-lg">
												<button
													onClick={() =>
														handleUpdateQuantity(
															item.product.id,
															item.quantity - 1
														)
													}
													className="px-3 py-1 hover:bg-gray-100 transition"
												>
													-
												</button>
												<span className="px-4 py-1 border-x">
													{item.quantity}
												</span>
												<button
													onClick={() =>
														handleUpdateQuantity(
															item.product.id,
															item.quantity + 1
														)
													}
													className="px-3 py-1 hover:bg-gray-100 transition"
												>
													+
												</button>
											</div>

											{/* Precio */}
											<div className="text-right">
												<p className="text-2xl font-bold text-primary">
													{formatPrice(
														(
															parseFloat(item.product.price || '0') *
															item.quantity
														).toString()
													)}
												</p>
												<p className="text-sm text-gray-500">
													{formatPrice(item.product.price || '0')} c/u
												</p>
											</div>
										</div>

										{/* Botón eliminar */}
										<button
											onClick={() => removeFromCart(item.product.id)}
											className="mt-4 text-red-500 hover:text-red-700 text-sm font-medium"
										>
											Eliminar
										</button>
									</div>
								</div>
							);
						})}

						{/* Botón limpiar carrito */}
						<button
							onClick={clearCart}
							className="text-gray-600 hover:text-gray-900 text-sm font-medium"
						>
							Vaciar carrito
						</button>
					</div>

					{/* Resumen del pedido */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-xl shadow-md p-6 sticky top-32">
							<h2 className="text-xl font-bold mb-6">Resumen del pedido</h2>

							{/* Cupón de descuento */}
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Código de cupón
								</label>
								<div className="flex gap-2">
									<input
										type="text"
										value={couponCode}
										onChange={(e) => setCouponCode(e.target.value)}
										placeholder="Ingresa tu cupón"
										className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
									/>
									<button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition">
										Aplicar
									</button>
								</div>
							</div>

							{/* Desglose de precios */}
							<div className="space-y-3 mb-6 pb-6 border-b">
								<div className="flex justify-between text-gray-600">
									<span>Subtotal</span>
									<span>{formatPrice(subtotal.toString())}</span>
								</div>
								<div className="flex justify-between text-gray-600">
									<span>Envío</span>
									<span>
										{envio === 0 ? (
											<span className="text-green-600 font-medium">Gratis</span>
										) : (
											formatPrice(envio.toString())
										)}
									</span>
								</div>
								{envio > 0 && (
									<p className="text-xs text-gray-500">
										¡Envío gratis en compras mayores a S/ 100!
									</p>
								)}
							</div>

							<div className="flex justify-between text-xl font-bold mb-6">
								<span>Total</span>
								<span className="text-primary">
									{formatPrice(total.toString())}
								</span>
							</div>

							{/* Botón finalizar compra */}
							<Link href="/checkout">
								<button className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-full transition mb-3">
									Finalizar compra
								</button>
							</Link>

							<Link href="/productos">
								<button className="w-full bg-white hover:bg-gray-50 border-2 border-primary text-primary font-semibold py-3 rounded-full transition">
									Seguir comprando
								</button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
