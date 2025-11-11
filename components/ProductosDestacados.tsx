'use client';

import Image from 'next/image';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { Product, getProductImageUrl, formatPrice } from '@/lib/prestashop';

interface ProductProps {
	featuredProducts: Product[];
	error?: string;
}

export default function ProductosDestacados({
	featuredProducts,
	error,
}: ProductProps) {
	const [favoritos, setFavoritos] = useState<string[]>([]);
	const [loadingCart, setLoadingCart] = useState<string | null>(null);
	const { addToCart } = useCart();

	const toggleFavorito = (e: React.MouseEvent, productId: string) => {
		e.preventDefault();
		e.stopPropagation();

		setFavoritos((prev) =>
			prev.includes(productId)
				? prev.filter((id) => id !== productId)
				: [...prev, productId]
		);

		// Guardar en localStorage
		const updatedFavoritos = favoritos.includes(productId)
			? favoritos.filter((id) => id !== productId)
			: [...favoritos, productId];
		localStorage.setItem('liwilu_favoritos', JSON.stringify(updatedFavoritos));
	};

	const handleAddToCart = async (e: React.MouseEvent, producto: Product) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			setLoadingCart(producto.id);
			addToCart(producto, 1);

			// Notificación simple
			const notification = document.createElement('div');
			notification.className =
				'fixed top-24 right-4 bg-primary text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
			notification.innerHTML = `
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
					</svg>
					<span>Producto agregado al carrito</span>
				</div>
			`;
			document.body.appendChild(notification);

			setTimeout(() => {
				notification.remove();
			}, 3000);
		} catch (error) {
			console.error('Error al agregar al carrito:', error);
			alert('Error al agregar el producto al carrito');
		} finally {
			setLoadingCart(null);
		}
	};

	return (
		<section className="max-w-7xl mx-auto px-6 py-12">
			<h2 className="text-3xl font-bold text-center mb-8 text-primary">
				Productos destacados
			</h2>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					<strong>Error:</strong> {error}
				</div>
			)}

			{featuredProducts.length === 0 ? (
				<div className="text-center py-12 bg-gray-100 rounded-xl">
					<p className="text-xl text-gray-600 mb-4">
						No se pudieron cargar los productos de PrestaShop
					</p>
					<Link href="/api/test-prestashop" target="_blank">
						<button className="bg-blue-500 text-white px-6 py-2 rounded-lg">
							🔍 Probar Conexión API
						</button>
					</Link>
				</div>
			) : (
				<>
					<Slider
						arrows={true}
						infinite={true}
						speed={500}
						slidesToShow={4}
						slidesToScroll={1}
						autoplay={true}
						autoplaySpeed={3000}
						responsive={[
							{
								breakpoint: 1024,
								settings: {
									slidesToShow: 3,
									slidesToScroll: 1,
								},
							},
							{
								breakpoint: 768,
								settings: {
									slidesToShow: 2,
									slidesToScroll: 1,
								},
							},
							{
								breakpoint: 480,
								settings: {
									slidesToShow: 1,
									slidesToScroll: 1,
								},
							},
						]}
						className="product-slider px-4"
					>
						{featuredProducts.map((product) => {
							const imageId = product.associations?.images?.[0]?.id;
							const imageUrl = imageId
								? getProductImageUrl(product.id, imageId)
								: '/no-image.png';

							return (
								<div key={product.id} className="px-2">
									<Link href={`/producto/${product.id}`}>
										<div className="bg-white rounded-md shadow-lg overflow-hidden hover:shadow-xl transition">
											<div className="relative">
												<span className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold z-10">
													OFERTA
												</span>
												<div className="relative w-full h-48">
													<Image
														src={imageUrl}
														alt={product.name?.[0]?.value || 'Producto'}
														fill
														unoptimized
														className="object-cover"
													/>
												</div>
												<button
													className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 z-10 transition-transform hover:scale-110"
													onClick={(e) => toggleFavorito(e, product.id)}
												>
													<FaHeart
														className={`w-5 h-5 transition ${
															favoritos.includes(product.id)
																? 'text-red-500 fill-current'
																: 'text-gray-400 hover:text-red-500'
														}`}
													/>
												</button>
											</div>

											<div className="p-4 flex flex-col justify-between h-44">
												<h3 className="font-semibold text-sm mb-2 line-clamp-2 h-10">
													{product.name?.[0]?.value || 'Producto sin nombre'}
												</h3>
												<div className="flex justify-between items-center mb-2">
													<span className="text-gray-500 text-sm line-through">
														{formatPrice(
															parseFloat(product.price || '0') * 1.2
														)}
													</span>
													<span className="text-green-600 font-bold text-lg">
														{formatPrice(product.price || '0')}
													</span>
												</div>
												<button
													className="w-full btn btn-primary flex items-center justify-center gap-2 hover:scale-105 transition-transform rounded-full"
													onClick={(e) => handleAddToCart(e, product)}
													disabled={loadingCart === product.id}
												>
													{loadingCart === product.id ? (
														<>
															<svg
																className="animate-spin h-4 w-4"
																xmlns="http://www.w3.org/2000/svg"
																fill="none"
																viewBox="0 0 24 24"
															>
																<circle
																	className="opacity-25"
																	cx="12"
																	cy="12"
																	r="10"
																	stroke="currentColor"
																	strokeWidth="4"
																/>
																<path
																	className="opacity-75"
																	fill="currentColor"
																	d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
																/>
															</svg>
															<span>...</span>
														</>
													) : (
														<>
															<FaShoppingCart className="w-4 h-4" />
															<span>Agregar</span>
														</>
													)}
												</button>
											</div>
										</div>
									</Link>
								</div>
							);
						})}
					</Slider>
				</>
			)}

			<style jsx>{`
				@keyframes fade-in {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fade-in {
					animation: fade-in 0.3s ease-out;
				}
			`}</style>
		</section>
	);
}
