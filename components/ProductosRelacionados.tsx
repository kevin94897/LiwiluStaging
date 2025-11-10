import Image from 'next/image';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { Product, getProductImageUrl, formatPrice } from '@/lib/prestashop';

interface ProductProps {
	relatedProducts: Product[];
	error?: string;
}

export default function ProductosRelacionados({
	relatedProducts,
	error,
}: ProductProps) {
	// 🔹 Si no hay productos relacionados, no mostrar nada
	if (!relatedProducts || relatedProducts.length === 0) {
		return null;
	}

	return (
		<section className="max-w-7xl mx-auto px-6 py-8">
			<h2 className="text-3xl font-semibold text-center mb-8 text-primary-dark">
				Productos relacionados
			</h2>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					<strong>Error:</strong> {error}
				</div>
			)}

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
					const imageId = product.associations?.images?.[0]?.id;
					const imageUrl = imageId
						? getProductImageUrl(product.id, imageId)
						: '/no-image.png';

					return (
						<div key={product.id}>
							<div className="bg-primary rounded-md shadow-lg overflow-hidden hover:shadow-xl transition h-full">
								<Link href={`/producto/${product.id}`}>
									<div className="relative w-full h-48">
										<Image
											src={imageUrl}
											alt={product.name?.[0]?.value || 'Producto'}
											fill
											unoptimized
											className="object-cover hover:scale-105 transition-transform duration-300"
										/>
									</div>
								</Link>

								<div className="p-4">
									<div className="mb-0">
										<span className="text-white text-sm font-normal">
											Liwilu
										</span>
									</div>

									<h3 className="font-normal text-lg mb-2 line-clamp-2 h-10 text-white leading-5">
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
										<span className="text-white text-sm line-through">
											{formatPrice(parseFloat(product.price || '0') * 1.5)}
										</span>
									</div>

									<button
										className="w-full bg-white text-primary text-primary font-semibold py-2 rounded-xl transition"
										onClick={(e) => e.preventDefault()} // evita navegar al hacer clic en el botón
									>
										Agregar al carrito
									</button>
								</div>
							</div>
						</div>
					);
				})}
			</Slider>
		</section>
	);
}
