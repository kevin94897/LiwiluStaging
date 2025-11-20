'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import Contacto from '@/components/Contacto';
import AddToCartModal from '@/components/AddToCartModal';

import { useCart } from '@/context/CartContext';
import {
	getProducts,
	getCategories,
	formatPrice,
	Product,
	Category,
	getProductImageUrl,
} from '@/lib/prestashop';
import { FaRegHeart, FaPlus, FaMinus } from 'react-icons/fa';

interface TiendaProps {
	products: Product[];
	categories: Category[];
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const [products, categories] = await Promise.all([
			getProducts(50),
			getCategories(),
		]);

		return {
			props: {
				products,
				categories,
			},
		};
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Error desconocido';
		return {
			props: {
				products: [],
				categories: [],
				error: message,
			},
		};
	}
};

export default function Tienda({ products, categories }: TiendaProps) {
	const [openCategories, setOpenCategories] = useState<string[]>([
		'Categorías',
	]);
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [loadingCart, setLoadingCart] = useState<string | null>(null);
	const [favoritos, setFavoritos] = useState<string[]>([]);
	const [modalProduct, setModalProduct] = useState<Product | null>(null);
	const [isVisible, setIsVisible] = useState(false);
	const productsPerPage = 9;

	const { addToCart } = useCart();

	// Animación de entrada
	useEffect(() => {
		setIsVisible(true);
	}, []);

	const toggleCategory = (category: string) => {
		setOpenCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};

	const toggleFavorito = (e: React.MouseEvent, productId: string) => {
		e.preventDefault();
		e.stopPropagation();

		setFavoritos((prev) =>
			prev.includes(productId)
				? prev.filter((id) => id !== productId)
				: [...prev, productId]
		);

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
			setModalProduct(producto);
		} catch (error) {
			console.error('Error al agregar al carrito:', error);
			alert('Error al agregar el producto al carrito');
		} finally {
			setLoadingCart(null);
		}
	};

	const filteredProducts =
		selectedCategory === 'all'
			? products
			: products.filter((p) => p.id_category_default === selectedCategory);

	const indexOfLastProduct = currentPage * productsPerPage;
	const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
	const currentProducts = filteredProducts.slice(
		indexOfFirstProduct,
		indexOfLastProduct
	);
	const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

	// const getCategoryName = (categoryId: string) => {
	// 	const category = categories.find((c) => c.id === categoryId);
	// 	return category?.name?.[0]?.value || 'Categoría';
	// };

	return (
		<Layout title="Tienda - Liwilu" description="Productos al por mayor">
			{/* Banner Hero con animación */}
			<section className="relative text-white overflow-hidden">
				<div className="absolute inset-0">
					<Image
						src="/images/productos/liwilu_banner_productos.png"
						alt="Banner Productos"
						fill
						className="object-cover"
						priority
					/>
				</div>

				<div className="relative max-w-4xl mx-auto px-6 py-6 md:py-8 flex items-center justify-between relative">
					<div className="absolute -right-10 md:-right-20 -top-10 md:-top-28 w-32 md:w-56 floating">
						<Image
							src="/images/vectores/liwilu_banner_productos_vector_02.png"
							alt="MacBook Pro"
							width={295}
							height={218}
							quality={100}
							className="h-auto"
							priority
						/>
					</div>
					<div
						className={`w-1/2 transition-all duration-1000 transform ${isVisible
							? 'opacity-100 translate-x-0'
							: 'opacity-0 -translate-x-10'
							}`}
					>
						<span className="text-[12px] md:text-sm font-light mb-2 block animate-fade-in">
							NUEVO
						</span>
						<h1 className="text-2xl md:text-5xl font-bold mb-2 text-primary-light leading-tight animate-slide-up">
							MacBook Pro de 14 pulgadas M4
						</h1>
						<p className="text-[12px] md:text-sm font-light text-secondary animate-fade-in-delay">
							<span>SKU: MW2U3E/A</span>
							<span className="ml-2">Barcode: 195949704796</span>
						</p>
					</div>
					<div className="w-1/2 flex items-center justify-center">
						<div
							className={`absolute md:-bottom-10 floating-slow transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
								}`}
						>
							<Image
								src="/images/productos/liwilu_productos_laptop_img.png"
								alt="MacBook Pro"
								width={305}
								height={246}
								quality={100}
								className="h-auto md:block hidden"
								priority
							/>
							<Image
								src="/images/productos/liwilu_productos_laptop_img_mob.png"
								alt="MacBook Pro"
								width={148}
								height={121}
								quality={100}
								className="h-auto md:hidden"
								priority
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Breadcrumb y categorías circulares */}
			<section className="py-6 relative overflow-hidden bg-gradient-to-r from-primary to-primary">
				<div className="absolute -left-10 md:-left-60 -bottom-18 md:-bottom-80 w-32 md:w-full z-0 pointer-events-none">
					<Image
						src="/images/vectores/liwilu_banner_productos_vector_03.png"
						alt="MacBook Pro"
						width={654}
						height={499}
						quality={100}
						className="h-auto"
						priority
					/>
				</div>

				<div className="max-w-7xl mx-auto px-6">
					<div className="text-white text-sm mb-3 animate-fade-in">
						<Link href="/" className="hover:underline">
							Inicio
						</Link>
						<span className="mx-2">|</span>
						<span>Tienda virtual</span>
					</div>

					<div className="flex gap-6 overflow-x-auto pb-2 max-w-5xl mx-auto md:justify-center overflow-y-hidden">
						{categories.slice(0, 6).map((cat, index) => (
							<div
								key={cat.id}
								onClick={() => setSelectedCategory(cat.id)}
								className={`flex flex-col items-center min-w-[100px] cursor-pointer transition-all duration-300 hover:scale-110 animate-fade-in-up`}
								style={{ animationDelay: `${index * 100}ms` }}
							>
								<div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden bg-white shadow-lg mb-2 flex items-center justify-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
									<span className="text-2xl md:text-6xl transition-transform duration-300 hover:scale-110">
										{cat.name?.[0]?.value.includes('Libro')
											? '📚'
											: cat.name?.[0]?.value.includes('Hogar') ||
												cat.name?.[0]?.value.includes('Limpieza')
												? '🧹'
												: cat.name?.[0]?.value.includes('Uniforme')
													? '👕'
													: cat.name?.[0]?.value.includes('Útil')
														? '✏️'
														: cat.name?.[0]?.value.includes('Tecnolog')
															? '💻'
															: '🏷️'}
									</span>
								</div>
								<span className="text-white text-md text-center font-semibold">
									{cat.name?.[0]?.value || 'Categoría'}
								</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Contenido principal */}
			<div className="max-w-7xl mx-auto px-6 py-8">
				<div className="flex flex-col md:flex-row gap-20">
					{/* Sidebar con animación */}
					<aside className="w-full md:w-64 flex-shrink-0 font-sans md:block hidden">
						<div className="bg-white rounded-2xl shadow-lg p-5">
							<div className="mb-4">
								<button
									onClick={() => toggleCategory('Categorías')}
									className="w-full flex justify-between items-center font-bold text-sm text-gray-800 pb-5 border-b border-gray-200"
								>
									<span>Categorías</span>
									<span className="text-2xl font-light text-gray-600">
										{openCategories.includes('Categorías') ? (
											<FaMinus className="w-3 h-3 text-primary-dark transition" />
										) : (
											<FaPlus className="w-3 h-3 text-primary-dark transition" />
										)}
									</span>
								</button>
								{openCategories.includes('Categorías') && (
									<ul className="space-y-3 my-5">
										{[
											{ id: '1', name: 'Laptops' },
											{ id: '2', name: 'Monitores' },
											{ id: '3', name: 'Accesorios' },
											{ id: '4', name: 'Sillas' },
											{ id: '5', name: 'Periféricos' },
										].map((cat) => (
											<li key={cat.id}>
												<button
													onClick={() => {
														setSelectedCategory(cat.id);
														setCurrentPage(1);
													}}
													className="w-full text-left text-gray-500 font-bold hover:text-primary-dark transition-colors flex items-center justify-between group"
												>
													<span className="text-sm">{cat.name}</span>
													<FaPlus className="w-3 h-3 text-primary-dark transition" />
												</button>
											</li>
										))}
									</ul>
								)}
							</div>

							<div className="mb-4 pb-5 border-b border-gray-200">
								<button
									onClick={() => toggleCategory('Tallas')}
									className="w-full flex justify-between items-center font-bold text-sm text-gray-800"
								>
									<span>Tallas</span>
									<span className="text-2xl font-light text-gray-600">
										{openCategories.includes('Tallas') ? (
											<FaMinus className="w-3 h-3 text-primary-dark transition" />
										) : (
											<FaPlus className="w-3 h-3 text-primary-dark transition" />
										)}
									</span>
								</button>
								{openCategories.includes('Tallas') && (
									<div className="mt-3 text-sm text-gray-500">
										<ul className="space-y-3 my-5">
											{[
												{ id: '1', name: 'Large' },
												{ id: '2', name: 'Medium' },
												{ id: '3', name: 'Small' },
												{ id: '4', name: 'XS' },
												{ id: '5', name: 'XXS' },
											].map((cat) => (
												<li key={cat.id}>
													<button
														onClick={() => {
															setSelectedCategory(cat.id);
															setCurrentPage(1);
														}}
														className="w-full text-left text-gray-500 font-bold hover:text-primary-dark transition-colors flex items-center justify-between group"
													>
														<span className="text-sm">{cat.name}</span>
														<FaPlus className="w-3 h-3 text-primary-dark transition" />
													</button>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>

							<div className="mb-4 pb-5 border-b border-gray-200">
								<button
									onClick={() => toggleCategory('Material')}
									className="w-full flex justify-between items-center font-bold text-sm text-gray-800"
								>
									<span>Material</span>
									<span className="text-2xl font-light text-gray-600">
										{openCategories.includes('Material') ? (
											<FaMinus className="w-3 h-3 text-primary-dark transition" />
										) : (
											<FaPlus className="w-3 h-3 text-primary-dark transition" />
										)}
									</span>
								</button>
								{openCategories.includes('Material') && (
									<div className="mt-3 text-sm text-gray-500">
										Filtro próximamente
									</div>
								)}
							</div>

							<div className="mb-0">
								<button
									onClick={() => toggleCategory('Marca')}
									className="w-full flex justify-between items-center font-bold text-sm text-gray-800"
								>
									<span>Marca</span>
									<span className="text-2xl font-light text-gray-600">
										{openCategories.includes('Marca') ? (
											<FaMinus className="w-3 h-3 text-primary-dark transition" />
										) : (
											<FaPlus className="w-3 h-3 text-primary-dark transition" />
										)}
									</span>
								</button>
								{openCategories.includes('Marca') && (
									<div className="mt-3 text-sm text-gray-500">
										Filtro próximamente
									</div>
								)}
							</div>
						</div>

						<div className="hidden md:block mt-6 bg-white rounded-lg shadow-md overflow-hidden">
							<div className="relative h-64">
								<Image
									src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop"
									alt="Banner"
									fill
									className="object-cover"
								/>
								<div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
									Nuevo
								</div>
							</div>
						</div>
					</aside>

					{/* Grid de productos con animaciones */}
					<main className="flex-1">
						<div
							className={`bg-white rounded-sm shadow-md mb-14 overflow-hidden transition-all duration-700 transform hover:shadow-xl ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
								}`}
						>
							<div className="relative h-32 md:h-40">
								<Image
									src="/images/productos/liwilu_banner_productos_grid.png"
									alt="Banner productos"
									fill
									className="object-cover [object-position:50%_20%] md:[object-position:50%_80%]"
									priority
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
							{currentProducts.map((product, index) => {
								const imageId = product.associations?.images?.[0]?.id;
								const imageUrl = imageId
									? getProductImageUrl(product.id, imageId)
									: '/no-image.png';

								return (
									<Link
										key={product.id}
										href={`/tienda/${product.id}`}
										className="block animate-fade-in-up"
										style={{ animationDelay: `${index * 100}ms` }}
									>
										<div className="bg-primary rounded-md shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform group">
											<div className="relative overflow-hidden">
												<button
													className="absolute top-3 left-3 bg-white rounded-full p-2 hover:bg-gray-100 z-10 shadow-md transition-all duration-300 hover:scale-110"
													onClick={(e) => toggleFavorito(e, product.id)}
												>
													<FaRegHeart
														className={`w-5 h-5 transition-all duration-300 ${favoritos.includes(product.id)
															? 'text-red-500 fill-current scale-110'
															: 'text-gray-400 hover:text-red-500'
															}`}
													/>
												</button>
												<div className="relative w-full h-56 bg-gray-100 overflow-hidden">
													<Image
														src={imageUrl}
														alt={product.name?.[0]?.value || 'Producto'}
														fill
														unoptimized
														className="object-cover transition-transform duration-500 group-hover:scale-105"
													/>
												</div>
											</div>

											<div className="p-4">
												<div className="mb-0">
													<span className="text-white text-sm font-normal">
														Liwilu
													</span>
												</div>

												<h3 className="font-normal text-lg mb-2 line-clamp-2 h-10 text-white leading-5 transition-colors group-hover:text-gray-100">
													{product.name?.[0]?.value || 'Producto sin nombre'}
												</h3>

												<div className="flex items-center gap-1 mb-0">
													<div className="flex text-yellow-400 text-sm">
														{'★'.repeat(5)}
													</div>
												</div>

												<div className="flex items-center gap-2 mb-6">
													<span className="text-white font-bold text-xl">
														{formatPrice(product.price || '0')}
													</span>
													<span className="text-white text-sm line-Categorías">
														{formatPrice(parseFloat(product.price || '0') * 1.5)}
													</span>
												</div>

												<button
													className="w-full bg-white text-primary font-semibold py-3 rounded-xl transition-all duration-300 hover:bg-gray-100 hover:shadow-lg flex items-center justify-center gap-2 transform hover:scale-105"
													onClick={(e) => handleAddToCart(e, product)}
													disabled={loadingCart === product.id}
												>
													{loadingCart === product.id ? (
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
														<>
															{/* <FaShoppingCart className="w-4 h-4 transition-transform group-hover:scale-110" /> */}
															<span>Agregar al carrito</span>
														</>
													)}
												</button>
											</div>
										</div>
									</Link>
								);
							})}
						</div>

						{/* Paginación con animación */}
						{totalPages > 1 && (
							<div className="flex justify-center items-center gap-2 animate-fade-in">
								<button
									onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
									disabled={currentPage === 1}
									className="px-4 py-2 border rounded-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
								>
									‹
								</button>

								{[...Array(totalPages)].map((_, i) => {
									const page = i + 1;
									if (
										page === 1 ||
										page === totalPages ||
										(page >= currentPage - 1 && page <= currentPage + 1)
									) {
										return (
											<button
												key={page}
												onClick={() => setCurrentPage(page)}
												className={`px-4 py-2 rounded-sm transition-all duration-300 transform hover:scale-110 ${currentPage === page
													? 'bg-primary text-white font-semibold shadow-lg'
													: 'border hover:bg-gray-100'
													}`}
											>
												{page}
											</button>
										);
									}
									return null;
								})}

								<button
									onClick={() =>
										setCurrentPage((prev) => Math.min(totalPages, prev + 1))
									}
									disabled={currentPage === totalPages}
									className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
								>
									›
								</button>
							</div>
						)}
					</main>
				</div>
			</div>

			<Contacto />

			{modalProduct && (
				<AddToCartModal
					isOpen={!!modalProduct}
					onClose={() => setModalProduct(null)}
					product={modalProduct}
				/>
			)}

			<style jsx global>{`
				@keyframes fade-in {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}

				@keyframes fade-in-up {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes slide-up {
					from {
						opacity: 0;
						transform: translateY(30px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.animate-fade-in {
					animation: fade-in 0.6s ease-out forwards;
				}

				.animate-fade-in-delay {
					animation: fade-in 0.8s ease-out 0.3s forwards;
					opacity: 0;
				}

				.animate-fade-in-up {
					animation: fade-in-up 0.6s ease-out forwards;
					opacity: 0;
				}

				.animate-slide-up {
					animation: slide-up 0.8s ease-out forwards;
				}

				.floating {
					animation: floating 3s ease-in-out infinite;
				}

				.floating-slow {
					animation: floating 4s ease-in-out infinite;
				}

				@keyframes floating {
					0%,
					100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-10px);
					}
				}
			`}</style>
		</Layout>
	);
}