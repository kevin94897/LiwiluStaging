import Image from 'next/image';

export default function Aptitudes() {
	const features = [
		{
			icon: (
				<Image
					src="/images/vectores/liwilu_aptitud_01.svg"
					alt="Liwilu"
					width={654}
					height={499}
					className="w-32 h-32"
					priority
				/>
			),
			text: 'Más de 10 000 clientes satisfechos con nosotros',
		},
		{
			icon: (
				<Image
					src="/images/liwilu_logo.png"
					alt="Liwilu"
					width={130}
					height={40}
					className="mb-6 mx-auto md:mx-0"
					priority
				/>
			),
			text: 'Despacho rápido y entregas puntuales en todo Lima Metropolitana',
		},
		{
			icon: (
				<Image
					src="/images/liwilu_logo.png"
					alt="Liwilu"
					width={130}
					height={40}
					className="mb-6 mx-auto md:mx-0"
					priority
				/>
			),
			text: 'Catorce años de experiencia ofreciendo calidad y compromiso',
		},
		{
			icon: (
				<Image
					src="/images/liwilu_logo.png"
					alt="Liwilu"
					width={130}
					height={40}
					className="mb-6 mx-auto md:mx-0"
					priority
				/>
			),
			text: 'Comprometidos con la responsabilidad ambiental y social',
		},
	];

	return (
		<section className="bg-gray-50 py-12">
			<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
				{features.map((feature, index) => (
					<div key={index} className="flex flex-col items-center space-y-4">
						{feature.icon}
						<p className="text-gray-700 text-sm leading-relaxed max-w-[220px]">
							{feature.text}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
