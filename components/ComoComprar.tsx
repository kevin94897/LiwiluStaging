"use client";

import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export default function ComoComprar() {
	const [emblaRef] = useEmblaCarousel(
		{
			loop: true,
			align: 'start',
			skipSnaps: false,
			dragFree: false,
			containScroll: 'trimSnaps'
		},
		[Autoplay({ delay: 3000, stopOnInteraction: false })]
	);

	const options = [
		{
			image: "/images/liwilu_home_elige_01.png",
			alt: "Delivery - Compra online con entrega a domicilio",
			title: "DELIVERY",
			description: "Compra online con entrega a domicilio",
		},
		{
			image: "/images/liwilu_home_elige_02.png",
			alt: "Entrega en tienda - compra online y recoge en tienda",
			title: "ENTREGA EN TIENDA",
			description: "compra online y recoge en tienda",
		},
		{
			image: "/images/liwilu_home_elige_03.png",
			alt: "Call Center - Llámanos al (01) 7028086",
			title: "CALL CENTER",
			description: "Llámanos al (01) 7028086 / Opción 2",
		},
	];

	return (
		<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
			<h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-6 sm:mb-8 md:mb-12 text-primary-dark px-4">
				Elige cómo comprar
			</h2>

			<div className="overflow-hidden" ref={emblaRef}>
				<div className="flex touch-pan-y touch-pinch-zoom -ml-3 sm:-ml-4 md:-ml-6">
					{options.map((option, index) => (
						<div
							key={index}
							className="flex-[0_0_85%] min-w-0 pl-3 sm:flex-[0_0_50%] sm:pl-4 md:flex-[0_0_33.33%] md:pl-6"
						>
							<div className="flex flex-col items-center h-full">
								{/* Imagen */}
								<div className="relative w-full aspect-[5/6] mb-4 sm:mb-5 md:mb-6 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
									<Image
										src={option.image}
										alt={option.alt}
										fill
										className="object-cover"
										sizes="(max-width: 640px) 85vw, (max-width: 768px) 50vw, 33vw"
										priority={index === 0}
										loading={index === 0 ? "eager" : "lazy"}
									/>
								</div>

								{/* Contenido */}
								<div className="flex flex-col items-center text-center px-2">
									<h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-neutral-gray mb-2 sm:mb-3 leading-tight">
										{option.title}
									</h3>
									<p className="text-sm sm:text-base text-neutral-gray font-semibold leading-relaxed max-w-[280px]">
										{option.description}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* CSS personalizado */}
			<style jsx>{`
				.embla {
					overflow: hidden;
				}
				.embla__container {
					display: flex;
				}
				.embla__slide {
					position: relative;
					min-width: 0;
				}
			`}</style>
		</section>
	);
}