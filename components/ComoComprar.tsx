"use client";

import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface ComoComprarProps {
  items?: Array<{ video?: string; titulo?: string; descripcion?: string }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
function resolveUrl(url?: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function ComoComprar({ items }: ComoComprarProps) {
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

	const options = items
		? items.map((item) => ({
				image: resolveUrl(item.video),
				alt: item.titulo || '',
				title: item.titulo || '',
				description: item.descripcion || '',
		  })).filter((o) => o.image || o.title)
		: [];

	if (options.length === 0) return null;

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
									{option.image?.endsWith(".webm") ? (
										<video
											src={option.image}
											autoPlay
											muted
											loop
											playsInline
											className="absolute inset-0 w-full h-full object-cover"
										/>
									) : (
										<Image
											src={option.image}
											alt={option.alt}
											fill
											className="object-cover"
											sizes="(max-width: 640px) 85vw, (max-width: 768px) 50vw, 33vw"
											priority={index === 0}
											loading={index === 0 ? "eager" : "lazy"}
										/>
									)}
								</div>

								{/* Contenido */}
								<div className="flex flex-col items-center text-center px-2">
									<h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-neutral-gray mb-2 sm:mb-3 leading-tight">
										{option.title}
									</h3>
									<div
										className="richtext-content text-sm sm:text-base text-neutral-gray font-semibold leading-relaxed max-w-[300px]"
										dangerouslySetInnerHTML={{ __html: option.description }}
									/>
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