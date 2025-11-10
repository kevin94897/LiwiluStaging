import Image from 'next/image';

export default function BannerCalidad() {
	return (
		<section className="relative w-full h-[200px] md:h-[250px] overflow-hidden my-6">
			{/* Imagen de fondo */}
			<Image
				src="/images/productos/liwilu_banner_publicidad.png" // 🔹 Cambia por tu ruta real
				alt="La calidad nos distingue"
				fill
				priority
				className="object-cover"
			/>
			{/* Contenido */}
			<div className="max-w-full lg:max-w-[60%] h-full mx-auto flex items-center justify-end">
				<div className="relative z-10 h-full flex items-center justify-end px-6 md:px-12">
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-right md:text-right drop-shadow-md max-w-[58%]">
						<span className="text-primary-light">La calidad nos distingue</span>
					</h2>
				</div>
			</div>
		</section>
	);
}
