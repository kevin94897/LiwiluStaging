// pages/mi-cuenta/mis-datos.tsx
'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import AccountSidebar from '@/components/AccountSidebar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { misDatosSchema, MisDatosSchemaType } from '@/lib/mi-cuenta/misDatosSchema';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet, apiPut } from '@/lib/auth/apiClient'; // 🆕 Importar funciones del apiClient
import toast from 'react-hot-toast'; // 🆕 Para mejores notificaciones

export default function MisDatos() {
	const [formData, setFormData] = useState<MisDatosSchemaType>({
		nombre: '',
		apellido: '',
		tipoDocumento: '',
		numeroDocumento: '',
		celular: '',
	});

	const [errors, setErrors] = useState<Partial<Record<keyof MisDatosSchemaType, string>>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// 🆕 Cargar datos del usuario al montar el componente
	useEffect(() => {
		const fetchUserData = async () => {
			try {
				setIsLoading(true);

				// 🆕 Usar apiGet que maneja automáticamente la renovación de tokens
				const response = await apiGet('/users/profile');

				if (!response.ok) {
					throw new Error('Error al cargar los datos del usuario');
				}

				const result = await response.json();

				if (result.success && result.data) {
					const userData = result.data;

					// Mapear los campos de la API a los campos del formulario
					setFormData({
						nombre: userData.firstName || '',
						apellido: userData.lastName || '',
						tipoDocumento: userData.documentType || '',
						numeroDocumento: userData.documentNumber || '',
						celular: userData.phone || '',
					});

					// Actualizar localStorage con datos frescos
					if (userData.emailVerified) {
						const userStr = localStorage.getItem('user');
						if (userStr) {
							const user = JSON.parse(userStr);
							user.emailVerified = true;
							user.firstName = userData.firstName;
							user.lastName = userData.lastName;
							localStorage.setItem('user', JSON.stringify(user));
						}
					}
				}
			} catch (error) {
				console.error('❌ Error al cargar datos del usuario:', error);
				toast.error('Error al cargar tus datos. Por favor, recarga la página.', {
					duration: 4000,
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, []);

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

	// 🆕 Manejo mejorado del submit
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
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
				console.log("Errores de validación:", newErrors);

				// Scroll al primer error
				const firstError = document.querySelector('.border-red-500');
				firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });

				toast.error('Por favor, corrige los errores en el formulario', {
					duration: 3000,
				});

				return;
			}

			// Si es válido, limpiar errores
			setErrors({});

			// Mapear los campos del formulario a los campos de la API
			const updateData = {
				firstName: formData.nombre,
				lastName: formData.apellido,
				documentType: formData.tipoDocumento,
				documentNumber: formData.numeroDocumento,
				phone: formData.celular,
			};

			// 🆕 Usar apiPut que maneja automáticamente la renovación de tokens
			const response = await apiPut('/users/profile', updateData);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Error al actualizar los datos');
			}

			const updateResult = await response.json();

			if (updateResult.success) {
				// Actualizar el usuario en localStorage
				const userStr = localStorage.getItem('user');
				if (userStr) {
					const user = JSON.parse(userStr);
					user.firstName = formData.nombre;
					user.lastName = formData.apellido;
					localStorage.setItem('user', JSON.stringify(user));
				}

				// 🆕 Usar toast en lugar de alert
				toast.success('✅ Datos actualizados correctamente', {
					duration: 3000,
					icon: '✅',
				});

				// 🆕 Opcional: Redirigir después de 1.5 segundos
				setTimeout(() => {
					window.location.href = '/mi-cuenta';
				}, 1500);
			}
		} catch (error) {
			console.error('❌ Error al guardar:', error);
			toast.error(
				error instanceof Error
					? error.message
					: '❌ Hubo un error al guardar. Intenta nuevamente.',
				{ duration: 4000 }
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<ProtectedRoute>
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

										{isLoading ? (
											<div className="flex items-center justify-center py-12">
												<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
												<p className="ml-4 text-gray-600">Cargando tus datos...</p>
											</div>
										) : (
											<form onSubmit={handleSubmit} className="space-y-6" noValidate>
												{/* Nombre y Apellido */}
												<div className="grid md:grid-cols-2 gap-6">
													<div>
														<Input
															label="Nombre *"
															type="text"
															id="nombre"
															name="nombre"
															value={formData.nombre}
															onChange={handleChange}
															maxLength={50}
															disabled={isSubmitting}
															error={errors.nombre}
														/>
													</div>

													<div>
														<Input
															label="Apellido *"
															type="text"
															id="apellido"
															name="apellido"
															value={formData.apellido}
															onChange={handleChange}
															maxLength={50}
															disabled={isSubmitting}
															error={errors.apellido}
														/>
													</div>
												</div>

												{/* Tipo de documento y Número */}
												<div className="grid md:grid-cols-2 gap-6">
													<div>
														<Select
															label="Tipo de documento *"
															id="tipoDocumento"
															name="tipoDocumento"
															value={formData.tipoDocumento}
															onChange={handleChange}
															disabled={isSubmitting}
															error={errors.tipoDocumento}
														>
															<option value="">Seleccionar tipo</option>
															<option value="DNI">DNI</option>
															<option value="CE">Carnet de Extranjería</option>
															<option value="Pasaporte">Pasaporte</option>
														</Select>
													</div>

													<div>
														<Input
															label="Número de Documento *"
															type="text"
															id="numeroDocumento"
															name="numeroDocumento"
															value={formData.numeroDocumento}
															onChange={handleDocumentoChange}
															placeholder="74218601"
															maxLength={11}
															disabled={isSubmitting}
															error={errors.numeroDocumento}
														/>
													</div>
												</div>

												{/* Celular */}
												<div>
													<Input
														label="Celular *"
														type="tel"
														id="celular"
														name="celular"
														value={formData.celular}
														onChange={handleCelularChange}
														placeholder="973820088"
														maxLength={9}
														disabled={isSubmitting}
														error={errors.celular}
													/>
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
										)}
									</section>
								</div>
							</main>
						</div>
					</div>
				</div>
			</Layout>
		</ProtectedRoute>
	);
}