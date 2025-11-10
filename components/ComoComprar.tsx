// components/ComoComprar.tsx
import Image from 'next/image';

export default function ComoComprar() {
	return (
		<section className="max-w-7xl mx-auto px-6 py-16">
			<h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
				Elige cómo comprar
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{/* DELIVERY */}
				<div className="flex flex-col items-center">
					<div className="relative w-full aspect-[4/3] mb-6 rounded-2xl overflow-hidden shadow-lg">
						<Image
							src="/images/como-comprar/delivery.jpg"
							alt="Delivery - Compra online con entrega a domicilio"
							fill
							className="object-cover"
						/>
					</div>
					<h3 className="text-2xl font-bold text-gray-700 mb-3">DELIVERY</h3>
					<p className="text-gray-600 text-center">
						Compra online con entrega a domicilio
					</p>
				</div>

				{/* ENTREGA EN TIENDA */}
				<div className="flex flex-col items-center">
					<div className="relative w-full aspect-[4/3] mb-6 rounded-2xl overflow-hidden shadow-lg">
						<Image
							src="/images/como-comprar/entrega-tienda.jpg"
							alt="Entrega en tienda - compra online y recoge en tienda"
							fill
							className="object-cover"
						/>
					</div>
					<h3 className="text-2xl font-bold text-gray-700 mb-3">
						ENTREGA ENTIENDA
					</h3>
					<p className="text-gray-600 text-center">
						compra online y recoge en tienda
					</p>
				</div>

				{/* CALL CENTER */}
				<div className="flex flex-col items-center">
					<div className="relative w-full aspect-[4/3] mb-6 rounded-2xl overflow-hidden shadow-lg">
						<Image
							src="/images/como-comprar/call-center.jpg"
							alt="Call Center - Llámanos al (01) 7028086"
							fill
							className="object-cover"
						/>
					</div>
					<h3 className="text-2xl font-bold text-gray-700 mb-3">CALL CENTER</h3>
					<p className="text-gray-600 text-center">
						Llámanos al (01) 7028086 / Opción 2
					</p>
				</div>
			</div>
		</section>
	);
}
