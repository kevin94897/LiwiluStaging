// pages/mi-cuenta/mis-datos.tsx
import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import AccountSidebar from '@/components/AccountSidebar';
import Image from 'next/image';

export default function MisDatos() {
	const [formData, setFormData] = useState({
		nombre: 'Gonzalo',
		apellido: 'Vera',
		tipoDocumento: 'DNI',
		numeroDocumento: '74218601',
		celular: '973 820 088',
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Guardando datos:', formData);
		// Aquí iría la lógica para guardar los datos
	};

	return (
		<Layout
			title="Mis datos - Liwilu"
			description="Edita tu información personal"
		>
			<div className="min-h-screen py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-6">
						<div className="absolute -right-60 md:-right-32 top-30 md:top-12 w-auto md:w-auto z-0 pointer-events-none hidden lg:block">
							<Image
								src="/images/vectores/liwilu_banner_productos_vector_04.png"
								alt="MacBook Pro"
								width={408}
								height={427}
								quality={100}
								className="h-auto"
								priority
							/>
						</div>
						{/* Sidebar */}
						<AccountSidebar activeSection="mis-datos" />

						{/* Main Content */}
						<main className="flex-1">
							<div className="md:px-8 z-10 relative">
								<h1 className="text-xl md:text-4xl font-semibold mb-8 border-b pb-4">
									Información de mi cuenta
								</h1>

								{/* Mis datos */}
								<section>
									<div className="flex items-center gap-3 mb-6">
										<div className="w-8 h-8 md:w-10 md:h-10 bg-primary-dark rounded-full flex items-center justify-center">
											<svg
												className="h-5 w-5 md:w-6 md:h-6 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
												/>
											</svg>
										</div>
										<h2 className="text-xl md:text-2xl font-semibold">
											Mis datos
										</h2>
									</div>

									<form onSubmit={handleSubmit} className="space-y-6">
										{/* Nombre y Apellido */}
										<div className="grid md:grid-cols-2 gap-6">
											<div>
												<label
													htmlFor="nombre"
													className="block text-sm font-semibold text-gray-900 mb-2"
												>
													Nombre
												</label>
												<input
													type="text"
													id="nombre"
													name="nombre"
													value={formData.nombre}
													onChange={handleChange}
													className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition"
													required
												/>
											</div>

											<div>
												<label
													htmlFor="apellido"
													className="block text-sm font-semibold text-gray-900 mb-2"
												>
													Apellido
												</label>
												<input
													type="text"
													id="apellido"
													name="apellido"
													value={formData.apellido}
													onChange={handleChange}
													className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition"
													required
												/>
											</div>
										</div>

										{/* Tipo de documento y Número */}
										<div className="grid md:grid-cols-2 gap-6">
											<div>
												<label
													htmlFor="tipoDocumento"
													className="block text-sm font-semibold text-gray-900 mb-2"
												>
													Tipo de documento
												</label>
												<select
													id="tipoDocumento"
													name="tipoDocumento"
													value={formData.tipoDocumento}
													onChange={handleChange}
													className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition appearance-none bg-white"
													required
												>
													<option value="DNI">DNI</option>
													<option value="CE">Carnet de Extranjería</option>
													<option value="Pasaporte">Pasaporte</option>
												</select>
											</div>

											<div>
												<label
													htmlFor="numeroDocumento"
													className="block text-sm font-semibold text-gray-900 mb-2"
												>
													Número de Documento
												</label>
												<input
													type="text"
													id="numeroDocumento"
													name="numeroDocumento"
													value={formData.numeroDocumento}
													onChange={handleChange}
													className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition"
													required
												/>
											</div>
										</div>

										{/* Celular */}
										<div>
											<label
												htmlFor="celular"
												className="block text-sm font-semibold text-gray-900 mb-2"
											>
												Celular
											</label>
											<input
												type="tel"
												id="celular"
												name="celular"
												value={formData.celular}
												onChange={handleChange}
												className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition"
												required
											/>
										</div>

										{/* Botones de acción */}
										<div className="flex flex-col-reverse md:flex-row justify-between mt-8 pt-6 border-t gap-6 text-center">
											<Link
												href="/mi-cuenta"
												className="text-gray-500 hover:text-gray-700 font-medium"
											>
												Volver
											</Link>
											<button
												type="submit"
												className="bg-primary hover:bg-primary-dark text-white font-semibold px-16 py-2 md:py-4 rounded-full transition"
											>
												Guardar
											</button>
										</div>
									</form>
								</section>
							</div>
						</main>
					</div>
				</div>
			</div>
		</Layout>
	);
}
