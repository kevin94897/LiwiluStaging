// pages/mi-cuenta/index.tsx
import { useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function MiCuenta() {
	const router = useRouter();
	const [activeSection, setActiveSection] = useState('mi-cuenta');

	const menuItems = [
		{ id: 'mi-cuenta', label: 'Mi cuenta', href: '/mi-cuenta' },
		{ id: 'mis-datos', label: 'Mis datos', href: '/mi-cuenta/mis-datos' },
		{ id: 'direcciones', label: 'Direcciones', href: '/mi-cuenta/direcciones' },
		{ id: 'mis-pedidos', label: 'Mis pedidos', href: '/mi-cuenta/mis-pedidos' },
		{
			id: 'mis-favoritos',
			label: 'Mis favoritos',
			href: '/mi-cuenta/mis-favoritos',
		},
		{ id: 'cerrar-sesion', label: 'Cerrar sesión', href: '/logout' },
	];

	return (
		<Layout title="Mi cuenta - Liwilu" description="Gestiona tu cuenta">
			<div className="bg-gray-50 min-h-screen py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-6">
						{/* Sidebar */}
						<aside className="lg:w-80">
							<nav className="bg-white rounded-2xl shadow-sm overflow-hidden">
								{menuItems.map((item, index) => (
									<Link
										key={item.id}
										href={item.href}
										className={`
											flex items-center justify-between px-6 py-4 
											transition-colors duration-200
											${index === 0 ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}
											${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}
										`}
									>
										<span className="font-medium">{item.label}</span>
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</Link>
								))}
							</nav>
						</aside>

						{/* Main Content */}
						<main className="flex-1">
							<div className="bg-white rounded-2xl shadow-sm p-8">
								<h1 className="text-3xl font-bold mb-8 border-b pb-4">
									Información de mi cuenta
								</h1>

								{/* Mis datos */}
								<section className="mb-8">
									<div className="flex items-center gap-3 mb-6">
										<div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
											<svg
												className="w-6 h-6 text-white"
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
										<h2 className="text-2xl font-bold">Mis datos</h2>
									</div>

									<div className="bg-gray-50 rounded-xl p-6">
										<h3 className="font-semibold text-gray-900 mb-2">
											Datos del comprador
										</h3>
										<p className="text-gray-700 mb-1">Gonzalo Vera</p>
										<p className="text-gray-600 mb-4">
											Gonzalo.vera.dlc@gmail.com
										</p>

										<div className="flex gap-4">
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
										<div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
											<svg
												className="w-6 h-6 text-white"
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
										<h2 className="text-2xl font-bold">
											Mi libreta de direcciones
										</h2>
									</div>

									<div className="grid md:grid-cols-2 gap-6">
										<div className="bg-gray-50 rounded-xl p-6">
											<h3 className="font-semibold text-gray-900 mb-2">
												Dirección de entrega principal
											</h3>
											<p className="text-gray-600 mb-4">
												Aún no guardaste una dirección de envío
											</p>
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

										<div className="bg-gray-50 rounded-xl p-6">
											<h3 className="font-semibold text-gray-900 mb-2">
												Dirección de facturación
											</h3>
											<p className="text-gray-600 mb-4">
												Aún no guardaste una dirección de envío
											</p>
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
								</section>

								{/* Botones de acción */}
								<div className="flex justify-between mt-8 pt-6 border-t">
									<button className="text-gray-500 hover:text-gray-700 font-medium">
										Volver
									</button>
									<button className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl transition">
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
