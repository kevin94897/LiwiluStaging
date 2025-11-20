import { GetServerSideProps } from 'next';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Aptitudes from '@/components/Aptitudes';
import BannerPublicidad from '@/components/BannerPublicidad';
import { FaPlus, FaMinus } from 'react-icons/fa';

import ProductosRelacionados from '@/components/ProductosRelacionados';

import {
	getProduct,
	getProductImageUrl,
	formatPrice,
	Product,
	getRelatedProducts,
} from '@/lib/prestashop';

interface ProductDetailProps {
	product: Product | null;
	error?: string;
	relatedProducts?: Product[];
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	try {
		const id = params?.id as string;
		const product = await getProduct(id);

		// ✅ Obtener productos relacionados
		let relatedProducts: Product[] = [];
		if (product?.associations?.categories?.length) {
			// 🔹 Extraer solo los IDs como strings
			const categoryIds = product.associations.categories.map((cat) => cat.id);
			console.log('📦 Categorías del producto:', categoryIds);

			// 🔹 Pasar el ID de la categoría principal (id_category_default)
			const mainCategoryId = product.id_category_default;
			console.log('🎯 Categoría principal:', mainCategoryId);

			relatedProducts = await getRelatedProducts(
				mainCategoryId || categoryIds[0], // Usar categoría principal o la primera
				product.id, // Excluir el producto actual
				4
			);

			console.log(
				'✅ Productos relacionados encontrados:',
				relatedProducts.length
			);
		}

		return {
			props: {
				product: product || null,
				relatedProducts,
			},
		};
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Error desconocido';
		return {
			props: {
				product: null,
				error: message,
				relatedProducts: [],
			},
		};
	}
};

export default function ProductDetail({
	product,
	error,
	relatedProducts = [],
}: ProductDetailProps) {
	// All hooks must be called at the top level, before any conditional returns
	const [quantity, setQuantity] = useState(1);
	const [selectedColor, setSelectedColor] = useState<string | null>(null);
	const [selectedSize, setSelectedSize] = useState<string | null>(null);

	// Define tab keys type
	type TabKey = 'Descripción del producto' | 'Especificaciones' | 'Guía de tallas';
	const [activeTab, setActiveTab] = useState<TabKey>('Descripción del producto');

	if (error || !product) {
		return (
			<Layout title="Error - Liwilu" description="Producto no encontrado">
				<div className="max-w-7xl mx-auto px-6 py-12">
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
						<strong>Error:</strong> {error || 'Producto no encontrado'}
					</div>
					<Link
						href="/productos"
						className="text-primary hover:underline mt-4 inline-block"
					>
						Volver a la tienda
					</Link>
				</div>
			</Layout>
		);
	}

	// Fallback colors and sizes (Product type doesn't include these properties)
	const colors = [
		{ name: 'Ploma', hex: 'gray' },
		{ name: 'Blanco', hex: 'white' },
		{ name: 'Negro', hex: '#000000' },
	];
	const sizes = ['S', 'M', 'L', 'XL'];

	const handleIncrease = () => setQuantity((q) => q + 1);
	const handleDecrease = () => setQuantity((q) => Math.max(1, q - 1));

	const tabs = {
		'Descripción del producto': (
			<div
				className="prose prose-sm max-w-none text-gray-600"
				dangerouslySetInnerHTML={{
					__html:
						product.description?.[0]?.value || 'Sin descripción disponible.',
				}}
			/>
		),
		Especificaciones: (
			<div className="overflow-x-auto">
				<table className="min-w-full border border-gray-200 rounded-lg">
					<tbody className="divide-y divide-gray-200">
						<tr>
							<td className="px-4 py-2 font-medium text-gray-700 w-1/3 bg-gray-50">
								Marca:
							</td>
							<td className="px-4 py-2 text-gray-600">**********</td>
						</tr>
						<tr>
							<td className="px-4 py-2 font-medium text-gray-700 bg-gray-50">
								SKU:
							</td>
							<td className="px-4 py-2 text-gray-600">**********</td>
						</tr>
						<tr>
							<td className="px-4 py-2 font-medium text-gray-700 bg-gray-50">
								Tipo:
							</td>
							<td className="px-4 py-2 text-gray-600">**********</td>
						</tr>
						<tr>
							<td className="px-4 py-2 font-medium text-gray-700 bg-gray-50">
								Diseño:
							</td>
							<td className="px-4 py-2 text-gray-600">**********</td>
						</tr>
						<tr>
							<td className="px-4 py-2 font-medium text-gray-700 bg-gray-50">
								Condición del producto:
							</td>
							<td className="px-4 py-2 text-gray-600">**********</td>
						</tr>
						<tr>
							<td className="px-4 py-2 font-medium text-gray-700 bg-gray-50">
								Fit:
							</td>
							<td className="px-4 py-2 text-gray-600">**********</td>
						</tr>
					</tbody>
				</table>
			</div>
		),
		'Guía de tallas': (
			<div className="overflow-x-auto">
				<h3 className="text-lg font-semibold text-gray-800 mb-4">
					Guía de Tallas (cm)
				</h3>
				<table className="min-w-full border border-gray-200 rounded-lg text-sm">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-2 text-left font-semibold text-gray-700">
								Talla
							</th>
							<th className="px-4 py-2 text-left font-semibold text-gray-700">
								Pecho
							</th>
							<th className="px-4 py-2 text-left font-semibold text-gray-700">
								Cintura
							</th>
							<th className="px-4 py-2 text-left font-semibold text-gray-700">
								Largo
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200 text-gray-700">
						<tr>
							<td className="px-4 py-2 font-medium">S</td>
							<td className="px-4 py-2">90 - 94</td>
							<td className="px-4 py-2">74 - 78</td>
							<td className="px-4 py-2">64</td>
						</tr>
						<tr>
							<td className="px-4 py-2 font-medium">M</td>
							<td className="px-4 py-2">95 - 99</td>
							<td className="px-4 py-2">79 - 83</td>
							<td className="px-4 py-2">66</td>
						</tr>
						<tr>
							<td className="px-4 py-2 font-medium">L</td>
							<td className="px-4 py-2">100 - 106</td>
							<td className="px-4 py-2">84 - 90</td>
							<td className="px-4 py-2">68</td>
						</tr>
						<tr>
							<td className="px-4 py-2 font-medium">XL</td>
							<td className="px-4 py-2">107 - 113</td>
							<td className="px-4 py-2">91 - 97</td>
							<td className="px-4 py-2">70</td>
						</tr>
					</tbody>
				</table>
				<p className="text-gray-500 text-xs mt-3">
					📏 Las medidas pueden variar ±2 cm según el modelo y el tejido.
				</p>
			</div>
		),
	};

	const mainImage = product.associations?.images?.[0]?.id
		? getProductImageUrl(product.id, product.associations.images[0].id)
		: '/no-image.png';

	return (
		<Layout
			title={`${product.name?.[0]?.value || 'Producto'} - Liwilu`}
			description={product.description?.[0]?.value || 'Detalle del producto'}
		>
			<div className="absolute md:right-[-15vw] md:top-80 w-auto md:w-auto z-0 pointer-events-none md:block hidden">
				<Image
					src="/images/vectores/liwilu_banner_productos_vector_04.png"
					alt="MacBook Pro"
					width={408}
					height={427}
					quality={100}
					className="h-auto"
					priority
				/>
			</div>

			<div className="absolute -left-56 md:-left-40 bottom-10 md:bottom-1/3 w-auto md:w-auto z-0 pointer-events-none">
				<Image
					src="/images/vectores/liwilu_banner_productos_vector_05.png"
					alt="MacBook Pro"
					width={408}
					height={427}
					quality={100}
					className="h-auto"
					priority
				/>
			</div>

			{/* Breadcrumb */}
			<div className="mt-20">
				<div className="max-w-7xl mx-auto px-6 xl:px-0 py-4">
					<div className="text-neutral-gray text-md font-semibold">
						<Link href="/" className="hover:underline">
							Inicio
						</Link>
						<span className="mx-2">/</span>
						<Link href="/productos" className="hover:underline">
							Tienda virtual
						</Link>
						<span className="mx-2">/</span>
						<span className="text-primary-dark font-medium">
							{product.name?.[0]?.value}
						</span>
					</div>
				</div>
			</div>

			{/* Contenido principal */}
			<div className="px-6 py-2 md:py-8 relative overflow-hidden">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col lg:flex-row gap-8">
						{/* Columna izquierda - Imágenes */}
						<div className="w-full lg:w-2/3 flex flex-col lg:flex-row gap-6">
							{/* Imagen principal */}
							<div className="flex-1 order-1 lg:order-2">
								<div className="relative aspect-square bg-white rounded-sm shadow-md overflow-hidden">
									<Image
										src={mainImage}
										alt={product.name?.[0]?.value || 'Producto'}
										fill
										className="object-cover"
										priority
										unoptimized
									/>
								</div>
							</div>

							{/* Miniaturas */}
							{product.associations?.images &&
								product.associations.images.length > 1 && (
									<div className="grid grid-rows-4 gap-4">
										{product.associations.images.map((image) => (
											<div
												key={image.id}
												className="relative aspect-square bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
											>
												<Image
													src={getProductImageUrl(product.id, image.id)}
													alt={`${product.name?.[0]?.value} - imagen ${image.id}`}
													fill
													className="object-contain"
													unoptimized
												/>
											</div>
										))}
									</div>
								)}
						</div>

						{/* Columna derecha - Información */}
						<div className="w-full lg:w-1/3">
							<div className="md:p-6">
								{/* Badge Nuevo */}
								<div className="flex items-center gap-2 mb-4">
									<span className="bg-[#D3D3D3] text-greendark-500 px-3 py-1 rounded-full text-xs font-bold">
										NUEVO
									</span>
								</div>

								{/* Título y marca */}
								<h1 className="text-2xl md:text-4xl font-bold mb-2 text-primary-dark">
									{product.name?.[0]?.value}
								</h1>

								{/* Rating */}
								<div className="flex items-center gap-5">
									<div className="flex items-center gap-2">
										<div className="flex text-yellow-400">{'★'.repeat(5)}</div>
										<span className="text-sm text-gray-600">(4.8/5)</span>
									</div>
									<span className="text-gray-600 text-sm">
										SKU: {product.reference || 'N/A'}
									</span>
								</div>

								{/* Precio */}
								<div className="flex items-center gap-4 mb-6 mt-4">
									<span className="text-4xl font-bold text-primary-dark">
										{formatPrice(product.price || '0')}
									</span>
									<span className="text-lg text-[#D3D3D3] line-through font-bold">
										{formatPrice(parseFloat(product.price || '0') * 1.5)}
									</span>
								</div>

								{/* Opciones de personalización */}
								<div className="flex gap-10 mb-6">
									<div>
										<label className="block text-gray-700 font-medium mb-5">
											Color:
										</label>
										<div className="flex items-center gap-3">
											{colors.map((color) => (
												<button
													key={color.name}
													title={color.name}
													onClick={() => setSelectedColor(color.name)}
													className={`w-5 h-5 rounded-full border-2 transition ${selectedColor === color.name
														? 'border-[#D3D3D3] border-4 scale-110'
														: 'border-gray-300 hover:scale-105'
														}`}
													style={{ backgroundColor: color.hex }}
												/>
											))}
										</div>
										{/* {selectedColor && (
										<p className="text-sm text-gray-500 mt-1">
											Seleccionado:{' '}
											<span className="font-medium">{selectedColor}</span>
										</p>
									)} */}
									</div>

									{/* Cantidad */}
									<div className="gap-4">
										<label className="text-gray-700 font-medium pb-2 block">
											Cantidad:
										</label>
										<div className="flex items-center border border-primary rounded-sm overflow-hidden">
											<button
												className="px-2 py-2 hover:bg-gray-100 transition text-lg"
												onClick={handleDecrease}
											>
												<FaMinus className="w-3 h-3 text-primary transition" />
											</button>
											<span className="px-4 py-2 font-bold">{quantity}</span>
											<button
												className="px-2 py-2 hover:bg-gray-100 transition"
												onClick={handleIncrease}
											>
												<FaPlus className="w-3 h-3 text-primary transition" />
											</button>
										</div>
										<span className="text-sm text-gray-500 hidden">
											{product.quantity || 0} disponibles
										</span>
									</div>
								</div>

								{/* Talla */}
								<div className="space-y-2 mb-6">
									<label className="block text-gray-700 font-medium mb-1">
										Talla:
									</label>

									<div className="flex flex-wrap gap-3">
										{sizes.map((size) => (
											<button
												key={size}
												onClick={() => setSelectedSize(size)}
												className={`px-5 py-0 border rounded-lg font-medium transition 
              ${selectedSize === size
														? 'bg-primary-dark text-white border-gray-900'
														: 'border-gray-300 text-gray-700 hover:bg-gray-100 py-1'
													}`}
											>
												{size}
											</button>
										))}
									</div>

									{/* {selectedSize && (
									<p className="text-sm text-gray-500">
										Seleccionaste:{' '}
										<span className="font-semibold">{selectedSize}</span>
									</p>
								)} */}
								</div>

								{/* Botones de acción */}
								<div className="flex gap-2 md:gap-4">
									<button className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-5 px-6 rounded-full transition flex items-center justify-center gap-2 h-full">
										Agregar al carrito
									</button>
									<button className="bg-white hover:bg-gray-50 border-2 border-primary text-primary font-semibold w-[56px] h-[56px] rounded-full transition flex items-center justify-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-6 w-6"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
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
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 py-4">
				{/* Descripción */}
				{/* Cabecera de pestañas */}
				<div className="flex border-b border-gray-200 overflow-x-auto overflow-y-hidden">
					{Object.keys(tabs).map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab as TabKey)}

							className={`px-5 py-2 -mb-[1px] font-medium border-b-2 transition-all h-15 min-w-[180px] ${activeTab === tab
								? 'border-gray-900 text-primary-dark'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
						>
							{tab}
						</button>
					))}
				</div>

				{/* Contenido de pestañas */}
				<div className="mt-4">{tabs[activeTab]}</div>
			</div>

			{/* 🔹 Sección de productos relacionados */}
			<ProductosRelacionados
				relatedProducts={relatedProducts}
				error={undefined}
			/>

			{/* 🔹 Sección de comentarios */}
			<BannerPublicidad />

			{/* 🔹 Sección de aptitudes */}
			<Aptitudes />
		</Layout >
	);
}
