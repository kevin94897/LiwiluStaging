'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import { useState } from 'react';
import Contacto from '@/components/Contacto';

import { useCart } from '@/context/CartContext';
import {
	getProducts,
	getCategories,
	formatPrice,
	Product,
	Category,
	getProductImageUrl,
} from '@/lib/prestashop';
import { FaRegHeart, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';

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

export default function Tienda({ products, categories, error }: TiendaProps) {
	const [openCategories, setOpenCategories] = useState<string[]>([
		'Categorías',
	]);
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [loadingCart, setLoadingCart] = useState<string | null>(null);
	const [favoritos, setFavoritos] = useState<string[]>([]);
	const productsPerPage = 9;

	const { addToCart } = useCart();

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
			alert(`✓ ${producto.name?.[0]?.value || 'Producto'} agregado al carrito`);
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

	const getCategoryName = (categoryId: string) => {
		const category = categories.find((c) => c.id === categoryId);
		return category?.name?.[0]?.value || 'Categoría';
	};

	return (
		<Layout title="Tienda - Liwilu" description="Productos al por mayor">
			{/* Banner Hero */}
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
					<div className="w-1/2">
						<span className="text-[12px] md:text-sm font-light mb-2 block ">
							NUEVO
						</span>
						<h1 className="text-2xl md:text-5xl font-bold mb-2 text-primary-light leading-tight">
							MacBook Pro de 14 pulgadas M4
						</h1>
						<p className="text-[12px] md:text-sm font-light text-secondary">
							<span>SKU: MW2U3E/A</span>
							<span className="ml-2">Barcode: 195949704796</span>
						</p>
					</div>
					<div className="w-1/2 flex items-center justify-center">
						<div className="absolute md:-bottom-10">
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
					<div className="text-white text-sm mb-6">
						<Link href="/" className="hover:underline">
							Inicio
						</Link>
						<span className="mx-2">|</span>
						<span>Tienda virtual</span>
					</div>

					<div className="flex gap-6 overflow-x-auto pb-2 max-w-5xl mx-auto">
						{categories.slice(0, 6).map((cat) => (
							<div
								key={cat.id}
								onClick={() => setSelectedCategory(cat.id)}
								className="flex flex-col items-center min-w-[100px] cursor-pointer hover:opacity-80 transition"
							>
								<div className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-lg mb-2 flex items-center justify-center">
									<span className="text-3xl">
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
								<span className="text-white text-xs text-center font-semibold">
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
					{/* Sidebar */}
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
													className="w-full text-left text-gray-500 font-bold hover:text-gray-900 transition-colors flex items-center justify-between group"
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
										Filtro próximamente
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

					{/* Grid de productos */}
					<main className="flex-1">
						<div className="bg-white rounded-sm shadow-md mb-14 overflow-hidden">
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

						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
							<h2 className="text-xl font-semibold">
								{selectedCategory === 'all'
									? `Todos los productos (${filteredProducts.length})`
									: `${getCategoryName(selectedCategory)} (${
											filteredProducts.length
									  })`}
							</h2>
							<div className="flex items-center gap-2">
								<label className="text-sm text-gray-600">Ordenar por:</label>
								<select className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
									<option>Seleccionar</option>
									<option>Precio: Menor a Mayor</option>
									<option>Precio: Mayor a Menor</option>
									<option>Más recientes</option>
									<option>Nombre A-Z</option>
								</select>
							</div>
						</div>

						{error && (
							<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
								<strong>Error:</strong> {error}
							</div>
						)}

						{currentProducts.length === 0 ? (
							<div className="text-center py-12 bg-gray-100 rounded-xl">
								<p className="text-xl text-gray-600 mb-2">
									{filteredProducts.length === 0
										? 'No hay productos en esta categoría'
										: 'No hay productos disponibles'}
								</p>
								{selectedCategory !== 'all' && (
									<button
										onClick={() => setSelectedCategory('all')}
										className="text-green-600 hover:underline mt-2"
									>
										Ver todos los productos
									</button>
								)}
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
									{currentProducts.map((product) => {
										const imageId = product.associations?.images?.[0]?.id;
										const imageUrl = imageId
											? getProductImageUrl(product.id, imageId)
											: '/no-image.png';

										return (
											<Link
												key={product.id}
												href={`/producto/${product.id}`}
												className="block"
											>
												<div className="bg-primary rounded-md shadow-md overflow-hidden hover:shadow-xl transition">
													<div className="relative">
														<button
															className="absolute top-3 left-3 bg-white rounded-full p-2 hover:bg-gray-100 z-10 shadow-md"
															onClick={(e) => toggleFavorito(e, product.id)}
														>
															<FaRegHeart
																className={`w-5 h-5 transition ${
																	favoritos.includes(product.id)
																		? 'text-red-500 fill-current'
																		: 'text-gray-400 hover:text-red-500'
																}`}
															/>
														</button>
														<div className="relative w-full h-56 bg-gray-100">
															<Image
																src={imageUrl}
																alt={product.name?.[0]?.value || 'Producto'}
																fill
																unoptimized
																className="object-cover"
															/>
														</div>
													</div>

													<div className="p-4">
														<div className="mb-0">
															<span className="text-white text-sm font-normal">
																Liwilu
															</span>
														</div>

														<h3 className="font-normal text-lg mb-2 line-clamp-2 h-10 text-white leading-5">
															{product.name?.[0]?.value ||
																'Producto sin nombre'}
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
															<span className="text-white text-sm line-through">
																{formatPrice(
																	parseFloat(product.price || '0') * 1.5
																)}
															</span>
														</div>

														<button
															className="w-full bg-white text-primary font-semibold py-2 rounded-xl transition hover:bg-gray-100 flex items-center justify-center gap-2"
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
																	<FaShoppingCart className="w-4 h-4" />
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

								{/* Paginación */}
								{totalPages > 1 && (
									<div className="flex justify-center items-center gap-2">
										<button
											onClick={() =>
												setCurrentPage((prev) => Math.max(1, prev - 1))
											}
											disabled={currentPage === 1}
											className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
														className={`px-4 py-2 rounded-lg transition ${
															currentPage === page
																? 'bg-primary text-white font-semibold'
																: 'border hover:bg-gray-100'
														}`}
													>
														{page}
													</button>
												);
											} else if (
												page === currentPage - 2 ||
												page === currentPage + 2
											) {
												return (
													<span key={page} className="px-2">
														...
													</span>
												);
											}
											return null;
										})}

										<button
											onClick={() =>
												setCurrentPage((prev) => Math.min(totalPages, prev + 1))
											}
											disabled={currentPage === totalPages}
											className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
										>
											›
										</button>
									</div>
								)}
							</>
						)}
					</main>
				</div>
			</div>

			<Contacto />
		</Layout>
	);
}
