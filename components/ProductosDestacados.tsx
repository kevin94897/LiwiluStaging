'use client';

import Image from 'next/image';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import AddToCartModal from '@/components/AddToCartModal';

import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { Product } from '@/lib/catalog';
import { getProductImageUrl, formatPrice, getProductName } from '@/lib/utils';
import { toggleFavorite, getFavorites } from '@/lib/catalog';
import Button from './ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

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
	const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
	const [modalProduct, setModalProduct] = useState<Product | null>(null);
	const { addToCart } = useCart();
	const router = useRouter();

	const toggleFavorito = async (e: React.MouseEvent<HTMLButtonElement>, productId: string) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			setTogglingFavorite(productId);

			// Call API to toggle favorite
			const result = await toggleFavorite(parseInt(productId));

			// Update local state based on API response
			if (result.isFavorite) {
				setFavoritos((prev) => [...prev, productId]);
				toast.success('Producto agregado a favoritos', {
					duration: 2000,
					position: 'bottom-right',
					style: {
						fontSize: '14px',
						fontFamily: 'Outfit',
					},
				});
			} else {
				setFavoritos((prev) => prev.filter((id) => id !== productId));
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
				// Trigger login modal without leaving the page
				router.push(
					{
						pathname: router.pathname,
						query: { ...router.query, login: 'true' },
					},
					undefined,
					{ shallow: true }
				);
			} else {
				toast.error('Error al actualizar favoritos. Por favor, intenta de nuevo.');
			}
		} finally {
			setTogglingFavorite(null);
		}
	};

	// Fetch user favorites on mount
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

	const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>, producto: Product) => {
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

	return (
		<section className="max-w-7xl mx-auto px-6 py-12">
			<h2 className="text-2xl md:text-4xl font-semibold text-center mb-8 text-primary-dark">
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
				</div>
			) : (
				<>
					{(() => {
						const activeProducts = featuredProducts.filter(p => (p.quantity ?? 0) > 0);
						if (activeProducts.length === 0) return (
							<div className="text-center py-12 bg-gray-100 rounded-xl">
								<p className="text-xl text-gray-600 mb-4">
									No hay productos disponibles con stock actualmente.
								</p>
							</div>
						);

						return (
							<Slider
								arrows={true}
								infinite={activeProducts.length > 4}
								speed={500}
								slidesToShow={Math.min(4, activeProducts.length)}
								slidesToScroll={1}
								autoplay={true}
								autoplaySpeed={3000}
								responsive={[
									{
										breakpoint: 1024,
										settings: {
											slidesToShow: Math.min(3, activeProducts.length),
											slidesToScroll: 1,
											infinite: activeProducts.length > 3,
										},
									},
									{
										breakpoint: 768,
										settings: {
											slidesToShow: Math.min(2, activeProducts.length),
											slidesToScroll: 1,
											infinite: activeProducts.length > 2,
										},
									},
									{
										breakpoint: 480,
										settings: {
											slidesToShow: 1,
											slidesToScroll: 1,
											infinite: activeProducts.length > 1,
										},
									},
								]}
								className="product-slider px-4"
							>
								{activeProducts.map((product) => {
									const imageUrl = product.coverImage || (
										product.associations?.images?.[0]?.id
											? getProductImageUrl(product.id.toString(), product.associations.images[0].id)
											: '/no-image.png'
									);

									return (
										<div key={product.id}>
											<Link href={`/tienda/${product.id}`}>
												<div className="bg-white rounded-md shadow-lg overflow-hidden hover:shadow-xl transition mb-10">
													<div className="relative">
														<span className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold z-10">
															OFERTA
														</span>
														<div className="relative w-full h-48">
															<Image
																src={imageUrl}
																alt={getProductName(product)}
																fill
																unoptimized
																className="object-cover"
															/>
														</div>
														<button
															className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 z-10 transition-transform hover:scale-110 disabled:opacity-50"
															onClick={(e) => toggleFavorito(e, product.id.toString())}
															disabled={togglingFavorite === product.id.toString()}
														>
															{togglingFavorite === product.id.toString() ? (
																<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
															) : (
																<FaHeart
																	className={`w-5 h-5 transition ${favoritos.includes(product.id.toString())
																		? 'text-red-500 fill-current'
																		: 'text-gray-400 hover:text-red-500'
																		}`}
																/>
															)}
														</button>
													</div>

													<div className="p-4 flex flex-col justify-between h-44 bg-primary">
														<h3 className="font-semibold leading-tight text-lg mb-2 line-clamp-2 h-12 text-white">
															{getProductName(product)}
														</h3>
														<div className="flex justify-between items-center mb-2">
															<span className="text-white text-sm line-through">
																{formatPrice(
																	parseFloat((product.price || 0).toString()) * 1.2
																)}
															</span>
															<span className="text-white font-bold text-lg">
																{formatPrice(product.price || 0)}
															</span>
														</div>
														<Button
															size="sm"
															className="w-full"
															variant="secondary"
															onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleAddToCart(e, product)}
															disabled={loadingCart === product.id.toString()}
														>
															{loadingCart === product.id.toString() ? (
																<>
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
																</>
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
										</div>
									);
								})}
							</Slider>
						);
					})()}
				</>
			)}

			{/* Modal de confirmación */}
			{modalProduct && (
				<AddToCartModal
					isOpen={!!modalProduct}
					onClose={() => setModalProduct(null)}
					product={modalProduct}
				/>
			)}
		</section>
	);
}