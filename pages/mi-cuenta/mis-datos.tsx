// pages/mi-cuenta/mis-datos.tsx
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import AccountSidebar from '@/components/AccountSidebar';
import Button from '@/components/ui/Button';
import { misDatosSchema, MisDatosSchemaType } from '@/lib/mi-cuenta/misDatosSchema';
import { PiWarningCircleFill } from 'react-icons/pi';

export default function MisDatos() {
	const [formData, setFormData] = useState<MisDatosSchemaType>({
		nombre: 'Gonzalo',
		apellido: 'Vera',
		tipoDocumento: 'DNI',
		numeroDocumento: '74218601',
		celular: '973820088',
	});

	const [errors, setErrors] = useState<Partial<Record<keyof MisDatosSchemaType, string>>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		// Limpiar error del campo
		setErrors(prev => ({ ...prev, [name]: undefined }));
	};

	const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, ''); // Solo números
		if (value.length <= 11) {
			setFormData(prev => ({ ...prev, numeroDocumento: value }));
			setErrors(prev => ({ ...prev, numeroDocumento: undefined }));
		}
	};

	const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, ''); // Solo números
		if (value.length <= 9) {
			setFormData(prev => ({ ...prev, celular: value }));
			setErrors(prev => ({ ...prev, celular: undefined }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Validación con Zod
		const result = misDatosSchema.safeParse(formData);

		if (!result.success) {
			const formattedErrors = result.error.flatten().fieldErrors;
			const newErrors: Partial<Record<keyof MisDatosSchemaType, string>> = {};

			for (const key in formattedErrors) {
				const errorArray = formattedErrors[key as keyof typeof formattedErrors];
				if (errorArray && errorArray.length > 0) {
					newErrors[key as keyof MisDatosSchemaType] = errorArray[0];
				}
			}

			setErrors(newErrors);
			setIsSubmitting(false);
			console.log("Errores de validación:", newErrors);

			// Scroll al primer error
			const firstError = document.querySelector('.border-red-500');
			firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });

			return;
		}

		// Si es válido
		setErrors({});
		console.log('Guardando datos:', formData);

		try {
			// Aquí iría la llamada a tu API
			// await fetch('/api/usuario/actualizar', { method: 'PUT', body: JSON.stringify(formData) });

			await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay

			alert('✅ Datos actualizados correctamente');
		} catch (error) {
			console.error('Error al guardar:', error);
			alert('❌ Hubo un error al guardar. Intenta nuevamente.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Layout
			title="Mis datos - Liwilu"
			description="Edita tu información personal"
			background={true}
		>
			<div className="min-h-screen py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-6">
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

									<form onSubmit={handleSubmit} className="space-y-6" noValidate>
										{/* Nombre y Apellido */}
										<div className="grid md:grid-cols-2 gap-6">
											<div>
												<label
													htmlFor="nombre"
													className="block text-sm font-semibold text-primary-dark mb-2"
												>
													Nombre *
												</label>
												<input
													type="text"
													id="nombre"
													name="nombre"
													value={formData.nombre}
													onChange={handleChange}
													className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.nombre
														? 'border-red-500 focus:ring-red-500'
														: 'border-gray-300 focus:ring-primary focus:border-primary'
														}`}
													maxLength={50}
												/>
												{errors.nombre && (
													<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
														<PiWarningCircleFill size={16} /> {errors.nombre}
													</p>
												)}
											</div>

											<div>
												<label
													htmlFor="apellido"
													className="block text-sm font-semibold text-primary-dark mb-2"
												>
													Apellido *
												</label>
												<input
													type="text"
													id="apellido"
													name="apellido"
													value={formData.apellido}
													onChange={handleChange}
													className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.apellido
														? 'border-red-500 focus:ring-red-500'
														: 'border-gray-300 focus:ring-primary focus:border-primary'
														}`}
													maxLength={50}
												/>
												{errors.apellido && (
													<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
														<PiWarningCircleFill size={16} /> {errors.apellido}
													</p>
												)}
											</div>
										</div>

										{/* Tipo de documento y Número */}
										<div className="grid md:grid-cols-2 gap-6">
											<div>
												<label
													htmlFor="tipoDocumento"
													className="block text-sm font-semibold text-primary-dark mb-2"
												>
													Tipo de documento *
												</label>
												<select
													id="tipoDocumento"
													name="tipoDocumento"
													value={formData.tipoDocumento}
													onChange={handleChange}
													className={`w-full px-4 py-3 border-2 rounded-sm transition appearance-none bg-white ${errors.tipoDocumento
														? 'border-red-500 focus:ring-red-500'
														: 'border-gray-300 focus:ring-primary focus:border-primary'
														}`}
												>
													<option value="">Seleccionar tipo</option>
													<option value="DNI">DNI</option>
													<option value="CE">Carnet de Extranjería</option>
													<option value="Pasaporte">Pasaporte</option>
												</select>
												{errors.tipoDocumento && (
													<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
														<PiWarningCircleFill size={16} /> {errors.tipoDocumento}
													</p>
												)}
											</div>

											<div>
												<label
													htmlFor="numeroDocumento"
													className="block text-sm font-semibold text-primary-dark mb-2"
												>
													Número de Documento *
												</label>
												<input
													type="text"
													id="numeroDocumento"
													name="numeroDocumento"
													value={formData.numeroDocumento}
													onChange={handleDocumentoChange}
													className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.numeroDocumento
														? 'border-red-500 focus:ring-red-500'
														: 'border-gray-300 focus:ring-primary focus:border-primary'
														}`}
													placeholder="74218601"
													maxLength={11}
												/>
												{errors.numeroDocumento && (
													<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
														<PiWarningCircleFill size={16} /> {errors.numeroDocumento}
													</p>
												)}
											</div>
										</div>

										{/* Celular */}
										<div>
											<label
												htmlFor="celular"
												className="block text-sm font-semibold text-primary-dark mb-2"
											>
												Celular *
											</label>
											<input
												type="tel"
												id="celular"
												name="celular"
												value={formData.celular}
												onChange={handleCelularChange}
												className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.celular
													? 'border-red-500 focus:ring-red-500'
													: 'border-gray-300 focus:ring-primary focus:border-primary'
													}`}
												placeholder="973820088"
												maxLength={9}
											/>
											{errors.celular && (
												<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
													<PiWarningCircleFill size={16} /> {errors.celular}
												</p>
											)}
										</div>

										{/* Botones de acción */}
										<div className="flex flex-col-reverse md:flex-row justify-between mt-8 pt-6 border-t gap-6 text-center items-center">
											<Link
												href="/mi-cuenta"
												className="text-gray-500 hover:text-gray-700 font-medium transition"
											>
												Volver
											</Link>
											<Button
												variant="primary"
												size="md"
												type="submit"
												disabled={isSubmitting}
											>
												{isSubmitting ? (
													<span className="flex items-center justify-center gap-2">
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
														Guardando...
													</span>
												) : (
													'Guardar cambios'
												)}
											</Button>
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