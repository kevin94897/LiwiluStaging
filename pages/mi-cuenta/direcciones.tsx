// pages/mi-cuenta/direcciones.tsx
import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import AccountSidebar from '@/components/AccountSidebar';
import Image from 'next/image';

interface Direccion {
	id: string;
	tipo: 'entrega' | 'facturacion';
	titulo: string;
	direccion: string;
	referencia: string;
	ciudad: string;
	provincia: string;
	distrito: string;
	codigoPostal: string;
	telefono: string;
	esPrincipal: boolean;
}

export default function Direcciones() {
	const [direcciones, setDirecciones] = useState<Direccion[]>([]);
	const [mostrarFormulario, setMostrarFormulario] = useState(false);
	const [tipoFormulario, setTipoFormulario] = useState<
		'entrega' | 'facturacion'
	>('entrega');

	const [formData, setFormData] = useState({
		titulo: '',
		direccion: '',
		referencia: '',
		ciudad: '',
		provincia: '',
		distrito: '',
		codigoPostal: '',
		telefono: '',
		esPrincipal: false,
	});

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value, type } = e.target;
		setFormData({
			...formData,
			[name]:
				type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Guardando dirección:', formData);
		// Aquí iría la lógica para guardar la dirección
		setMostrarFormulario(false);
	};

	const abrirFormulario = (tipo: 'entrega' | 'facturacion') => {
		setTipoFormulario(tipo);
		setMostrarFormulario(true);
	};

	return (
		<Layout
			title="Direcciones - Liwilu"
			description="Gestiona tus direcciones de envío"
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
						<AccountSidebar activeSection="direcciones" />

						<main className="flex-1">
							<div className="md:px-8 z-10 relative">
								<h1 className="text-xl md:text-4xl font-semibold mb-8 border-b pb-4">
									Mi libreta de direcciones
								</h1>

								{!mostrarFormulario ? (
									<>
										{/* Grid de direcciones */}
										<div className="grid md:grid-cols-2 gap-6">
											{/* Dirección de entrega */}
											<div className="bg-white rounded-lg p-6">
												<h3 className="font-semibold text-primary-dark mb-2 text-lg">
													Dirección de entrega principal
												</h3>
												{direcciones.find(
													(d) => d.tipo === 'entrega' && d.esPrincipal
												) ? (
													<div>
														{/* Aquí se mostraría la dirección guardada */}
													</div>
												) : (
													<p className="text-gray-600 mb-4">
														Aún no guardaste una dirección de envío
													</p>
												)}
												<button
													onClick={() => abrirFormulario('entrega')}
													className="text-primary hover:text-primary-dark font-medium flex items-center gap-1 mt-4"
												>
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
														/>
													</svg>
													Editar
												</button>
											</div>

											{/* Dirección de facturación */}
											<div className="bg-white rounded-lg p-6">
												<h3 className="font-semibold text-primary-dark mb-2 text-lg">
													Dirección de facturación
												</h3>
												{direcciones.find(
													(d) => d.tipo === 'facturacion' && d.esPrincipal
												) ? (
													<div>
														{/* Aquí se mostraría la dirección guardada */}
													</div>
												) : (
													<p className="text-gray-600 mb-4">
														Aún no guardaste una dirección de envío
													</p>
												)}
												<button
													onClick={() => abrirFormulario('facturacion')}
													className="text-primary hover:text-primary-dark font-medium flex items-center gap-1 mt-4"
												>
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
														/>
													</svg>
													Editar
												</button>
											</div>
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
									</>
								) : (
									<>
										{/* Formulario de dirección */}
										<form onSubmit={handleSubmit} className="space-y-6">
											<div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
												<h3 className="font-semibold text-primary">
													{tipoFormulario === 'entrega'
														? 'Nueva dirección de entrega'
														: 'Nueva dirección de facturación'}
												</h3>
											</div>

											{/* Título de la dirección */}
											<div>
												<label
													htmlFor="titulo"
													className="block text-sm font-semibold text-primary-dark mb-2"
												>
													Título de la dirección (Ej: Casa, Oficina)
												</label>
												<input
													type="text"
													id="titulo"
													name="titulo"
													value={formData.titulo}
													onChange={handleChange}
													className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
													placeholder="Casa, Oficina, etc."
													required
												/>
											</div>

											{/* Dirección completa */}
											<div>
												<label
													htmlFor="direccion"
													className="block text-sm font-semibold text-primary-dark mb-2"
												>
													Dirección completa
												</label>
												<textarea
													id="direccion"
													name="direccion"
													value={formData.direccion}
													onChange={handleChange}
													rows={3}
													className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
													placeholder="Av. Ejemplo 123, Urbanización..."
													required
												/>
											</div>

											{/* Referencia */}
											<div>
												<label
													htmlFor="referencia"
													className="block text-sm font-semibold text-primary-dark mb-2"
												>
													Referencia
												</label>
												<input
													type="text"
													id="referencia"
													name="referencia"
													value={formData.referencia}
													onChange={handleChange}
													className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
													placeholder="Frente al parque, al costado de..."
												/>
											</div>

											{/* Ciudad, Provincia, Distrito */}
											<div className="grid md:grid-cols-3 gap-6">
												<div>
													<label
														htmlFor="ciudad"
														className="block text-sm font-semibold text-primary-dark mb-2"
													>
														Departamento
													</label>
													<select
														id="ciudad"
														name="ciudad"
														value={formData.ciudad}
														onChange={handleChange}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
														required
													>
														<option value="">Seleccionar</option>
														<option value="Lima">Lima</option>
														<option value="Arequipa">Arequipa</option>
														<option value="Cusco">Cusco</option>
													</select>
												</div>

												<div>
													<label
														htmlFor="provincia"
														className="block text-sm font-semibold text-primary-dark mb-2"
													>
														Provincia
													</label>
													<select
														id="provincia"
														name="provincia"
														value={formData.provincia}
														onChange={handleChange}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
														required
													>
														<option value="">Seleccionar</option>
														<option value="Lima">Lima</option>
														<option value="Callao">Callao</option>
													</select>
												</div>

												<div>
													<label
														htmlFor="distrito"
														className="block text-sm font-semibold text-primary-dark mb-2"
													>
														Distrito
													</label>
													<select
														id="distrito"
														name="distrito"
														value={formData.distrito}
														onChange={handleChange}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
														required
													>
														<option value="">Seleccionar</option>
														<option value="Miraflores">Miraflores</option>
														<option value="San Isidro">San Isidro</option>
														<option value="Surco">Surco</option>
													</select>
												</div>
											</div>

											{/* Código postal y teléfono */}
											<div className="grid md:grid-cols-2 gap-6">
												<div>
													<label
														htmlFor="codigoPostal"
														className="block text-sm font-semibold text-primary-dark mb-2"
													>
														Código postal
													</label>
													<input
														type="text"
														id="codigoPostal"
														name="codigoPostal"
														value={formData.codigoPostal}
														onChange={handleChange}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
														placeholder="15001"
													/>
												</div>

												<div>
													<label
														htmlFor="telefono"
														className="block text-sm font-semibold text-primary-dark mb-2"
													>
														Teléfono de contacto
													</label>
													<input
														type="tel"
														id="telefono"
														name="telefono"
														value={formData.telefono}
														onChange={handleChange}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
														placeholder="987 654 321"
														required
													/>
												</div>
											</div>

											{/* Checkbox dirección principal */}
											<div className="flex items-center gap-2">
												<input
													type="checkbox"
													id="esPrincipal"
													name="esPrincipal"
													checked={formData.esPrincipal}
													onChange={handleChange}
													className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
												/>
												<label htmlFor="esPrincipal" className="text-gray-700">
													Establecer como dirección principal
												</label>
											</div>

											{/* Botones */}
											<div className="flex justify-between pt-6 border-t">
												<button
													type="button"
													onClick={() => setMostrarFormulario(false)}
													className="text-gray-500 hover:text-gray-700 font-medium"
												>
													Cancelar
												</button>
												<button
													type="submit"
													className="bg-primary hover:bg-primary-dark text-white font-semibold px-16 py-2 md:py-4 rounded-full transition"
												>
													Guardar dirección
												</button>
											</div>
										</form>
									</>
								)}
							</div>
						</main>
					</div>
				</div>
			</div>
		</Layout>
	);
}
