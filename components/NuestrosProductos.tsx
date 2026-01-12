// components/NuestrosProductos.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Product } from '@/lib/catalog';
import { getProductImageUrl, formatPrice, getProductName } from '@/lib/utils';
import { toggleFavorite, getFavorites } from '@/lib/catalog';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import {
	fadeInUp,
	staggerContainer,
	staggerItem,
	cardHover,
	transitions,
	viewportConfig
} from '@/lib/motionVariants';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Button from './ui/Button';
import AddToCartModal from '@/components/AddToCartModal';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';

interface NuestrosProductosProps {
	productos?: Product[];
}

export default function NuestrosProductos({
	productos = [],
}: NuestrosProductosProps) {
	const [favoritos, setFavoritos] = useState<string[]>([]);
	const [loadingCart, setLoadingCart] = useState<string | null>(null);
	const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	const [modalProduct, setModalProduct] = useState<Product | null>(null);
	const { addToCart } = useCart();
	const router = useRouter();

	// Detectar si es mobile
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Cargar favoritos del API
	useEffect(() => {
		async function loadFavorites() {
			try {
				const response = await getFavorites();
				if (response.success) {
					// Map favorite products to their IDs
					const favoriteIds = response.data.map(fav => fav.id.toString());
					setFavoritos(favoriteIds);
				}
			} catch (error) {
				// Silently fail if user is not authenticated
				console.log('Could not load favorites:', error);
			}
		}
		loadFavorites();
	}, []);

	const productosAMostrar = productos.length > 0 ? productos.slice(0, 8) : [];

	const toggleFavorito = async (id: string) => {
		try {
			setTogglingFavorite(id);

			// Call API to toggle favorite
			const result = await toggleFavorite(parseInt(id));

			// Update local state based on API response
			if (result.isFavorite) {
				setFavoritos((prev) => [...prev, id]);
				toast.success('Producto agregado a favoritos', {
					duration: 2000,
					position: 'bottom-right',
					style: {
						fontSize: '14px',
						fontFamily: 'Outfit',
					},
				});
			} else {
				setFavoritos((prev) => prev.filter((fav) => fav !== id));
				toast.success('Producto eliminado de favoritos', {
					duration: 2000,
					position: 'bottom-right',
					style: {
						fontSize: '14px',
						fontFamily: 'Outfit',
					},
				});
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);

			// Check if it's an authentication error
			if (error instanceof Error && error.message.includes('No hay sesión activa')) {
				toast.error('Debes iniciar sesión para agregar favoritos', {
					duration: 3000,
					style: {
						fontSize: '14px',
						fontFamily: 'Outfit',
					},
				});
				router.push(
					{
						pathname: router.pathname,
						query: { ...router.query, login: 'true' },
					},
					undefined,
					{ shallow: true }
				);
			} else {
				toast.error('Error al actualizar favoritos');
			}
		} finally {
			setTogglingFavorite(null);
		}
	};

	const handleAddToCart = async (e: React.MouseEvent, producto: Product) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			setLoadingCart(producto.id.toString());
			addToCart(producto, 1);

			// Abrir modal
			setModalProduct(producto);


		} catch (error) {
			console.error('Error al agregar al carrito:', error);
			toast.error('Error al agregar el producto al carrito');
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
		// Priority to coverImage if available (from catalog)
		const imageUrl = producto.coverImage || (
			producto.associations?.images?.[0]?.id
				? getProductImageUrl(producto.id.toString(), producto.associations.images[0].id)
				: '/no-image.png'
		);

		return (
			<Link href={`/tienda/${producto.id}`}>
				<div className="bg-white rounded-md shadow-lg overflow-hidden hover:shadow-xl transition h-full">
					<div className="relative">
						<span className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold z-10">
							OFERTA
						</span>
						{(producto.quantity ?? 0) <= 0 && (
							<span className="absolute top-2 right-2 md:right-auto md:left-2 md:top-10 bg-red-400 text-white px-3 py-1 rounded-full text-xs font-bold z-20 shadow-md">
								AGOTADO
							</span>
						)}
						<div className="relative w-full h-48">
							<Image
								src={imageUrl}
								alt={getProductName(producto)}
								fill
								unoptimized
								className={`object-cover ${(producto.quantity ?? 0) <= 0 ? 'grayscale opacity-60' : ''}`}
							/>
						</div>
						<button
							className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 z-10 transition-transform hover:scale-110 disabled:opacity-50"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								toggleFavorito(producto.id.toString());
							}}
							disabled={togglingFavorite === producto.id.toString()}
						>
							{togglingFavorite === producto.id.toString() ? (
								<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
							) : (
								<FaHeart
									className={`w-5 h-5 transition ${favoritos.includes(producto.id.toString())
										? 'text-red-500 fill-current'
										: 'text-gray-400 hover:text-red-500'
										}`}
								/>
							)}
						</button>
					</div>

					<div className="p-4 flex flex-col justify-between h-44 bg-primary">
						<h3 className="font-semibold leading-tight text-lg mb-2 line-clamp-2 h-12 text-white">
							{getProductName(producto)}
						</h3>
						<div className="flex justify-between items-center mb-2">
							<span className="text-white text-sm line-through">
								{formatPrice(
									parseFloat((producto.price || 0).toString()) * 1.2
								)}
							</span>
							<span className="text-white font-bold text-lg">
								{formatPrice(producto.price || 0)}
							</span>
						</div>
						<Button
							size="sm"
							className={`w-full ${(producto.quantity ?? 0) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
							variant="secondary"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								if ((producto.quantity ?? 0) > 0) {
									handleAddToCart(e, producto);
								} else {
									e.preventDefault();
									e.stopPropagation();
								}
							}}
							disabled={loadingCart === producto.id.toString() || (producto.quantity ?? 0) <= 0}
						>
							{loadingCart === producto.id.toString() ? (
								<div className="flex items-center justify-center gap-2">
									<svg
										className="animate-spin h-4 w-4"
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
								</div>
							) : (producto.quantity ?? 0) <= 0 ? (
								<span className="flex items-center gap-2">
									<span>Agotado</span>
								</span>
							) : (
								<span className="flex items-center gap-2">
									<FaShoppingCart className="w-4 h-4" />
									<span>Agregar al carrito</span>
								</span>
							)}
						</Button>
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
				<motion.h2
					className="text-2xl md:text-4xl font-semibold text-center mb-5 md:mb-12 text-primary-dark"
					initial="hidden"
					whileInView="visible"
					viewport={viewportConfig}
					variants={fadeInUp}
					transition={transitions.smooth}
				>
					Nuestros Productos
				</motion.h2>

				{/* Slider para Mobile */}
				{isMobile ? (
					<motion.div
						className="mb-12"
						initial="hidden"
						whileInView="visible"
						viewport={viewportConfig}
						variants={fadeInUp}
						transition={transitions.smooth}
					>
						<Slider {...sliderSettings}>
							{productosAMostrar.map((producto) => (
								<div key={producto.id}>
									<ProductCard producto={producto} />
								</div>
							))}
						</Slider>
					</motion.div>
				) : (
					/* Grid para Desktop */
					<motion.div
						className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12"
						initial="hidden"
						whileInView="visible"
						viewport={viewportConfig}
						variants={staggerContainer}
					>
						{productosAMostrar.map((producto) => (
							<motion.div
								key={producto.id}
								variants={staggerItem}
								transition={transitions.smooth}
							>
								<ProductCard producto={producto} />
							</motion.div>
						))}
					</motion.div>
				)}

				{/* Botón Ir a la Tienda */}
				<motion.div
					className="flex justify-center"
					initial="hidden"
					whileInView="visible"
					viewport={viewportConfig}
					variants={fadeInUp}
					transition={{ delay: 0.3, ...transitions.smooth }}
				>
					<Button
						href='/productos'
						size='lg'
						variant='primary'
						className='w-full md:w-auto'
					>
						Ir a la Tienda
					</Button>
				</motion.div>
			</div>

			{/* Modal de confirmación */}
			{modalProduct && (
				<AddToCartModal
					isOpen={!!modalProduct}
					onClose={() => setModalProduct(null)}
					product={modalProduct}
				/>
			)}

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