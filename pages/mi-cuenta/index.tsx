// pages/mi-cuenta/index.tsx
// import { useState } from 'react';
import Layout from '@/components/Layout';
// import { useRouter } from 'next/router';
import Image from 'next/image';
import AccountSidebar from '@/components/AccountSidebar';

export default function MiCuenta() {
	// const router = useRouter();
	// const [activeSection, setActiveSection] = useState('mi-cuenta');

	// const menuItems = [
	// 	{ id: 'mi-cuenta', label: 'Mi cuenta', href: '/mi-cuenta' },
	// 	{ id: 'mis-datos', label: 'Mis datos', href: '/mi-cuenta/mis-datos' },
	// 	{ id: 'direcciones', label: 'Direcciones', href: '/mi-cuenta/direcciones' },
	// 	{ id: 'mis-pedidos', label: 'Mis pedidos', href: '/mi-cuenta/mis-pedidos' },
	// 	{
	// 		id: 'mis-favoritos',
	// 		label: 'Mis favoritos',
	// 		href: '/mi-cuenta/mis-favoritos',
	// 	},
	// 	{ id: 'cerrar-sesion', label: 'Cerrar sesión', href: '/logout' },
	// ];

	return (
		<Layout title="Mi cuenta - Liwilu" description="Gestiona tu cuenta">
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
						<AccountSidebar activeSection="mi-cuenta" />

						{/* Main Content */}
						<main className="flex-1">
							<div className="md:px-8 z-10 relative">
								<h1 className="text-xl md:text-xl md:text-4xl font-semibold mb-8 border-b pb-4">
									Información de mi cuenta
								</h1>

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
										<p className="text-gray-700 mb-1">Gonzalo Vera</p>
										<p className="text-gray-600 mb-4">
											Gonzalo.vera.dlc@gmail.com
										</p>

										<div className="flex gap-4 justify-end">
											<button className="text-primary hover:text-primary-dark font-medium flex items-center gap-1">
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
											<button className="text-primary hover:text-primary-dark font-medium flex items-center gap-1">
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
														d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
													/>
												</svg>
												Cambiar contraseña aquí
											</button>
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
													d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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
												<button className="text-primary hover:text-primary-dark font-medium flex items-center gap-1">
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

										<div className="bg-white rounded-lg p-6">
											<h3 className="font-semibold text-primary-dark mb-2">
												Dirección de facturación
											</h3>
											<p className="text-gray-600 mb-4">
												Aún no guardaste una dirección de envío
											</p>
											<div className="float-right">
												<button className="text-primary hover:text-primary-dark font-medium flex items-center gap-1">
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
									</div>
								</section>

								{/* Botones de acción */}
								<div className="flex flex-col-reverse md:flex-row justify-between mt-8 pt-6 border-t gap-6 text-center">
									<button className="text-gray-500 hover:text-gray-700 font-medium">
										Volver
									</button>
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
