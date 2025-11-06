import Image from 'next/image';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import { useState } from 'react';
import {
	getProducts,
	getCategories,
	formatPrice,
	Product,
	Category,
	getProductImageUrl,
} from '@/lib/prestashop';
import { FaHeart, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface TiendaProps {
	products: Product[];
	categories: Category[];
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const [products, categories] = await Promise.all([
			getProducts(50), // Obtener más productos
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
	const productsPerPage = 9;

	const toggleCategory = (category: string) => {
		setOpenCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
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
				<div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-teal-500">
					<div className="absolute inset-0 opacity-20">
						<div className="absolute top-10 right-20 w-64 h-64 bg-white/10 rounded-full"></div>
						<div className="absolute bottom-10 right-40 w-32 h-32 bg-white/10 rounded-full"></div>
					</div>
				</div>
				<div className="relative max-w-7xl mx-auto px-6 py-12 flex items-center justify-between">
					<div className="w-1/2">
						<span className="text-sm font-semibold mb-2 block">NUEVO</span>
						<h1 className="text-4xl md:text-5xl font-bold mb-2">MacBook Pro</h1>
						<p className="text-2xl md:text-3xl mb-6">de 14 pulgadas M4</p>
					</div>
					<div className="w-1/2 relative h-48">
						<Image
							src="/images/liwilu_home_laptop_img.png"
							alt="MacBook Pro"
							fill
							className="object-contain"
						/>
					</div>
				</div>
			</section>

			{/* Breadcrumb y categorías circulares */}
			<section className="bg-gradient-to-r from-green-500 to-green-400 py-6">
				<div className="max-w-7xl mx-auto px-6">
					{/* Breadcrumb */}
					<div className="text-white text-sm mb-6">
						<Link href="/" className="hover:underline">
							Tienda virtual
						</Link>
						<span className="mx-2">/</span>
						<Link href="/" className="hover:underline">
							Inicio
						</Link>
						<span className="mx-2">|</span>
						<span>Tienda virtual</span>
					</div>

					{/* Categorías circulares - usando categorías de PrestaShop */}
					<div className="flex gap-6 overflow-x-auto pb-2">
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
				<div className="flex flex-col md:flex-row gap-6">
					{/* Sidebar */}
					<aside className="w-full md:w-64 flex-shrink-0">
						<div className="bg-white rounded-lg shadow-md p-4">
							{/* Categorías */}
							<div className="mb-6">
								<button
									onClick={() => toggleCategory('Categorías')}
									className="w-full flex justify-between items-center font-bold text-lg mb-3"
								>
									<span>Categorías</span>
									{openCategories.includes('Categorías') ? (
										<FaChevronUp />
									) : (
										<FaChevronDown />
									)}
								</button>
								{openCategories.includes('Categorías') && (
									<ul className="space-y-2">
										<li>
											<button
												onClick={() => {
													setSelectedCategory('all');
													setCurrentPage(1);
												}}
												className={`w-full text-left py-2 px-3 rounded hover:bg-gray-100 ${
													selectedCategory === 'all'
														? 'bg-green-100 text-green-700 font-semibold'
														: ''
												}`}
											>
												Todos ({products.length})
											</button>
										</li>
										{categories.map((cat) => {
											const productCount = products.filter(
												(p) => p.id_category_default === cat.id
											).length;
											if (productCount === 0) return null;

											return (
												<li key={cat.id}>
													<button
														onClick={() => {
															setSelectedCategory(cat.id);
															setCurrentPage(1);
														}}
														className={`w-full text-left py-2 px-3 rounded hover:bg-gray-100 flex items-center justify-between ${
															selectedCategory === cat.id
																? 'bg-green-100 text-green-700 font-semibold'
																: ''
														}`}
													>
														<span className="text-sm">
															{cat.name?.[0]?.value || 'Categoría'}
														</span>
														<span className="text-xs text-gray-500">
															({productCount})
														</span>
													</button>
												</li>
											);
										})}
									</ul>
								)}
							</div>

							{/* Tallas */}
							<div className="mb-6 pb-6 border-b">
								<button
									onClick={() => toggleCategory('Tallas')}
									className="w-full flex justify-between items-center font-bold mb-3"
								>
									<span>Tallas</span>
									{openCategories.includes('Tallas') ? (
										<FaChevronUp />
									) : (
										<FaChevronDown />
									)}
								</button>
								{openCategories.includes('Tallas') && (
									<div className="text-sm text-gray-500">
										Filtro próximamente
									</div>
								)}
							</div>

							{/* Material */}
							<div className="mb-6 pb-6 border-b">
								<button
									onClick={() => toggleCategory('Material')}
									className="w-full flex justify-between items-center font-bold mb-3"
								>
									<span>Material</span>
									{openCategories.includes('Material') ? (
										<FaChevronUp />
									) : (
										<FaChevronDown />
									)}
								</button>
								{openCategories.includes('Material') && (
									<div className="text-sm text-gray-500">
										Filtro próximamente
									</div>
								)}
							</div>

							{/* Marca */}
							<div>
								<button
									onClick={() => toggleCategory('Marca')}
									className="w-full flex justify-between items-center font-bold mb-3"
								>
									<span>Marca</span>
									{openCategories.includes('Marca') ? (
										<FaChevronUp />
									) : (
										<FaChevronDown />
									)}
								</button>
								{openCategories.includes('Marca') && (
									<div className="text-sm text-gray-500">
										Filtro próximamente
									</div>
								)}
							</div>
						</div>

						{/* Banner lateral - Solo visible en desktop */}
						<div className="hidden md:block mt-6 bg-white rounded-lg shadow-md overflow-hidden">
							<div className="relative h-64">
								<Image
									src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop"
									alt="Banner"
									fill
									className="object-cover"
								/>
								<div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
									Nuevo
								</div>
							</div>
						</div>
					</aside>

					{/* Grid de productos */}
					<main className="flex-1">
						{/* Banner destacado */}
						<div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
							<div className="relative h-64 md:h-80">
								<Image
									src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=400&fit=crop"
									alt="Banner productos"
									fill
									className="object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center px-8">
									<div className="text-white">
										<h2 className="text-3xl font-bold mb-2">
											Productos de calidad
										</h2>
										<p className="text-lg">Al mejor precio del mercado</p>
									</div>
								</div>
							</div>
						</div>

						{/* Ordenar por y filtros */}
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

						{/* Grid de productos */}
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
											<div
												key={product.id}
												className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
											>
												<div className="relative">
													<span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
														Liwilu
													</span>
													<button className="absolute top-3 right-3 bg-white rounded-full p-2 hover:bg-gray-100 z-10 shadow-md">
														<FaHeart className="w-5 h-5 text-gray-400 hover:text-red-500 transition" />
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
													<div className="mb-2">
														<span className="text-green-600 text-xs font-semibold">
															Liwilu
														</span>
													</div>
													<h3 className="font-semibold text-sm mb-2 line-clamp-2 h-10">
														{product.name?.[0]?.value || 'Producto sin nombre'}
													</h3>
													<div className="flex items-center gap-1 mb-3">
														<div className="flex text-yellow-400 text-sm">
															{'★'.repeat(5)}
														</div>
													</div>
													<div className="flex items-center gap-2 mb-3">
														<span className="text-green-600 font-bold text-xl">
															{formatPrice(product.price || '0')}
														</span>
														<span className="text-gray-400 text-sm line-through">
															{formatPrice(
																parseFloat(product.price || '0') * 1.5
															)}
														</span>
													</div>
													<button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition">
														Agregar al carrito
													</button>
												</div>
											</div>
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
																? 'bg-green-500 text-white font-semibold'
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
		</Layout>
	);
}
