// pages/mi-cuenta/direcciones.tsx
'use client';

import { useState, useEffect } from 'react';
import logger from '@/lib/logger';
import Layout from '@/components/Layout';
import Link from 'next/link';
import AccountSidebar from '@/components/AccountSidebar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { direccionSchema, DireccionSchemaType } from '@/lib/mi-cuenta/direccionSchema';
import { FaPencil, FaTrash } from 'react-icons/fa6';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useLocations } from "@/hooks/useLocations";
import { showToast } from '@/lib/notifications';

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
		numeroDptoPiso: '',
		direccion: '',
		referencia: '',
		ciudad: '',
		provincia: '',
		distrito: '',
		codigoPostal: '',
		esPrincipal: false,
	});

	const [errors, setErrors] = useState<Partial<Record<keyof DireccionSchemaType, string>>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const locations = useLocations();

	// Cargar direcciones al montar el componente
	useEffect(() => {
		fetchDirecciones();
	}, []);



	const fetchDirecciones = async () => {
		try {
			const accessToken = localStorage.getItem('accessToken');

			if (!accessToken) {
				logger.error('No hay token de acceso');
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
				const addresses = result.data;
				setDirecciones(addresses);

				// Si es la primera vez que se cargan y no hay direcciones,
				// pre-seleccionar "esPrincipal" para el próximo uso
				if (addresses.length === 0) {
					setFormData(prev => ({ ...prev, esPrincipal: true }));
				}
			}
		} catch (error) {
			logger.error('Error al cargar direcciones:', error);
			showToast('Error al cargar las direcciones. Por favor, intenta nuevamente.', 'error');
		} finally {
			setIsLoading(false);
		}
	};



	const handleCodigoPostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, ''); // Solo números
		if (value.length <= 5) {
			setFormData(prev => ({ ...prev, codigoPostal: value }));
			setErrors(prev => ({ ...prev, codigoPostal: undefined }));
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
			logger.log("Errores de validación:", newErrors);

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
				showToast('No estás autenticado. Por favor, inicia sesión nuevamente.', 'error');
				return;
			}

			const isFirstAddress = direcciones.length === 0;

			// Mapear los campos del formulario a los campos de la API
			const addressData = {
				department: formData.ciudad,
				province: formData.provincia,
				district: formData.distrito,
				address: formData.direccion,
				apartment: formData.numeroDptoPiso,
				reference: formData.referencia || '',
				isMain: isFirstAddress ? true : formData.esPrincipal,
			};

			// Si se establece como principal, desmarcar la anterior
			if (formData.esPrincipal && direccionPrincipal && direccionPrincipal.id !== direccionEditando) {
				const prevPrincipalData = {
					department: direccionPrincipal.department,
					province: direccionPrincipal.province,
					district: direccionPrincipal.district,
					address: direccionPrincipal.address,
					apartment: direccionPrincipal.apartment,
					reference: direccionPrincipal.reference || '',
					isMain: false,
				};

				await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/addresses/${direccionPrincipal.id}`, {
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(prevPrincipalData),
				});
			}

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
				showToast(`Dirección ${direccionEditando ? 'actualizada' : 'guardada'} correctamente`);
				setMostrarFormulario(false);
				setDireccionEditando(null);

				// Recargar direcciones
				await fetchDirecciones();

				// Resetear formulario
				resetFormulario();
			}
		} catch (error) {
			logger.error('Error al guardar:', error);
			showToast('Hubo un error al guardar. Intenta nuevamente.', 'error');
		} finally {
			setIsSubmitting(false);
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

	const resetFormulario = () => {
		setFormData({
			numeroDptoPiso: '',
			direccion: '',
			referencia: '',
			ciudad: '',
			provincia: '',
			distrito: '',
			codigoPostal: '',
			esPrincipal: direcciones.length === 0,
		});
		locations.setLocationValues("", "", "");
	};

	const abrirFormularioNuevo = () => {
		resetFormulario();
		setDireccionEditando(null);
		setMostrarFormulario(true);
		setErrors({});
	};

	const editarDireccion = (address: Address) => {
		setFormData({
			numeroDptoPiso: address.apartment,
			direccion: address.address,
			referencia: address.reference || '',
			ciudad: address.department,
			provincia: address.province,
			distrito: address.district,
			codigoPostal: '',
			esPrincipal: address.isMain,
		});
		locations.setLocationValues(address.department, address.province, address.district);
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

			showToast('Dirección eliminada correctamente');
			await fetchDirecciones();
		} catch (error) {
			logger.error('Error al eliminar:', error);
			showToast('Hubo un error al eliminar. Intenta nuevamente.', 'error');
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
																{direccionPrincipal.apartment ? `Dirección principal: ${direccionPrincipal.address}` : 'Dirección principal'}
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
														{/* <p className="text-gray-700 mb-2">{direccionPrincipal.address}</p> */}
														<p className="text-gray-600 text-sm mb-1">
															{direccionPrincipal.district}, {direccionPrincipal.province}, {direccionPrincipal.department}
														</p>
														{direccionPrincipal.reference && (
															<p className="text-gray-600 text-sm">
																<span className="font-semibold">Referencia:</span> {direccionPrincipal.reference}
															</p>
														)}
														<p className="text-gray-600 text-sm">
															<span className="font-semibold">Dpto/Piso:</span> {direccionPrincipal.apartment}
														</p>
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
																		{address.apartment ? `Dirección: ${address.address}` : 'Dirección'}
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
																<p className="text-gray-600 text-xs">
																	<span className="font-semibold">Dpto/Piso:</span> {address.apartment}
																</p>
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

												{/* Ciudad, Provincia, Distrito */}
												<div className="grid md:grid-cols-3 gap-6">
													<div className="flex flex-col gap-1">
														<label htmlFor="ciudad" className="text-sm font-medium text-gray-700">
															Departamento *
														</label>
														<select
															id="ciudad"
															name="ciudad"
															value={formData.ciudad}
															onChange={(e) => {
																const val = e.target.value;
																setFormData(prev => ({ ...prev, ciudad: val, provincia: "", distrito: "" }));
																locations.handleDeptChange(val);
															}}
															className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-white"
														>
															<option value="">Seleccionar</option>
															{locations.departments.map((d) => (
																<option key={d} value={d}>{d}</option>
															))}
														</select>
														{errors.ciudad && <span className="text-red-500 text-xs">{errors.ciudad}</span>}
													</div>

													<div className="flex flex-col gap-1">
														<label htmlFor="provincia" className="text-sm font-medium text-gray-700">
															Provincia *
														</label>
														<select
															id="provincia"
															name="provincia"
															value={formData.provincia}
															onChange={(e) => {
																const val = e.target.value;
																setFormData(prev => ({ ...prev, provincia: val, distrito: "" }));
																locations.handleProvChange(val);
															}}
															className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-white"
															disabled={!formData.ciudad}
														>
															<option value="">Seleccionar</option>
															{locations.provinces.map((p) => (
																<option key={p} value={p}>{p}</option>
															))}
														</select>
														{errors.provincia && <span className="text-red-500 text-xs">{errors.provincia}</span>}
													</div>

													<div className="flex flex-col gap-1">
														<label htmlFor="distrito" className="text-sm font-medium text-gray-700">
															Distrito *
														</label>
														<select
															id="distrito"
															name="distrito"
															value={formData.distrito}
															onChange={(e) => {
																const val = e.target.value;
																setFormData(prev => ({ ...prev, distrito: val }));
																locations.handleDistChange(val);
															}}
															className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-white"
															disabled={!formData.provincia}
														>
															<option value="">Seleccionar</option>
															{locations.districts.map((d) => (
																<option key={d} value={d}>{d}</option>
															))}
														</select>
														{errors.distrito && <span className="text-red-500 text-xs">{errors.distrito}</span>}
													</div>
												</div>

												{/* Código postal y Dpto/Piso */}

												<div className="grid md:grid-cols-3 gap-6">
													{/* Código postal */}
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
													{/* Nro de Dpto/Piso */}
													<div>
														<Input
															label="Nro. de Dpto/Piso"
															type="text"
															id="numeroDptoPiso"
															name="numeroDptoPiso"
															value={formData.numeroDptoPiso}
															onChange={handleChange}
															placeholder="Ej: Dpto 302, Piso 4, etc."
															maxLength={50}
															error={errors.numeroDptoPiso}
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