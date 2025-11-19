// components/NuestrosProductos.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Product, getProductImageUrl, formatPrice } from '@/lib/prestashop';
import { useCart } from '@/context/CartContext';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface NuestrosProductosProps {
	productos?: Product[];
}

export default function NuestrosProductos({
	productos = [],
}: NuestrosProductosProps) {
	const [favoritos, setFavoritos] = useState<string[]>([]);
	const [loadingCart, setLoadingCart] = useState<string | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	const { addToCart } = useCart();

	// Detectar si es mobile
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Cargar favoritos del localStorage
	useEffect(() => {
		const savedFavoritos = localStorage.getItem('liwilu_favoritos');
		if (savedFavoritos) {
			setFavoritos(JSON.parse(savedFavoritos));
		}
	}, []);

	const productosAMostrar = productos.length > 0 ? productos.slice(0, 8) : [];

	const toggleFavorito = (id: string) => {
		const updatedFavoritos = favoritos.includes(id)
			? favoritos.filter((fav) => fav !== id)
			: [...favoritos, id];
		
		setFavoritos(updatedFavoritos);
		localStorage.setItem('liwilu_favoritos', JSON.stringify(updatedFavoritos));
	};

	const handleAddToCart = async (e: React.MouseEvent, producto: Product) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			setLoadingCart(producto.id);
			addToCart(producto, 1);
			alert(`✓ ${producto.name?.[0]?.value || 'Producto'} agregado al carrito`);
		} catch (error) {
			console.error('Error al agregar al carrito:', error);
			alert('Error al agregar el producto al carrito');
		} finally {
			setLoadingCart(null);
		}
	};

	// Configuración del slider para mobile
	const sliderSettings = {
		dots: false,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 3000,
		arrows: false,
		centerMode: true,
		centerPadding: '20px',
		dotsClass: 'slick-dots custom-dots',
	};

	const ProductCard = ({ producto }: { producto: Product }) => {
		const imageId = producto.associations?.images?.[0]?.id;
		const imageUrl = imageId
			? getProductImageUrl(producto.id, imageId)
			: '/no-image.png';

		return (
			<Link href={`/tienda/${producto.id}`}>
				<div className="bg-white rounded-md overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer mx-2">
					{/* Imagen del producto */}
					<div className="relative bg-gray-50">
						<div className="relative w-full aspect-square">
							<Image
								src={imageUrl}
								alt={producto.name?.[0]?.value || 'Producto'}
								fill
								className="object-contain"
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
								<p className="text-white text-sm mb-1 h-10 line-clamp-2">
									{producto.name?.[0]?.value || 'Producto'}
								</p>
								<p className="text-white font-bold text-lg">
									{formatPrice(producto.price || '0')}
								</p>
							</div>
							<button
								onClick={(e) => handleAddToCart(e, producto)}
								disabled={loadingCart === producto.id}
								className={`w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform ml-2 ${
									loadingCart === producto.id
										? 'opacity-50 cursor-not-allowed'
										: ''
								}`}
								aria-label="Agregar al carrito"
							>
								{loadingCart === producto.id ? (
									<svg
										className="animate-spin h-5 w-5 text-primary"
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
								) : (
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
								)}
							</button>
						</div>
					</div>
				</div>
			</Link>
		);
	};

	if (productosAMostrar.length === 0) {
		return null;
	}

	return (
		<section className="bg-gray-50 py-5 md:py-16">
			<div className="max-w-7xl mx-auto px-6">
				<h2 className="text-2xl md:text-4xl font-semibold text-center mb-5 md:mb-12 text-primary-dark">
					Nuestros Productos
				</h2>

				{/* Slider para Mobile */}
				{isMobile ? (
					<div className="mb-12">
						<Slider {...sliderSettings}>
							{productosAMostrar.map((producto) => (
								<div key={producto.id}>
									<ProductCard producto={producto} />
								</div>
							))}
						</Slider>
					</div>
				) : (
					/* Grid para Desktop */
					<div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
						{productosAMostrar.map((producto) => (
							<ProductCard key={producto.id} producto={producto} />
						))}
					</div>
				)}

				{/* Botón Ir a la Tienda */}
				<div className="flex justify-center">
					<Link href="/productos">
						<button className="bg-primary hover:bg-primary-dark text-white font-semibold px-16 py-3 rounded-full text-md md:text-xl transition-all hover:scale-105 shadow-lg">
							Ir a la Tienda
						</button>
					</Link>
				</div>
			</div>

			{/* CSS personalizado para los dots del slider */}
			<style jsx global>{`
				.custom-dots {
					bottom: -40px;
				}
				.custom-dots li button:before {
					font-size: 12px;
					color: #d1d5db;
				}
				.custom-dots li.slick-active button:before {
					color: var(--primary-color, #2563eb);
				}
			`}</style>
		</section>
	);
}