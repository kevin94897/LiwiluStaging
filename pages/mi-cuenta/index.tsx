// pages/mi-cuenta/index.tsx
'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AccountSidebar from '@/components/AccountSidebar';
import Link from 'next/link';
import { FaPencil } from 'react-icons/fa6';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet } from '@/lib/auth/apiClient'; // 🆕 Usar apiClient

interface UserData {
	firstName: string;
	lastName: string;
	email: string;
	emailVerified: boolean;
}

export default function MiCuenta() {
	const [userData, setUserData] = useState<UserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// 🆕 Cargar datos del usuario al montar
	useEffect(() => {
		const fetchUserData = async () => {
			try {
				setIsLoading(true);

				// 🆕 Usar apiGet que maneja automáticamente tokens
				const response = await apiGet('/users/profile');

				if (!response.ok) {
					throw new Error('Error al cargar los datos del usuario');
				}

				const result = await response.json();

				if (result.success && result.data) {
					setUserData({
						firstName: result.data.firstName || '',
						lastName: result.data.lastName || '',
						email: result.data.email || '',
						emailVerified: result.data.emailVerified || false,
					});

					// Actualizar localStorage con datos frescos
					const userStr = localStorage.getItem('user');
					if (userStr) {
						const user = JSON.parse(userStr);
						user.firstName = result.data.firstName;
						user.lastName = result.data.lastName;
						user.emailVerified = result.data.emailVerified;
						localStorage.setItem('user', JSON.stringify(user));
					}
				}
			} catch (error) {
				console.error('❌ Error al cargar datos del usuario:', error);
				// No mostrar alert aquí para mejor UX
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, []);

	return (
		<ProtectedRoute>
			<Layout title="Mi cuenta - Liwilu" description="Gestiona tu cuenta" background={true}>
				<div className="min-h-screen py-8">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex flex-col lg:flex-row gap-6">
							{/* Sidebar */}
							<AccountSidebar activeSection="mi-cuenta" />

							{/* Main Content */}
							<main className="flex-1">
								<div className="md:px-8 z-10 relative">
									<h1 className="text-xl md:text-4xl font-semibold mb-8 border-b pb-4">
										Información de mi cuenta
									</h1>

									{/* 🆕 Loading State */}
									{isLoading ? (
										<div className="flex items-center justify-center py-12">
											<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
										</div>
									) : (
										<>
											{/* Mis datos */}
											<section className="mb-8">
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

												<div className="bg-white rounded-lg p-6">
													<h3 className="font-semibold text-primary-dark mb-2">
														Datos del comprador
													</h3>
													{/* 🆕 Mostrar datos dinámicos */}
													<p className="text-gray-700 mb-1">
														{userData?.firstName && userData?.lastName
															? `${userData.firstName} ${userData.lastName}`
															: 'Sin nombre registrado'}
													</p>
													<p className="text-gray-600 mb-1">
														{userData?.email || 'Sin correo registrado'}
													</p>
													{/* 🆕 Indicador de verificación de email */}
													{userData?.emailVerified ? (
														<p className="text-green-600 text-sm mb-4 flex items-center gap-1">
															<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
																<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
															</svg>
															Email verificado
														</p>
													) : (
														<p className="text-amber-600 text-sm mb-4 flex items-center gap-1">
															<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
																<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
															</svg>
															Email pendiente de verificación
														</p>
													)}

													<div className="flex gap-4 justify-end">
														<Link
															href="/mi-cuenta/mis-datos"
															className="text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition"
														>
															<FaPencil className="text-sm" />
															Editar
														</Link>
														<Link
															href="/mi-cuenta/cambiar-password"
															className="text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition"
														>
															<FaPencil className="text-sm" />
															Cambiar contraseña
														</Link>
													</div>
												</div>
											</section>

											{/* Mi libreta de direcciones */}
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
																d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
															/>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
															/>
														</svg>
													</div>
													<h2 className="text-xl md:text-2xl font-semibold">
														Mi libreta de direcciones
													</h2>
												</div>

												<div className="grid md:grid-cols-2 gap-6">
													<div className="bg-white rounded-lg p-6">
														<h3 className="font-semibold text-primary-dark mb-2">
															Dirección de entrega principal
														</h3>
														<p className="text-gray-600 mb-4">
															Aún no guardaste una dirección de envío
														</p>
														<div className="float-right">
															<Link
																href="/mi-cuenta/direcciones"
																className="text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition"
															>
																<FaPencil className="text-sm" />
																Editar
															</Link>
														</div>
													</div>

													<div className="bg-white rounded-lg p-6">
														<h3 className="font-semibold text-primary-dark mb-2">
															Dirección de facturación
														</h3>
														<p className="text-gray-600 mb-4">
															Aún no guardaste una dirección de facturación
														</p>
														<div className="float-right">
															<Link
																href="/mi-cuenta/direcciones"
																className="text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition"
															>
																<FaPencil className="text-sm" />
																Editar
															</Link>
														</div>
													</div>
												</div>
											</section>

											{/* 🆕 Botones de acción actualizados */}
											<div className="flex flex-col-reverse md:flex-row justify-end mt-8 pt-6 border-t gap-6 text-center items-center">
												<Link
													href="/"
													className="text-gray-500 hover:text-gray-700 font-medium transition"
												>
													Volver al inicio
												</Link>
											</div>
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