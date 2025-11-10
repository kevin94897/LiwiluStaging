import Image from 'next/image';

export default function Beneficios() {
	const features = [
		{
			icon: (
				<Image
					src="/images/vectores/liwilu_beneficio_01.svg"
					alt="Liwilu"
					width={120}
					height={30}
					className="w-20 h-20"
					priority
				/>
			),
			text: 'Envíos a Lima Metropolitana',
		},
		{
			icon: (
				<Image
					src="/images/vectores/liwilu_beneficio_02.svg"
					alt="Liwilu"
					width={130}
					height={40}
					className="w-20 h-20"
					priority
				/>
			),
			text: 'Atención personalizada',
		},
		{
			icon: (
				<Image
					src="/images/vectores/liwilu_beneficio_03.svg"
					alt="Liwilu"
					width={150}
					height={50}
					className="w-20 h-20"
					priority
				/>
			),
			text: 'Pago seguro',
		},
		{
			icon: (
				<Image
					src="/images/vectores/liwilu_beneficio_04.svg"
					alt="Liwilu"
					width={150}
					height={40}
					className="w-20 h-20"
					priority
				/>
			),
			text: 'Ofertas exclusivas',
		},
	];

	return (
		<section className="py-12">
			<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
				{features.map((feature, index) => (
					<div key={index} className="flex flex-col items-center space-y-4">
						{feature.icon}
						<p className="text-gray-500 text-sm leading-normal max-w-[180px] font-bold uppercase h-10">
							{feature.text}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
