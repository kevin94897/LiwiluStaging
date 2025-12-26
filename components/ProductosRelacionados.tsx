'use client';

import Image from 'next/image';
import Link from 'next/link';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import AddToCartModal from '@/components/AddToCartModal';

import { Product, CatalogProduct } from '@/lib/catalog';
import { getProductImageUrl, formatPrice, getProductName } from '@/lib/utils';
import {
	fadeInUp,
	cardHover,
	transitions,
	viewportConfig
} from '@/lib/motionVariants';

interface ProductProps {
	productId: string | number;
	initialRelatedProducts?: Product[];
}

export default function ProductosRelacionados({
	productId,
	initialRelatedProducts = [],
}: ProductProps) {
	const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelatedProducts);
	const [loading, setLoading] = useState(!initialRelatedProducts.length);
	const [error, setError] = useState<string | null>(null);
	const [loadingCart, setLoadingCart] = useState<string | null>(null);
	const [modalProduct, setModalProduct] = useState<Product | null>(null);
	const { addToCart } = useCart();

	useEffect(() => {
		const fetchRelated = async () => {
			if (!productId) return;

			setLoading(true);
			setError(null);

			const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://liwilu-backend.nerdstudiolab.com/api';
			const url = `${baseUrl}/catalog/products/${productId}/related?limit=8`;

			try {
				const response = await fetch(url);
				if (!response.ok) throw new Error('Error al cargar productos relacionados');

				const json = await response.json();
				const products: Product[] = (json.data || []).map((p: CatalogProduct) => ({
					id: p.id,
					name: p.name,
					price: p.price,
					quantity: p.quantity,
					reference: p.reference,
					coverImage: p.coverImage,
					associations: {
						categories: [{ id: p.categoryId?.toString() || '0' }]
					}
				}));

				setRelatedProducts(products);
			} catch (err) {
				console.error('Error fetching related products:', err);
				setError('No se pudieron cargar los productos relacionados');
			} finally {
				setLoading(false);
			}
		};

		fetchRelated();
	}, [productId]);

	if (loading) {
		return (
			<section className="max-w-7xl mx-auto px-6 py-8">
				<div className="flex justify-center items-center h-48">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
				</div>
			</section>
		);
	}

	if (!loading && (!relatedProducts || relatedProducts.length === 0)) {
		return null;
	}

	const handleAddToCart = async (e: React.MouseEvent, producto: Product) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			setLoadingCart(producto.id.toString());
			addToCart(producto, 1);
			setModalProduct(producto);
		} catch (error) {
			console.error('Error al agregar al carrito:', error);
			alert('Error al agregar el producto al carrito');
		} finally {
			setLoadingCart(null);
		}
	};

	return (
		<section className="max-w-7xl mx-auto px-6 py-8">
			<motion.h2
				className="text-2xl md:text-4xl font-semibold text-center mb-8 text-primary-dark"
				initial="hidden"
				whileInView="visible"
				viewport={viewportConfig}
				variants={fadeInUp}
				transition={transitions.smooth}
			>
				Productos relacionados
			</motion.h2>

			{error && (
				<motion.div
					className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={transitions.fast}
				>
					<strong>Error:</strong> {error}
				</motion.div>
			)}

			<motion.div
				initial="hidden"
				whileInView="visible"
				viewport={viewportConfig}
				variants={fadeInUp}
				transition={transitions.smooth}
			>
				<Slider
					arrows={true}
					infinite={relatedProducts.length > 4}
					speed={500}
					slidesToShow={Math.min(4, relatedProducts.length)}
					slidesToScroll={1}
					autoplay={true}
					autoplaySpeed={3000}
					responsive={[
						{
							breakpoint: 1024,
							settings: {
								slidesToShow: Math.min(3, relatedProducts.length),
								slidesToScroll: 1,
								infinite: relatedProducts.length > 3,
							},
						},
						{
							breakpoint: 768,
							settings: {
								slidesToShow: Math.min(2, relatedProducts.length),
								slidesToScroll: 1,
								infinite: relatedProducts.length > 2,
							},
						},
						{
							breakpoint: 480,
							settings: {
								slidesToShow: 1,
								slidesToScroll: 1,
								infinite: relatedProducts.length > 1,
							},
						},
					]}
					className="product-slider"
				>
					{relatedProducts.map((product) => {
						const imageUrl = product.coverImage || (
							product.associations?.images?.[0]?.id
								? getProductImageUrl(product.id.toString(), product.associations.images[0].id)
								: '/no-image.png'
						);

						return (
							<div key={product.id} className="px-2 py-4">
								<motion.div
									className="bg-transparent rounded-md shadow-lg overflow-hidden transition h-full"
									initial="initial"
									whileTap={{ scale: 0.98 }}
									variants={cardHover}
								>
									<Link href={`/tienda/${product.id}`}>
										<motion.div
											className="relative w-full h-48"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ duration: 0.5 }}
											whileHover={{ scale: 1.05 }}
										>
											<Image
												src={imageUrl}
												alt={getProductName(product)}
												fill
												unoptimized
												className="object-cover"
											/>
										</motion.div>
									</Link>

									<motion.div
										className="p-4 bg-primary"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.2, ...transitions.smooth }}
									>
										<div className="mb-0">
											<span className="text-white text-sm font-normal">
												Liwilu
											</span>
										</div>

										<h3 className="font-normal text-lg mb-2 line-clamp-2 h-10 text-white leading-5">
											{getProductName(product)}
										</h3>

										<motion.div
											className="flex items-center gap-1 mb-0"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.3 }}
										>
											<div className="flex text-yellow-400 text-sm">
												{'★'.repeat(5)}
											</div>
										</motion.div>

										<motion.div
											className="flex items-center gap-2 mb-6"
											initial={{ opacity: 0, scale: 0.9 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.4, ...transitions.bounce }}
										>
											<span className="text-white font-bold text-xl">
												{formatPrice(product.price || 0)}
											</span>
											<span className="text-white text-sm line-through">
												{formatPrice(parseFloat((product.price || 0).toString()) * 1.5)}
											</span>
										</motion.div>

										<motion.button
											className="w-full bg-white text-primary font-semibold py-3 rounded-xl transition hover:bg-gray-100 flex items-center justify-center gap-2"
											onClick={(e) => handleAddToCart(e, product)}
											disabled={loadingCart === product.id.toString()}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											{loadingCart === product.id.toString() ? (
												<>
													<svg
														className="animate-spin h-5 w-5"
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
													<span>Agregando...</span>
												</>
											) : (
												<span>Agregar al carrito</span>
											)}
										</motion.button>
									</motion.div>
								</motion.div>
							</div>
						);
					})}
				</Slider>
			</motion.div>

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