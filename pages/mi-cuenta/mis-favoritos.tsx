// pages/mi-cuenta/mis-favoritos.tsx
import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import Image from 'next/image';
import AccountSidebar from '@/components/AccountSidebar';

interface Favorito {
	id: string;
	nombre: string;
	imagen: string;
	precio: number;
	precioAnterior: number;
	marca: string;
	favorito: boolean;
	disponible: boolean;
}

export default function MisFavoritos() {
	const [favoritos, setFavoritos] = useState<Favorito[]>([
		{
			id: '1',
			nombre: 'Paño de limpieza 15×15',
			imagen: '/productos/pano-limpieza.png',
			precio: 103.92,
			precioAnterior: 150.0,
			marca: 'Liwilu',
			favorito: true,
			disponible: true,
		},
		{
			id: '2',
			nombre: 'Paño de limpieza 15×15',
			imagen: '/productos/pano-limpieza.png',
			precio: 103.92,
			precioAnterior: 150.0,
			marca: 'Liwilu',
			favorito: true,
			disponible: true,
		},
		{
			id: '3',
			nombre: 'Paño de limpieza 15×15',
			imagen: '/productos/pano-limpieza.png',
			precio: 103.92,
			precioAnterior: 150.0,
			marca: 'Liwilu',
			favorito: false,
			disponible: false,
		},
	]);

	const toggleFavorito = (id: string) => {
		setFavoritos(
			favoritos.map((fav) =>
				fav.id === id ? { ...fav, favorito: !fav.favorito } : fav
			)
		);
	};

	return (
		<Layout
			title="Mis favoritos - Liwilu"
			description="Tus productos favoritos"
		>
			<div className="bg-gray-50 min-h-screen py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-6">
						<AccountSidebar activeSection="mis-favoritos" />

						<main className="flex-1">
							<div className="bg-white rounded-2xl shadow-sm p-8">
								<h1 className="text-3xl font-bold mb-8 border-b pb-4">
									Mis favoritos
								</h1>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{favoritos.map((producto) => (
										<div
											key={producto.id}
											className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition ${
												producto.disponible ? 'bg-white' : 'bg-gray-100'
											}`}
										>
											{/* Imagen del producto */}
											<div className="relative">
												<div className="relative w-full h-64 bg-gray-50">
													<Image
														src={producto.imagen}
														alt={producto.nombre}
														fill
														className="object-cover"
														unoptimized
													/>
												</div>

												{/* Botón de favorito */}
												<button
													onClick={() => toggleFavorito(producto.id)}
													className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition"
												>
													<svg
														className={`w-6 h-6 ${
															producto.favorito
																? 'text-primary fill-current'
																: 'text-gray-400'
														}`}
														fill={producto.favorito ? 'currentColor' : 'none'}
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
														/>
													</svg>
												</button>
											</div>

											{/* Info del producto */}
											<div
												className={`p-4 ${
													producto.disponible
														? 'bg-primary text-white'
														: 'bg-gray-400 text-white'
												}`}
											>
												<p className="text-sm mb-1">{producto.marca}</p>
												<h3 className="font-semibold text-base mb-3">
													{producto.nombre}
												</h3>

												{/* Rating */}
												<div className="flex text-yellow-300 mb-3">
													{'★'.repeat(5)}
												</div>

												{/* Precio */}
												<div className="flex items-baseline gap-2 mb-4">
													<span className="text-2xl font-bold">
														s/ {producto.precio.toFixed(2)}
													</span>
													<span className="line-through text-sm opacity-75">
														s/ {producto.precioAnterior.toFixed(2)}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>

								{favoritos.length === 0 && (
									<div className="text-center py-12">
										<p className="text-gray-500 text-lg mb-4">
											No tienes productos en favoritos
										</p>
										<Link
											href="/productos"
											className="text-primary hover:text-primary-dark font-semibold"
										>
											Explorar productos →
										</Link>
									</div>
								)}

								{/* Botón volver */}
								<div className="flex justify-between mt-8 pt-6 border-t">
									<Link
										href="/mi-cuenta"
										className="text-gray-500 hover:text-gray-700 font-medium"
									>
										Volver
									</Link>
								</div>
							</div>
						</main>
					</div>
				</div>
			</div>
		</Layout>
	);
}
