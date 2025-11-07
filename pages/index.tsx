import Image from 'next/image';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import Contacto from '@/components/Contacto';
import Aptitudes from '@/components/Aptitudes';

import {
	getFeaturedProducts,
	formatPrice,
	Product,
	getProductImageUrl,
} from '@/lib/prestashop';
import { FaHeart } from 'react-icons/fa';
// import { getPosts } from '@/lib/wordpress';

interface HomeProps {
	featuredProducts: Product[];
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const featuredProducts = await getFeaturedProducts();
		return { props: { featuredProducts } };
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Error desconocido';
		return { props: { featuredProducts: [], error: message } };
	}
};

export default function Home({ featuredProducts, error }: HomeProps) {
	return (
		<Layout
			title="Liwilu - Compra por MAYOR"
			description="Liwilu - Tienda por mayor"
		>
			{/* Hero Section */}
			<section className="relative text-white overflow-hidden">
				<div className="absolute inset-0">
					<Image
						src="/images/liwilu_home_banner_bg.png"
						alt="Hero background"
						fill
						className="object-cover"
						priority
					/>
				</div>
				<div className="absolute -right-10 md:-right-20 bottom-28 md:top-10 w-32 md:w-auto floating">
					<Image
						src="/images/vectores/liwilu_banner_productos_vector.png"
						alt="MacBook Pro"
						width={295}
						height={218}
						quality={100}
						className="h-auto"
						priority
					/>
				</div>
				<div className="relative max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 flex items-center justify-between md:flex-row flex-col">
					<div className="w-full md:w-1/2">
						<span className="text-[12px] md:text-sm font-light mb-2 block ">
							NUEVO
						</span>
						<h1 className="md:text-5xl text-2xl font-bold mb-4 text-primary-light">
							Macbook PRO <br /> de 14 pulgadas M4
						</h1>
						<p className="text-[12px] md:text-sm font-light text-secondary">
							<span>SKU: MW2U3E/A</span>
							<span className="ml-2">Barcode: 195949704796</span>
						</p>
						<p className="text-xl my-6">
							Compra desde:{' '}
							<span className="text-3xl font-bold border-2 p-2 rounded-lg border-primary-light whitespace-nowrap leading-[65px]">
								S/ 3,500
							</span>
						</p>
						{/* <button className="btn btn-primary">Comprar ahora</button> */}
					</div>
					<div className="w-full md:w-1/2">
						<Image
							src="/images/liwilu_home_laptop_img.png"
							alt="Laptop"
							width={692}
							height={509}
							className="w-full h-auto"
						/>
					</div>
				</div>
			</section>

			{/* Categorías */}
			<section className="max-w-7xl mx-auto px-6 py-12">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{[
						{
							name: 'UNIFORMES',
							img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&h=200&fit=crop',
						},
						{
							name: 'LIBROS',
							img: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=200&fit=crop',
						},
						{
							name: 'HOGAR Y LIMPIEZA',
							img: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300&h=200&fit=crop',
						},
						{
							name: 'TECNOLOGÍA',
							img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop',
						},
					].map((cat, i) => (
						<Link href={`/productos?categoria=${cat.name}`} key={i}>
							<div className="relative rounded-xl overflow-hidden h-32 cursor-pointer hover:scale-105 transition">
								<Image
									src={cat.img}
									alt={cat.name}
									fill
									className="object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
									<h3 className="text-white font-bold text-lg">{cat.name}</h3>
								</div>
							</div>
						</Link>
					))}
				</div>
			</section>

			{/* Productos Destacados */}
			<section className="max-w-7xl mx-auto px-6 py-12">
				<h2 className="text-3xl font-bold text-center mb-8">
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
						<Link href="/api/test-prestashop" target="_blank">
							<button className="bg-blue-500 text-white px-6 py-2 rounded-lg">
								🔍 Probar Conexión API
							</button>
						</Link>
					</div>
				) : (
					<>
						<Slider
							arrows={true}
							infinite={true}
							speed={500}
							slidesToShow={4}
							slidesToScroll={1}
							autoplay={true}
							autoplaySpeed={3000}
							responsive={[
								{
									breakpoint: 1024,
									settings: {
										slidesToShow: 3,
										slidesToScroll: 1,
									},
								},
								{
									breakpoint: 768,
									settings: {
										slidesToShow: 2,
										slidesToScroll: 1,
									},
								},
								{
									breakpoint: 480,
									settings: {
										slidesToShow: 1,
										slidesToScroll: 1,
									},
								},
							]}
							className="product-slider px-4"
						>
							{featuredProducts.map((product) => {
								const imageId = product.associations?.images?.[0]?.id; // primera imagen
								const imageUrl = imageId
									? getProductImageUrl(product.id, imageId)
									: '/no-image.png';

								return (
									<div
										key={product.id}
										className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
									>
										<div className="relative">
											<span className="absolute top-2 left-2 bg-primary-light text-white px-3 py-1 rounded-full text-xs font-bold z-10">
												OFERTA
											</span>
											<div className="relative w-full h-48">
												<Image
													src={imageUrl}
													alt={product.name?.[0]?.value || 'Producto'}
													fill
													unoptimized // 🔹 Importante: evita problemas con dominios externos
													className="object-cover"
												/>
											</div>
											<button className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 z-10">
												<FaHeart className="w-5 h-5 hover:text-red-400 transition" />
											</button>
										</div>

										<div className="p-4 flex flex-col justify-between h-44">
											<h3 className="font-semibold text-sm mb-2 line-clamp-2 h-10">
												{product.name?.[0]?.value || 'Producto sin nombre'}
											</h3>
											<div className="flex justify-between items-center">
												<span className="text-gray-500 text-sm line-through">
													{formatPrice(parseFloat(product.price || '0') * 1.2)}
												</span>
												<span className="text-green-600 font-bold text-lg">
													{formatPrice(product.price || '0')}
												</span>
											</div>
											<button className="w-full btn btn-primary flex items-center justify-center gap-2">
												<span>+</span>
												<span>Agregar</span>
											</button>
										</div>
									</div>
								);
							})}
						</Slider>

						<div className="text-center mt-8">
							{/* <p className="text-sm text-gray-600 mb-2">
                  ✅ Mostrando {featuredProducts.length} productos desde PrestaShop
                </p> */}
							<Link href="/productos">
								<button className="btn btn-secondary">
									Ver todos los productos →
								</button>
							</Link>
						</div>
					</>
				)}
			</section>

			<Contacto />

			<Aptitudes />
		</Layout>
	);
}
