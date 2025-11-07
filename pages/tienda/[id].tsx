import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import {
	getProduct,
	getProductImageUrl,
	formatPrice,
	Product,
} from '@/lib/prestashop';

interface ProductDetailProps {
	product: Product | null;
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	try {
		const id = params?.id as string;
		const product = await getProduct(id);

		return {
			props: {
				product: product || null,
			},
		};
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Error desconocido';
		return {
			props: {
				product: null,
				error: message,
			},
		};
	}
};

export default function ProductDetail({ product, error }: ProductDetailProps) {
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

	const mainImage = product.associations?.images?.[0]?.id
		? getProductImageUrl(product.id, product.associations.images[0].id)
		: '/no-image.png';

	return (
		<Layout
			title={`${product.name?.[0]?.value || 'Producto'} - Liwilu`}
			description={product.description?.[0]?.value || 'Detalle del producto'}
		>
			{/* Breadcrumb */}
			<div className="bg-gradient-to-r from-primary to-primary-light">
				<div className="max-w-7xl mx-auto px-6 py-4">
					<div className="text-white text-sm">
						<Link href="/" className="hover:underline">
							Inicio
						</Link>
						<span className="mx-2">/</span>
						<Link href="/productos" className="hover:underline">
							Tienda virtual
						</Link>
						<span className="mx-2">/</span>
						<span className="text-primary-light font-medium">
							{product.name?.[0]?.value}
						</span>
					</div>
				</div>
			</div>

			{/* Contenido principal */}
			<div className="max-w-7xl mx-auto px-6 py-8">
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Columna izquierda - Imágenes */}
					<div className="w-full lg:w-1/2">
						<div className="bg-white rounded-xl shadow-lg overflow-hidden">
							<div className="relative aspect-square">
								<Image
									src={mainImage}
									alt={product.name?.[0]?.value || 'Producto'}
									fill
									className="object-contain"
									priority
									unoptimized
								/>
							</div>
						</div>

						{/* Miniaturas */}
						{product.associations?.images &&
							product.associations.images.length > 1 && (
								<div className="grid grid-cols-4 gap-4 mt-4">
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
					<div className="w-full lg:w-1/2">
						<div className="bg-white rounded-xl shadow-lg p-6">
							{/* Badge Nuevo */}
							<div className="flex items-center gap-2 mb-4">
								<span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
									Nuevo
								</span>
								<span className="text-secondary text-sm">
									SKU: {product.reference || 'N/A'}
								</span>
							</div>

							{/* Título y marca */}
							<h1 className="text-2xl md:text-4xl font-bold mb-2">
								{product.name?.[0]?.value}
							</h1>
							<p className="text-primary text-sm font-semibold mb-4">Liwilu</p>

							{/* Rating */}
							<div className="flex items-center gap-2 mb-6">
								<div className="flex text-yellow-400">{'★'.repeat(5)}</div>
								<span className="text-sm text-gray-600">(4.8/5)</span>
							</div>

							{/* Precio */}
							<div className="flex items-baseline gap-4 mb-6">
								<span className="text-4xl font-bold text-primary">
									{formatPrice(product.price || '0')}
								</span>
								<span className="text-lg text-gray-400 line-through">
									{formatPrice(parseFloat(product.price || '0') * 1.5)}
								</span>
							</div>

							{/* Cantidad */}
							<div className="flex items-center gap-4 mb-6">
								<label className="text-gray-700 font-medium">Cantidad:</label>
								<div className="flex items-center border border-gray-300 rounded-lg">
									<button className="px-4 py-2 hover:bg-gray-100 transition">
										-
									</button>
									<span className="px-4 py-2 border-x">1</span>
									<button className="px-4 py-2 hover:bg-gray-100 transition">
										+
									</button>
								</div>
								<span className="text-sm text-gray-500">
									{product.quantity || 0} disponibles
								</span>
							</div>

							{/* Botones de acción */}
							<div className="flex gap-4">
								<button className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2">
									Agregar al carrito
								</button>
								<button className="bg-white hover:bg-gray-50 border-2 border-primary text-primary font-semibold p-3 rounded-lg transition">
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

						{/* Descripción */}
						{product.description?.[0]?.value && (
							<div className="bg-white rounded-xl shadow-lg p-6 mt-6">
								<h2 className="text-lg font-bold mb-4">
									Descripción del producto
								</h2>
								<div
									className="prose prose-sm max-w-none text-gray-600"
									dangerouslySetInnerHTML={{
										__html: product.description[0].value,
									}}
								/>
							</div>
						)}

						{/* Características adicionales */}
						<div className="bg-white rounded-xl shadow-lg p-6 mt-6">
							<h2 className="text-lg font-bold mb-4">
								Características del producto
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="p-4 bg-gray-50 rounded-lg">
									<span className="text-sm text-gray-600">Marca</span>
									<p className="font-semibold">Liwilu</p>
								</div>
								<div className="p-4 bg-gray-50 rounded-lg">
									<span className="text-sm text-gray-600">Referencia</span>
									<p className="font-semibold">{product.reference || 'N/A'}</p>
								</div>
								<div className="p-4 bg-gray-50 rounded-lg">
									<span className="text-sm text-gray-600">Stock</span>
									<p className="font-semibold">
										{product.quantity || 0} unidades
									</p>
								</div>
								<div className="p-4 bg-gray-50 rounded-lg">
									<span className="text-sm text-gray-600">ID</span>
									<p className="font-semibold">{product.id}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
