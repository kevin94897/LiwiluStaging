// components/NuestrosProductos.tsx
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product, getProductImageUrl, formatPrice } from '@/lib/prestashop';

interface NuestrosProductosProps {
	productos?: Product[];
}

export default function NuestrosProductos({
	productos = [],
}: NuestrosProductosProps) {
	const [favoritos, setFavoritos] = useState<string[]>([]);

	// Si no hay productos, mostrar placeholders
	const productosAMostrar = productos.length > 0 ? productos.slice(0, 8) : [];

	const toggleFavorito = (id: string) => {
		setFavoritos((prev) =>
			prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
		);
	};

	if (productosAMostrar.length === 0) {
		return null; // No mostrar nada si no hay productos
	}

	return (
		<section className="bg-gray-50 py-16">
			<div className="max-w-7xl mx-auto px-6">
				<h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
					Nuestros Productos
				</h2>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
					{productosAMostrar.map((producto) => {
						const imageId = producto.associations?.images?.[0]?.id;
						const imageUrl = imageId
							? getProductImageUrl(producto.id, imageId)
							: '/no-image.png';

						return (
							<Link key={producto.id} href={`/producto/${producto.id}`}>
								<div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer">
									{/* Imagen del producto */}
									<div className="relative bg-gray-50">
										<div className="relative w-full aspect-square">
											<Image
												src={imageUrl}
												alt={producto.name?.[0]?.value || 'Producto'}
												fill
												className="object-contain p-4"
												unoptimized
											/>
										</div>

										{/* Botón de favorito */}
										<button
											onClick={(e) => {
												e.preventDefault();
												toggleFavorito(producto.id);
											}}
											className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
											aria-label="Agregar a favoritos"
										>
											<svg
												className={`w-6 h-6 ${
													favoritos.includes(producto.id)
														? 'text-red-500 fill-current'
														: 'text-gray-400'
												}`}
												fill={
													favoritos.includes(producto.id)
														? 'currentColor'
														: 'none'
												}
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
												/>
											</svg>
										</button>
									</div>

									{/* Info del producto */}
									<div className="bg-primary p-4">
										<div className="flex items-center justify-between">
											<div className="flex-1">
												<p className="text-white text-sm mb-1 truncate">
													{producto.name?.[0]?.value || 'Producto'}
												</p>
												<p className="text-white font-bold text-lg">
													{formatPrice(producto.price || '0')}
												</p>
											</div>
											<button
												onClick={(e) => {
													e.preventDefault();
													// Aquí iría la lógica para agregar al carrito
													console.log('Agregar al carrito:', producto.id);
												}}
												className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform ml-2"
												aria-label="Agregar al carrito"
											>
												<svg
													className="w-5 h-5 text-primary"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
													/>
												</svg>
											</button>
										</div>
									</div>
								</div>
							</Link>
						);
					})}
				</div>

				{/* Botón Ir a la Tienda */}
				<div className="flex justify-center">
					<Link href="/productos">
						<button className="bg-primary hover:bg-primary-dark text-white font-semibold px-12 py-4 rounded-full text-lg transition-all hover:scale-105 shadow-lg">
							Ir a la Tienda
						</button>
					</Link>
				</div>
			</div>
		</section>
	);
}
