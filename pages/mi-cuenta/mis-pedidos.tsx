// pages/mi-cuenta/mis-pedidos.tsx
import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import Image from 'next/image';
import AccountSidebar from '@/components/AccountSidebar';

interface Pedido {
	id: string;
	producto: {
		nombre: string;
		imagen: string;
		talla: string;
		codigo: string;
	};
	precio: number;
	precioAnterior: number;
	numeroRecibo: string;
	estado: 'en-proceso' | 'finalizado' | 'entregado';
	fechas: {
		ingresado: string;
		pendiente?: string;
		confirmado?: string;
		ruta?: string;
		entregado?: string;
	};
}

export default function MisPedidos() {
	const [pedidos] = useState<Pedido[]>([
		{
			id: '1',
			producto: {
				nombre: 'Polo Sport Saco Oliveros',
				imagen: '/images/productos/liwilu_producto_example.png',
				talla: '12',
				codigo: 'PD. 737474883',
			},
			precio: 50.0,
			precioAnterior: 80.0,
			numeroRecibo: 'PE301A17550',
			estado: 'en-proceso',
			fechas: {
				ingresado: '10/06/2025 14:22 pm',
				pendiente: '10/06/2025 14:22 pm',
			},
		},
		{
			id: '2',
			producto: {
				nombre: 'Polo Sport Saco Oliveros',
				imagen: '/images/productos/liwilu_producto_example.png',
				talla: '12',
				codigo: 'PD. 737474883',
			},
			precio: 50.0,
			precioAnterior: 80.0,
			numeroRecibo: 'PE301A17550',
			estado: 'entregado',
			fechas: {
				ingresado: '10/06/2025 14:22 pm',
				pendiente: '10/06/2025 14:22 pm',
				confirmado: '10/06/2025 14:22 pm',
				ruta: '10/06/2025 14:22 pm',
				entregado: '10/06/2025 14:22 pm',
			},
		},
	]);

	const getEstadoBadge = (estado: Pedido['estado']) => {
		const badges = {
			'en-proceso': 'bg-green-100 text-primary',
			finalizado: 'bg-gray-100 text-gray-700',
			entregado: 'bg-gray-400 text-white',
		};
		const textos = {
			'en-proceso': 'En proceso',
			finalizado: 'Finalizado',
			entregado: 'Entregado',
		};
		return { clase: badges[estado], texto: textos[estado] };
	};

	const getIconoEstado = (estado: Pedido['estado']) => {
		if (estado === 'en-proceso') {
			return (
				<div className="h-5 w-5 md:w-8 md:h-8 min-w-5 bg-primary rounded-full flex items-center justify-center">
					<svg
						className="w-3 h-3 md:w-5 md:h-5 text-white"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<circle cx="10" cy="10" r="4" />
					</svg>
				</div>
			);
		}
		return (
			<div className="h-5 w-5 md:w-8 md:h-8 min-w-5 bg-gray-400 rounded-full flex items-center justify-center">
				<svg
					className="w-3 h-3 md:w-5 md:h-5 text-white"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M5 13l4 4L19 7"
					/>
				</svg>
			</div>
		);
	};

	return (
		<Layout title="Mis pedidos - Liwilu" description="Consulta tus pedidos" background={true}>
			<div className="min-h-screen py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-6">
						<AccountSidebar activeSection="mis-pedidos" />

						<main className="flex-1">
							<div className="md:px-8 z-10 relative">
								<h1 className="text-xl md:text-4xl font-semibold mb-8 border-b pb-4">
									Mis pedidos
								</h1>

								<div className="space-y-6">
									{pedidos.map((pedido) => {
										const badge = getEstadoBadge(pedido.estado);
										return (
											<div
												key={pedido.id}
												className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition bg-white"
											>
												{/* Header del pedido */}
												<div className="px-6 py-4 flex items-center justify-between">
													<div className="flex items-center gap-4">
														{getIconoEstado(pedido.estado)}
														<div>
															<h3 className="font-semibold text-primary-dark">
																{pedido.producto.nombre}
															</h3>
															<span
																className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${badge.clase}`}
															>
																{badge.texto}
															</span>
														</div>
													</div>
													<div className="text-right">
														<p className="text-sm text-gray-600">
															Número de recibo:
														</p>
														<p className="font-semibold">
															{pedido.numeroRecibo}
														</p>
														{/* Botón seguir pedido */}
														{pedido.estado === 'en-proceso' && (
															<button className="mt-4 text-primary hover:text-primary-dark font-semibold text-sm">
																Seguir pedido →
															</button>
														)}

														{pedido.estado === 'entregado' && (
															<p className="text-neutral-gray font-semibold py-1 md:py-3">
																Finalizado
															</p>
														)}
													</div>
												</div>

												{/* Contenido del pedido */}
												<div className="p-6">
													<div className="flex md:gap-6">
														{/* Imagen del producto */}
														<div className="flex flex-col justify-between">
															<div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 hidden md:block">
																<Image
																	src={pedido.producto.imagen}
																	alt={pedido.producto.nombre}
																	fill
																	className="object-contain"
																	unoptimized
																/>
															</div>
															{/* Info adicional */}
															<div className="mt-4 text-sm text-neutral-gray hidden md:block">
																<p>Talla {pedido.producto.talla}</p>
																<p>{pedido.producto.codigo}</p>
															</div>
														</div>

														{/* Info del producto */}
														<div className="flex-1">
															<div className="flex gap-6 justify-between items-start mb-4">
																<div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 md:hidden">
																	<Image
																		src={pedido.producto.imagen}
																		alt={pedido.producto.nombre}
																		fill
																		className="object-contain"
																		unoptimized
																	/>
																</div>
																<div>
																	<h4 className="font-semibold text-lg mb-2">
																		{pedido.producto.nombre}
																	</h4>
																	<div className="flex items-baseline gap-3">
																		<span className="text-xl md:text-2xl font-semibold text-primary-dark">
																			s/{pedido.precio.toFixed(2)}
																		</span>
																		<span className="text-gray-400 line-through">
																			S/{pedido.precioAnterior.toFixed(2)}
																		</span>
																	</div>
																</div>
															</div>

															{/* Timeline de estados */}
															<div className="flex md:flex-row flex-col-reverse justify-between items-end gap-4 text-sm mt-6 text-neutral-gray">
																<div className="w-full md:basis-3/4 grid grid-cols-2 md:grid-cols-2 md:grid-rows-2 gap-4 text-sm mt-6">
																	<div>
																		<p className="font-semibold mb-1">
																			Pedido ingresado
																		</p>
																		<p className="text-xs">
																			{pedido.fechas.ingresado}
																		</p>
																	</div>
																	<div>
																		<p className="font-semibold mb-1">
																			Pendiente de armado
																		</p>
																		<p className="text-xs">
																			{pedido.fechas.pendiente || '-'}
																		</p>
																	</div>
																	<div>
																		<p className="font-semibold mb-1">
																			Pedido confirmado
																		</p>
																		<p className="text-xs">
																			{pedido.fechas.confirmado || '-'}
																		</p>
																	</div>
																	<div>
																		<p className="font-semibold mb-1">Ruta</p>
																		<p className="text-xs">
																			{pedido.fechas.ruta || '-'}
																		</p>
																	</div>
																</div>
																<div className="w-full md:basis-1/4 grid grid-cols-2 ">
																	<div className="text-sm text-neutral-gray md:hidden">
																		<p>Talla {pedido.producto.talla}</p>
																		<p>{pedido.producto.codigo}</p>
																	</div>
																	<div>
																		<p className="font-semibold mb-1">
																			Entregado
																		</p>
																		<p className="text-xs">
																			{pedido.fechas.entregado || '-'}
																		</p>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>

								{/* Botones de acción */}
								<div className="flex flex-col-reverse md:flex-row justify-between mt-8 pt-6 border-t gap-6 text-center">
									<Link
										href="/mi-cuenta"
										className="text-gray-500 hover:text-gray-700 font-medium"
									>
										Volver
									</Link>
									<button className="bg-primary hover:bg-primary-dark text-white font-semibold px-16 py-2 md:py-4 rounded-full transition">
										Guardar
									</button>
								</div>
							</div>
						</main>
					</div>
				</div>
			</div>
		</Layout>
	);
}
