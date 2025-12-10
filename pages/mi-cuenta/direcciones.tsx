// pages/mi-cuenta/direcciones.tsx
'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import AccountSidebar from '@/components/AccountSidebar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { direccionSchema, DireccionSchemaType } from '@/lib/mi-cuenta/direccionSchema';
import { FaPencil, FaTrash } from 'react-icons/fa6';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Address {
	id: string;
	userId: string;
	isMain: boolean;
	department: string;
	province: string;
	district: string;
	address: string;
	apartment: string;
	reference: string;
	createdAt: string;
	updatedAt: string;
}

export default function Direcciones() {
	const [direcciones, setDirecciones] = useState<Address[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [mostrarFormulario, setMostrarFormulario] = useState(false);
	const [direccionEditando, setDireccionEditando] = useState<string | null>(null);

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

	// Cargar direcciones al montar el componente
	useEffect(() => {
		fetchDirecciones();
	}, []);

	const fetchDirecciones = async () => {
		try {
			const accessToken = localStorage.getItem('accessToken');

			if (!accessToken) {
				console.error('No hay token de acceso');
				setIsLoading(false);
				return;
			}

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/addresses`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Error al cargar las direcciones');
			}

			const result = await response.json();

			if (result.success && result.data) {
				setDirecciones(result.data);
			}
		} catch (error) {
			console.error('Error al cargar direcciones:', error);
			alert('❌ Error al cargar las direcciones. Por favor, intenta nuevamente.');
		} finally {
			setIsLoading(false);
		}
	};

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

		try {
			const accessToken = localStorage.getItem('accessToken');

			if (!accessToken) {
				alert('❌ No estás autenticado. Por favor, inicia sesión nuevamente.');
				return;
			}

			// Mapear los campos del formulario a los campos de la API
			const addressData = {
				department: formData.ciudad,
				province: formData.provincia,
				district: formData.distrito,
				address: formData.direccion,
				apartment: formData.titulo,
				reference: formData.referencia || '',
				isMain: formData.esPrincipal,
			};

			const url = direccionEditando
				? `${process.env.NEXT_PUBLIC_API_URL}/users/addresses/${direccionEditando}`
				: `${process.env.NEXT_PUBLIC_API_URL}/users/addresses`;

			const method = direccionEditando ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(addressData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Error al guardar la dirección');
			}

			const saveResult = await response.json();

			if (saveResult.success) {
				alert(`✅ Dirección ${direccionEditando ? 'actualizada' : 'guardada'} correctamente`);
				setMostrarFormulario(false);
				setDireccionEditando(null);

				// Recargar direcciones
				await fetchDirecciones();

				// Resetear formulario
				resetFormulario();
			}
		} catch (error) {
			console.error('Error al guardar:', error);
			alert('❌ Hubo un error al guardar. Intenta nuevamente.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const resetFormulario = () => {
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

	const abrirFormularioNuevo = () => {
		resetFormulario();
		setDireccionEditando(null);
		setMostrarFormulario(true);
		setErrors({});
	};

	const editarDireccion = (address: Address) => {
		setFormData({
			titulo: address.apartment,
			direccion: address.address,
			referencia: address.reference || '',
			ciudad: address.department,
			provincia: address.province,
			distrito: address.district,
			codigoPostal: '',
			telefono: '',
			esPrincipal: address.isMain,
		});
		setDireccionEditando(address.id);
		setMostrarFormulario(true);
		setErrors({});
	};

	const eliminarDireccion = async (id: string) => {
		if (!confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
			return;
		}

		try {
			const accessToken = localStorage.getItem('accessToken');

			if (!accessToken) {
				alert('❌ No estás autenticado. Por favor, inicia sesión nuevamente.');
				return;
			}

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/addresses/${id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Error al eliminar la dirección');
			}

			alert('✅ Dirección eliminada correctamente');
			await fetchDirecciones();
		} catch (error) {
			console.error('Error al eliminar:', error);
			alert('❌ Hubo un error al eliminar. Intenta nuevamente.');
		}
	};

	const cancelarFormulario = () => {
		setMostrarFormulario(false);
		setDireccionEditando(null);
		setErrors({});
		resetFormulario();
	};

	const direccionPrincipal = direcciones.find(d => d.isMain);
	const direccionesSecundarias = direcciones.filter(d => !d.isMain);

	return (
		<ProtectedRoute>
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

									{isLoading ? (
										<div className="flex items-center justify-center py-12">
											<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
										</div>
									) : !mostrarFormulario ? (
										<>
											{/* Dirección principal */}
											{direccionPrincipal && (
												<div className="mb-6">
													<h2 className="text-lg font-semibold text-primary-dark mb-4">
														Dirección principal
													</h2>
													<div className="bg-white rounded-sm shadow-sm p-6 border-2 border-primary/20">
														<div className="flex justify-between items-start mb-3">
															<h3 className="font-semibold text-primary-dark text-lg">
																{direccionPrincipal.apartment}
															</h3>
															<div className="flex gap-2">
																<button
																	onClick={() => editarDireccion(direccionPrincipal)}
																	className="text-primary hover:text-primary-dark transition p-2"
																	title="Editar"
																>
																	<FaPencil size={16} />
																</button>
																<button
																	onClick={() => eliminarDireccion(direccionPrincipal.id)}
																	className="text-red-500 hover:text-red-700 transition p-2"
																	title="Eliminar"
																>
																	<FaTrash size={16} />
																</button>
															</div>
														</div>
														<p className="text-gray-700 mb-2">{direccionPrincipal.address}</p>
														<p className="text-gray-600 text-sm mb-1">
															{direccionPrincipal.district}, {direccionPrincipal.province}, {direccionPrincipal.department}
														</p>
														{direccionPrincipal.reference && (
															<p className="text-gray-600 text-sm">
																<span className="font-semibold">Referencia:</span> {direccionPrincipal.reference}
															</p>
														)}
													</div>
												</div>
											)}

											{/* Direcciones secundarias */}
											{direccionesSecundarias.length > 0 && (
												<div className="mb-6">
													<h2 className="text-lg font-semibold text-primary-dark mb-4">
														Otras direcciones
													</h2>
													<div className="grid md:grid-cols-2 gap-4">
														{direccionesSecundarias.map((address) => (
															<div key={address.id} className="bg-white rounded-sm shadow-sm p-6">
																<div className="flex justify-between items-start mb-3">
																	<h3 className="font-semibold text-primary-dark">
																		{address.apartment}
																	</h3>
																	<div className="flex gap-2">
																		<button
																			onClick={() => editarDireccion(address)}
																			className="text-primary hover:text-primary-dark transition p-2"
																			title="Editar"
																		>
																			<FaPencil size={14} />
																		</button>
																		<button
																			onClick={() => eliminarDireccion(address.id)}
																			className="text-red-500 hover:text-red-700 transition p-2"
																			title="Eliminar"
																		>
																			<FaTrash size={14} />
																		</button>
																	</div>
																</div>
																<p className="text-gray-700 mb-2 text-sm">{address.address}</p>
																<p className="text-gray-600 text-xs mb-1">
																	{address.district}, {address.province}, {address.department}
																</p>
																{address.reference && (
																	<p className="text-gray-600 text-xs">
																		<span className="font-semibold">Ref:</span> {address.reference}
																	</p>
																)}
															</div>
														))}
													</div>
												</div>
											)}

											{/* Mensaje si no hay direcciones */}
											{direcciones.length === 0 && (
												<div className="bg-gray-50 rounded-sm p-8 text-center">
													<p className="text-gray-600 mb-4">
														Aún no tienes direcciones guardadas
													</p>
												</div>
											)}

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
													onClick={abrirFormularioNuevo}
												>
													Agregar nueva dirección
												</Button>
											</div>
										</>
									) : (
										<>
											{/* Formulario de dirección */}
											<form onSubmit={handleSubmit} className="space-y-6" noValidate>
												<div className="bg-primary/10 border border-primary/20 rounded-sm p-4 mb-6">
													<h3 className="font-semibold text-primary">
														{direccionEditando ? 'Editar dirección' : 'Nueva dirección'}
													</h3>
												</div>

												{/* Título de la dirección */}
												<div>
													<Input
														label="Título de la dirección *"
														type="text"
														id="titulo"
														name="titulo"
														value={formData.titulo}
														onChange={handleChange}
														placeholder="Casa, Oficina, etc."
														maxLength={50}
														error={errors.titulo}
													/>
												</div>

												{/* Dirección completa */}
												<div>
													<Textarea
														label="Dirección completa *"
														id="direccion"
														name="direccion"
														value={formData.direccion}
														onChange={handleChange}
														rows={3}
														placeholder="Av. Ejemplo 123, Urbanización..."
														maxLength={200}
														error={errors.direccion}
													/>
												</div>

												{/* Referencia */}
												<div>
													<Input
														label="Referencia"
														type="text"
														id="referencia"
														name="referencia"
														value={formData.referencia}
														onChange={handleChange}
														placeholder="Frente al parque, al costado de..."
														maxLength={100}
														error={errors.referencia}
													/>
												</div>

												{/* Ciudad, Provincia, Distrito */}
												<div className="grid md:grid-cols-3 gap-6">
													<div>
														<Input
															label="Departamento *"
															type="text"
															id="ciudad"
															name="ciudad"
															value={formData.ciudad}
															onChange={handleChange}
															placeholder="Lima"
															maxLength={50}
															error={errors.ciudad}
														/>
													</div>

													<div>
														<Input
															label="Provincia *"
															type="text"
															id="provincia"
															name="provincia"
															value={formData.provincia}
															onChange={handleChange}
															placeholder="Lima"
															maxLength={50}
															error={errors.provincia}
														/>
													</div>

													<div>
														<Input
															label="Distrito *"
															type="text"
															id="distrito"
															name="distrito"
															value={formData.distrito}
															onChange={handleChange}
															placeholder="San Isidro"
															maxLength={50}
															error={errors.distrito}
														/>
													</div>
												</div>

												{/* Código postal y teléfono */}
												<div className="grid md:grid-cols-2 gap-6">
													<div>
														<Input
															label="Código postal"
															type="text"
															id="codigoPostal"
															name="codigoPostal"
															value={formData.codigoPostal}
															onChange={handleCodigoPostalChange}
															placeholder="15001"
															maxLength={5}
															error={errors.codigoPostal}
														/>
													</div>

													<div>
														<Input
															label="Teléfono de contacto *"
															type="tel"
															id="telefono"
															name="telefono"
															value={formData.telefono}
															onChange={handleTelefonoChange}
															placeholder="987654321"
															maxLength={9}
															error={errors.telefono}
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
		</ProtectedRoute>
	);
}