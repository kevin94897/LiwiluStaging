import Image from 'next/image';

export default function Aptitudes() {
	const features = [
		{
			icon: (
				<Image
					src="/images/vectores/liwilu_aptitud_01.svg"
					alt="Liwilu"
					width={120}
					height={30}
					className="w-32 h-32"
					priority
				/>
			),
			text: 'Más de 10 000 clientes satisfechos con nosotros',
		},
		{
			icon: (
				<Image
					src="/images/vectores/liwilu_aptitud_02.svg"
					alt="Liwilu"
					width={130}
					height={40}
					className="mx-auto md:mx-0"
					priority
				/>
			),
			text: 'Despacho rápido y entregas puntuales en todo Lima Metropolitana',
		},
		{
			icon: (
				<Image
					src="/images/vectores/liwilu_aptitud_03.svg"
					alt="Liwilu"
					width={150}
					height={50}
					className="mx-auto md:mx-0"
					priority
				/>
			),
			text: 'Catorce años de experiencia ofreciendo calidad y compromiso',
		},
		{
			icon: (
				<Image
					src="/images/vectores/liwilu_aptitud_04.svg"
					alt="Liwilu"
					width={150}
					height={40}
					className="mx-auto md:mx-0"
					priority
				/>
			),
			text: 'Comprometidos con la responsabilidad ambiental y social',
		},
	];

	return (
		<section className="bg-gray-50 py-12">
			<h2 className="text-2xl md:text-4xl font-semibold text-center mb-8 text-primary-dark">
				Tu confianza, nuestro compromiso
			</h2>
			<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
				{features.map((feature, index) => (
					<div key={index} className="flex flex-col items-center space-y-4">
						{feature.icon}
						<p className="text-gray-500 text-sm max-w-[180px] font-bold">
							{feature.text}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
