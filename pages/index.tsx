import Image from 'next/image';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import Contacto from '@/components/Contacto';
import Aptitudes from '@/components/Aptitudes';
import ProductosDestacados from '@/components/ProductosDestacados';
import Beneficios from '@/components/Beneficios';
import ComoComprar from '@/components/ComoComprar';
import NuestrosProductos from '@/components/NuestrosProductos';

import { getFeaturedProducts, Product } from '@/lib/prestashop';

interface HomeProps {
	featuredProducts: Product[];
	allProducts?: Product[];
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const featuredProducts = await getFeaturedProducts();
		// Obtener más productos para la sección "Nuestros Productos"
		const { getProducts } = await import('@/lib/prestashop');
		const allProducts = await getProducts(8);

		return {
			props: {
				featuredProducts,
				allProducts,
			},
		};
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Error desconocido';
		return { props: { featuredProducts: [], allProducts: [], error: message } };
	}
};

export default function Home({
	featuredProducts,
	allProducts = [],
	error,
}: HomeProps) {
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
							<span className="text-3xl font-bold border-2 p-2 rounded-lg border-primary whitespace-nowrap leading-[65px]">
								S/ 3,500
							</span>
						</p>
					</div>
					<div className="w-full md:w-1/2 floating">
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
			<section className="max-w-7xl mx-auto px-6 pt-12">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
					{/* Columna izquierda (1 imagen grande) */}
					<div className="relative aspect-video md:aspect-square">
						<Image
							src="/images/liwilu_home_categoria_01.png"
							alt="Imagen principal"
							fill
							className="object-cover rounded-xl shadow-lg"
							priority
						/>
						<div className="absolute bottom-2 right-2 text-white text-2xl md:text-4xl px-4 py-2 rounded-tl-lg font-semibold">
							UNIFORMES
						</div>
					</div>

					{/* Columna derecha (4 imágenes pequeñas) */}
					<div className="grid grid-cols-2 grid-rows-2 gap-2 md:gap-4">
						<div className="relative h-40 md:h-auto md:aspect-square">
							<Image
								src="/images/liwilu_home_categoria_02.png"
								alt="Imagen 1"
								fill
								className="object-cover rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
							/>
							<div className="absolute bottom-1 left-1 text-white text-lg md:text-xl px-4 py-2 rounded-tl-lg font-semibold">
								LIBROS
							</div>
						</div>

						<div className="relative h-40 md:h-auto md:aspect-square">
							<Image
								src="/images/liwilu_home_categoria_03.png"
								alt="Imagen 2"
								fill
								className="object-cover rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
							/>
							<div className="absolute bottom-1 left-1 text-white text-md md:text-xl px-4 py-2 rounded-tl-lg font-semibold">
								HOGAR Y LIMPIEZA
							</div>
						</div>

						<div className="relative h-40 md:h-auto md:aspect-square">
							<Image
								src="/images/liwilu_home_categoria_04.png"
								alt="Imagen 3"
								fill
								className="object-cover rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
							/>
							<div className="absolute bottom-1 left-1 text-white text-lg md:text-xl px-4 py-2 rounded-tl-lg font-semibold">
								TECNOLOGÍA
							</div>
						</div>

						<div className="relative h-40 md:h-auto md:aspect-square">
							<Image
								src="/images/liwilu_home_categoria_05.png"
								alt="Imagen 4"
								fill
								className="object-cover rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
							/>
							<div className="absolute bottom-1 left-1 text-white text-lg md:text-xl px-4 py-2 rounded-tl-lg font-semibold">
								ÚTILES
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Productos Destacados */}
			<ProductosDestacados featuredProducts={featuredProducts} error={error} />

			{/* Beneficios */}
			<Beneficios />

			{/* Contacto */}
			<Contacto />

			{/* 🆕 Cómo Comprar */}
			<ComoComprar />

			{/* 🆕 Nuestros Productos */}
			<NuestrosProductos productos={allProducts} />

			{/* Aptitudes */}
			<Aptitudes />
		</Layout>
	);
}
