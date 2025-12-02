// pages/mi-cuenta/direcciones.tsx
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import AccountSidebar from '@/components/AccountSidebar';
import Button from '@/components/ui/Button';
import { direccionSchema, DireccionSchemaType } from '@/lib/mi-cuenta/direccionSchema';
import { PiWarningCircleFill } from 'react-icons/pi';

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
	const [direcciones] = useState<Direccion[]>([]);
	const [mostrarFormulario, setMostrarFormulario] = useState(false);
	const [tipoFormulario, setTipoFormulario] = useState<'entrega' | 'facturacion'>('entrega');

	const [formData, setFormData] = useState<DireccionSchemaType>({
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

	const [errors, setErrors] = useState<Partial<Record<keyof DireccionSchemaType, string>>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
	) => {
		const { name, value, type } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
		}));
		// Limpiar error del campo
		setErrors(prev => ({ ...prev, [name]: undefined }));
	};

	const handleCodigoPostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, ''); // Solo números
		if (value.length <= 5) {
			setFormData(prev => ({ ...prev, codigoPostal: value }));
			setErrors(prev => ({ ...prev, codigoPostal: undefined }));
		}
	};

	const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, ''); // Solo números
		if (value.length <= 9) {
			setFormData(prev => ({ ...prev, telefono: value }));
			setErrors(prev => ({ ...prev, telefono: undefined }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Validación con Zod
		const result = direccionSchema.safeParse(formData);

		if (!result.success) {
			const formattedErrors = result.error.flatten().fieldErrors;
			const newErrors: Partial<Record<keyof DireccionSchemaType, string>> = {};

			for (const key in formattedErrors) {
				const errorArray = formattedErrors[key as keyof typeof formattedErrors];
				if (errorArray && errorArray.length > 0) {
					newErrors[key as keyof DireccionSchemaType] = errorArray[0];
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
		console.log('Guardando dirección:', { ...formData, tipo: tipoFormulario });

		try {
			// Aquí iría la llamada a tu API
			// await fetch('/api/direcciones', { method: 'POST', body: JSON.stringify({ ...formData, tipo: tipoFormulario }) });

			await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay

			alert('✅ Dirección guardada correctamente');
			setMostrarFormulario(false);

			// Resetear formulario
			setFormData({
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
		} catch (error) {
			console.error('Error al guardar:', error);
			alert('❌ Hubo un error al guardar. Intenta nuevamente.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const abrirFormulario = (tipo: 'entrega' | 'facturacion') => {
		setTipoFormulario(tipo);
		setMostrarFormulario(true);
		setErrors({}); // Limpiar errores al abrir
	};

	const cancelarFormulario = () => {
		setMostrarFormulario(false);
		setErrors({});
		setFormData({
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
	};

	return (
		<Layout
			title="Direcciones - Liwilu"
			description="Gestiona tus direcciones de envío"
			background={true}
		>
			<div className="min-h-screen py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-6">
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
											<div className="bg-white rounded-sm shadow-sm p-6">
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
													className="text-primary hover:text-primary-dark font-medium flex items-center gap-1 mt-4 transition"
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
											<div className="bg-white rounded-sm shadow-sm p-6">
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
														Aún no guardaste una dirección de facturación
													</p>
												)}
												<button
													onClick={() => abrirFormulario('facturacion')}
													className="text-primary hover:text-primary-dark font-medium flex items-center gap-1 mt-4 transition"
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
										<div className="flex flex-col-reverse md:flex-row justify-between mt-8 pt-6 border-t gap-6 text-center items-center">
											<Link
												href="/mi-cuenta"
												className="text-gray-500 hover:text-gray-700 font-medium transition"
											>
												Volver
											</Link>
											<Button variant="primary" size="md">
												Guardar cambios
											</Button>
										</div>
									</>
								) : (
									<>
										{/* Formulario de dirección */}
										<form onSubmit={handleSubmit} className="space-y-6" noValidate>
											<div className="bg-primary/10 border border-primary/20 rounded-sm p-4 mb-6">
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
													Título de la dirección *
												</label>
												<input
													type="text"
													id="titulo"
													name="titulo"
													value={formData.titulo}
													onChange={handleChange}
													className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.titulo
														? 'border-red-500 focus:ring-red-500'
														: 'border-gray-300 focus:ring-primary focus:border-primary'
														}`}
													placeholder="Casa, Oficina, etc."
													maxLength={50}
												/>
												{errors.titulo && (
													<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
														<PiWarningCircleFill size={16} /> {errors.titulo}
													</p>
												)}
											</div>

											{/* Dirección completa */}
											<div>
												<label
													htmlFor="direccion"
													className="block text-sm font-semibold text-primary-dark mb-2"
												>
													Dirección completa *
												</label>
												<textarea
													id="direccion"
													name="direccion"
													value={formData.direccion}
													onChange={handleChange}
													rows={3}
													className={`w-full px-4 py-3 border-2 rounded-sm transition resize-none ${errors.direccion
														? 'border-red-500 focus:ring-red-500'
														: 'border-gray-300 focus:ring-primary focus:border-primary'
														}`}
													placeholder="Av. Ejemplo 123, Urbanización..."
													maxLength={200}
												/>
												{errors.direccion && (
													<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
														<PiWarningCircleFill size={16} /> {errors.direccion}
													</p>
												)}
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
													className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.referencia
														? 'border-red-500 focus:ring-red-500'
														: 'border-gray-300 focus:ring-primary focus:border-primary'
														}`}
													placeholder="Frente al parque, al costado de..."
													maxLength={100}
												/>
												{errors.referencia && (
													<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
														<PiWarningCircleFill size={16} /> {errors.referencia}
													</p>
												)}
											</div>

											{/* Ciudad, Provincia, Distrito */}
											<div className="grid md:grid-cols-3 gap-6">
												<div>
													<label
														htmlFor="ciudad"
														className="block text-sm font-semibold text-primary-dark mb-2"
													>
														Departamento *
													</label>
													<select
														id="ciudad"
														name="ciudad"
														value={formData.ciudad}
														onChange={handleChange}
														className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.ciudad
															? 'border-red-500 focus:ring-red-500'
															: 'border-gray-300 focus:ring-primary focus:border-primary'
															}`}
													>
														<option value="">Seleccionar</option>
														<option value="Lima">Lima</option>
														<option value="Arequipa">Arequipa</option>
														<option value="Cusco">Cusco</option>
													</select>
													{errors.ciudad && (
														<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
															<PiWarningCircleFill size={16} /> {errors.ciudad}
														</p>
													)}
												</div>

												<div>
													<label
														htmlFor="provincia"
														className="block text-sm font-semibold text-primary-dark mb-2"
													>
														Provincia *
													</label>
													<select
														id="provincia"
														name="provincia"
														value={formData.provincia}
														onChange={handleChange}
														className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.provincia
															? 'border-red-500 focus:ring-red-500'
															: 'border-gray-300 focus:ring-primary focus:border-primary'
															}`}
													>
														<option value="">Seleccionar</option>
														<option value="Lima">Lima</option>
														<option value="Callao">Callao</option>
													</select>
													{errors.provincia && (
														<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
															<PiWarningCircleFill size={16} /> {errors.provincia}
														</p>
													)}
												</div>

												<div>
													<label
														htmlFor="distrito"
														className="block text-sm font-semibold text-primary-dark mb-2"
													>
														Distrito *
													</label>
													<select
														id="distrito"
														name="distrito"
														value={formData.distrito}
														onChange={handleChange}
														className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.distrito
															? 'border-red-500 focus:ring-red-500'
															: 'border-gray-300 focus:ring-primary focus:border-primary'
															}`}
													>
														<option value="">Seleccionar</option>
														<option value="Miraflores">Miraflores</option>
														<option value="San Isidro">San Isidro</option>
														<option value="Surco">Surco</option>
													</select>
													{errors.distrito && (
														<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
															<PiWarningCircleFill size={16} /> {errors.distrito}
														</p>
													)}
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
														onChange={handleCodigoPostalChange}
														className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.codigoPostal
															? 'border-red-500 focus:ring-red-500'
															: 'border-gray-300 focus:ring-primary focus:border-primary'
															}`}
														placeholder="15001"
														maxLength={5}
													/>
													{errors.codigoPostal && (
														<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
															<PiWarningCircleFill size={16} /> {errors.codigoPostal}
														</p>
													)}
												</div>

												<div>
													<label
														htmlFor="telefono"
														className="block text-sm font-semibold text-primary-dark mb-2"
													>
														Teléfono de contacto *
													</label>
													<input
														type="tel"
														id="telefono"
														name="telefono"
														value={formData.telefono}
														onChange={handleTelefonoChange}
														className={`w-full px-4 py-3 border-2 rounded-sm transition ${errors.telefono
															? 'border-red-500 focus:ring-red-500'
															: 'border-gray-300 focus:ring-primary focus:border-primary'
															}`}
														placeholder="987654321"
														maxLength={9}
													/>
													{errors.telefono && (
														<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
															<PiWarningCircleFill size={16} /> {errors.telefono}
														</p>
													)}
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
											<div className="flex flex-col-reverse md:flex-row justify-between pt-6 border-t gap-4">
												<button
													type="button"
													onClick={cancelarFormulario}
													className="text-gray-500 hover:text-gray-700 font-medium transition"
												>
													Cancelar
												</button>
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
														'Guardar dirección'
													)}
												</Button>
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