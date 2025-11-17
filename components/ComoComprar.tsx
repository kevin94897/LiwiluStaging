// components/ComoComprar.tsx
import Image from 'next/image';
import Slider from 'react-slick';

export default function ComoComprar() {
	return (
		<section className="max-w-7xl mx-auto px-6 py-10 md:py-16">
			<h2 className="text-2xl md:text-4xl font-semibold text-center mb-5 md:mb-12 text-primary-dark">
				Elige cómo comprar
			</h2>

			<div className="text-center gap-8">
				<Slider
					arrows={false}
					infinite={false}
					speed={500}
					slidesToShow={3}
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
								centerMode: true,
								centerPadding: '40px',
							},
						},
					]}
					className="product-slider"
				>
					{/* DELIVERY */}
					<div className="flex flex-col items-center">
						<div className="relative w-full aspect-[5/6] mb-6 rounded-2xl overflow-hidden shadow-lg">
							<Image
								src="/images/liwilu_home_elige_01.png"
								alt="Delivery - Compra online con entrega a domicilio"
								fill
								className="object-cover"
							/>
						</div>
						<h3 className="text-xl md:text-2xl font-semibold text-neutral-gray mb-3 leading-6">
							DELIVERY
						</h3>
						<p className="text-neutral-gray text-center font-semibold">
							Compra online con entrega a domicilio
						</p>
					</div>

					{/* ENTREGA EN TIENDA */}
					<div className="flex flex-col items-center">
						<div className="relative w-full aspect-[5/6] mb-6 rounded-2xl overflow-hidden shadow-lg">
							<Image
								src="/images/liwilu_home_elige_02.png"
								alt="Entrega en tienda - compra online y recoge en tienda"
								fill
								className="object-cover"
							/>
						</div>
						<h3 className="text-xl md:text-2xl font-semibold text-neutral-gray mb-3 leading-6">
							ENTREGA EN TIENDA
						</h3>
						<p className="text-neutral-gray text-center font-semibold">
							compra online y recoge en tienda
						</p>
					</div>

					{/* CALL CENTER */}
					<div className="flex flex-col items-center">
						<div className="relative w-full aspect-[5/6] mb-6 rounded-2xl overflow-hidden shadow-lg">
							<Image
								src="/images/liwilu_home_elige_03.png"
								alt="Call Center - Llámanos al (01) 7028086"
								fill
								className="object-cover"
							/>
						</div>
						<h3 className="text-xl md:text-2xl font-semibold text-neutral-gray mb-3 leading-6">
							CALL CENTER
						</h3>
						<p className="text-neutral-gray text-center font-semibold">
							Llámanos al (01) 7028086 / Opción 2
						</p>
					</div>
				</Slider>
			</div>
		</section>
	);
}
