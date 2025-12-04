import Image from 'next/image';
import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion } from 'framer-motion';

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

// Variantes de animación
const fadeInUp = {
	hidden: { opacity: 0, y: 60 },
	visible: {
		opacity: 1,
		y: 0
	}
};

const fadeIn = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1
	}
};

const slideInLeft = {
	hidden: { opacity: 0, x: -100 },
	visible: {
		opacity: 1,
		x: 0
	}
};

const slideInRight = {
	hidden: { opacity: 0, x: 100 },
	visible: {
		opacity: 1,
		x: 0
	}
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
			delayChildren: 0.3
		}
	}
};

const scaleIn = {
	hidden: { opacity: 0, scale: 0.8 },
	visible: {
		opacity: 1,
		scale: 1
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
				<motion.div
					className="absolute inset-0"
					initial={{ scale: 1.1 }}
					animate={{ scale: 1 }}
					transition={{ duration: 1.2, ease: 'easeOut' }}
				>
					<Image
						src="/images/liwilu_home_banner_bg.png"
						alt="Hero background"
						fill
						className="object-cover"
						priority
					/>
				</motion.div>

				<motion.div
					className="absolute -right-10 md:-right-20 bottom-28 md:top-10 w-32 md:w-auto floating"
					initial={{ opacity: 0, x: 100 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, delay: 0.5 }}
				>
					<Image
						src="/images/vectores/liwilu_banner_productos_vector.png"
						alt="MacBook Pro"
						width={295}
						height={218}
						quality={100}
						className="h-auto"
						priority
					/>
				</motion.div>

				<div className="relative max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 flex items-center justify-between md:flex-row flex-col">
					<motion.div
						className="w-full md:w-1/2"
						variants={slideInLeft}
						initial="hidden"
						animate="visible"
					>
						<motion.span
							className="text-[12px] md:text-sm font-light mb-2 block"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3, duration: 0.5 }}
						>
							NUEVO
						</motion.span>

						<motion.h1
							className="md:text-5xl text-2xl font-bold mb-4 text-primary-light"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.6 }}
						>
							Macbook PRO <br /> de 14 pulgadas M4
						</motion.h1>

						<motion.p
							className="text-[12px] md:text-sm font-light text-secondary"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5, duration: 0.5 }}
						>
							<span>SKU: MW2U3E/A</span>
							<span className="ml-2">Barcode: 195949704796</span>
						</motion.p>

						<motion.p
							className="text-xl my-6"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.6, duration: 0.5 }}
						>
							Compra desde:{' '}
							<span className="text-3xl font-bold border-2 p-2 rounded-lg border-primary whitespace-nowrap leading-[65px]">
								S/ 3,500
							</span>
						</motion.p>
					</motion.div>

					<motion.div
						className="w-full md:w-1/2 floating"
						variants={slideInRight}
						initial="hidden"
						animate="visible"
						transition={{ duration: 0.7, ease: 'easeOut' }}
					>
						<Image
							src="/images/liwilu_home_laptop_img.png"
							alt="Laptop"
							width={692}
							height={509}
							className="w-full h-auto"
						/>
					</motion.div>
				</div>
			</section>

			{/* Categorías */}
			<motion.section
				className="max-w-7xl mx-auto px-6 pt-12"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				variants={staggerContainer}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
					{/* Columna izquierda (1 imagen grande) */}
					<motion.div
						className="relative aspect-video md:aspect-square"
						variants={scaleIn}
						whileHover={{ scale: 1.02 }}
						transition={{ duration: 0.5, ease: 'easeOut' }}
					>
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
					</motion.div>

					{/* Columna derecha (4 imágenes pequeñas) */}
					<motion.div
						className="grid grid-cols-2 grid-rows-2 gap-2 md:gap-4"
						variants={staggerContainer}
					>
						<motion.div
							className="relative h-40 md:h-auto md:aspect-square"
							variants={scaleIn}
							whileHover={{ scale: 1.05 }}
						>
							<Image
								src="/images/liwilu_home_categoria_02.png"
								alt="Imagen 1"
								fill
								className="object-cover rounded-xl shadow-md"
							/>
							<div className="absolute bottom-1 left-1 text-white text-lg md:text-xl px-4 py-2 rounded-tl-lg font-semibold">
								LIBROS
							</div>
						</motion.div>

						<motion.div
							className="relative h-40 md:h-auto md:aspect-square"
							variants={scaleIn}
							whileHover={{ scale: 1.05 }}
							transition={{ duration: 0.3 }}
						>
							<Image
								src="/images/liwilu_home_categoria_03.png"
								alt="Imagen 2"
								fill
								className="object-cover rounded-xl shadow-md"
							/>
							<div className="absolute bottom-1 left-1 text-white text-md md:text-xl px-4 py-2 rounded-tl-lg font-semibold">
								HOGAR Y LIMPIEZA
							</div>
						</motion.div>

						<motion.div
							className="relative h-40 md:h-auto md:aspect-square"
							variants={scaleIn}
							whileHover={{ scale: 1.05 }}
							transition={{ duration: 0.3 }}
						>
							<Image
								src="/images/liwilu_home_categoria_04.png"
								alt="Imagen 3"
								fill
								className="object-cover rounded-xl shadow-md"
							/>
							<div className="absolute bottom-1 left-1 text-white text-lg md:text-xl px-4 py-2 rounded-tl-lg font-semibold">
								TECNOLOGÍA
							</div>
						</motion.div>

						<motion.div
							className="relative h-40 md:h-auto md:aspect-square"
							variants={scaleIn}
							whileHover={{ scale: 1.05 }}
							transition={{ duration: 0.3 }}
						>
							<Image
								src="/images/liwilu_home_categoria_05.png"
								alt="Imagen 4"
								fill
								className="object-cover rounded-xl shadow-md"
							/>
							<div className="absolute bottom-1 left-1 text-white text-lg md:text-xl px-4 py-2 rounded-tl-lg font-semibold">
								ÚTILES
							</div>
						</motion.div>
					</motion.div>
				</div>
			</motion.section>

			{/* Productos Destacados */}
			<motion.div
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				variants={fadeInUp}
				transition={{ duration: 0.6, ease: 'easeOut' }}
			>
				<ProductosDestacados featuredProducts={featuredProducts} error={error} />
			</motion.div>

			{/* Beneficios */}
			<motion.div
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				variants={fadeInUp}
				transition={{ duration: 0.6, ease: 'easeOut' }}
			>
				<Beneficios />
			</motion.div>

			{/* Contacto */}
			<motion.div
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				variants={fadeIn}
				transition={{ duration: 0.8 }}
			>
				<Contacto />
			</motion.div>

			{/* Cómo Comprar */}
			<motion.div
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				variants={fadeInUp}
				transition={{ duration: 0.6, ease: 'easeOut' }}
			>
				<ComoComprar />
			</motion.div>

			{/* Nuestros Productos */}
			<motion.div
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				variants={fadeInUp}
				transition={{ duration: 0.6, ease: 'easeOut' }}
			>
				<NuestrosProductos productos={allProducts} />
			</motion.div>

			{/* Aptitudes */}
			<motion.div
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				variants={fadeInUp}
				transition={{ duration: 0.6, ease: 'easeOut' }}
			>
				<Aptitudes />
			</motion.div>
		</Layout>
	);
}