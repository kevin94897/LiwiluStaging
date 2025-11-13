// components/RegisterModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

interface RegisterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSwitchToLogin: () => void;
}

export default function RegisterModal({
	isOpen,
	onClose,
	onSwitchToLogin,
}: RegisterModalProps) {
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		emailConfirm: '',
		password: '',
		passwordConfirm: '',
		acceptTerms: false,
		receiveOffers: false,
	});

	// Cerrar con tecla ESC
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};

		if (isOpen) {
			window.addEventListener('keydown', handleEsc);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			window.removeEventListener('keydown', handleEsc);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validaciones
		if (formData.email !== formData.emailConfirm) {
			alert('Los correos electrónicos no coinciden');
			return;
		}

		if (formData.password !== formData.passwordConfirm) {
			alert('Las contraseñas no coinciden');
			return;
		}

		if (!formData.acceptTerms) {
			alert('Debes aceptar los términos y condiciones');
			return;
		}

		console.log('Register:', formData);
		// Aquí iría tu lógica de registro
		onClose();
	};

	const handleGoogleSignup = () => {
		console.log('Signup with Google');
	};

	const handleFacebookSignup = () => {
		console.log('Signup with Facebook');
	};

	return (
		<>
			{/* Overlay */}
			<div
				className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div
					className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-scale-in overflow-y-auto max-h-[90vh] relative"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="p-8">
						{/* Header */}
						<div className="mb-6">
							<h2 className="text-3xl font-bold text-gray-900 mb-2">
								Crea tu cuenta
							</h2>
							<p className="text-gray-600 text-sm">
								Regístrate para comprar más rápido, hacer seguimiento a tus
								pedidos y recibir promociones exclusivas.
							</p>
						</div>

						{/* Formulario */}
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Nombre y Apellido */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="firstName"
										className="block text-sm font-semibold text-gray-900 mb-2"
									>
										Nombre
									</label>
									<input
										type="text"
										id="firstName"
										value={formData.firstName}
										onChange={(e) =>
											setFormData({ ...formData, firstName: e.target.value })
										}
										placeholder="Gonzalo"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
										required
									/>
								</div>

								<div>
									<label
										htmlFor="lastName"
										className="block text-sm font-semibold text-gray-900 mb-2"
									>
										Apellido
									</label>
									<input
										type="text"
										id="lastName"
										value={formData.lastName}
										onChange={(e) =>
											setFormData({ ...formData, lastName: e.target.value })
										}
										placeholder="Gonzalo"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
										required
									/>
								</div>
							</div>

							{/* Email */}
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-semibold text-gray-900 mb-2"
								>
									Correo electrónico
								</label>
								<input
									type="email"
									id="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									placeholder="Ingrese tu correo electrónico"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
									required
								/>
							</div>

							{/* Confirmar Email */}
							<div>
								<label
									htmlFor="emailConfirm"
									className="block text-sm font-semibold text-gray-900 mb-2"
								>
									Confirmar correo electrónico
								</label>
								<input
									type="email"
									id="emailConfirm"
									value={formData.emailConfirm}
									onChange={(e) =>
										setFormData({ ...formData, emailConfirm: e.target.value })
									}
									placeholder="Ingrese tu correo electrónico"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
									required
								/>
							</div>

							{/* Contraseña */}
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-semibold text-gray-900 mb-2"
								>
									Contraseña
								</label>
								<input
									type="password"
									id="password"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									placeholder="Crea una contraseña segura"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
									required
								/>
							</div>

							{/* Confirmar Contraseña */}
							<div>
								<label
									htmlFor="passwordConfirm"
									className="block text-sm font-semibold text-gray-900 mb-2"
								>
									Confirmar contraseña
								</label>
								<input
									type="password"
									id="passwordConfirm"
									value={formData.passwordConfirm}
									onChange={(e) =>
										setFormData({
											...formData,
											passwordConfirm: e.target.value,
										})
									}
									placeholder="Repite tu contraseña"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
									required
								/>
							</div>

							{/* Checkboxes */}
							<div className="space-y-3">
								<label className="flex items-start gap-3 cursor-pointer">
									<input
										type="checkbox"
										checked={formData.acceptTerms}
										onChange={(e) =>
											setFormData({ ...formData, acceptTerms: e.target.checked })
										}
										className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
										required
									/>
									<span className="text-sm text-gray-700">
										Acepto los Términos y Condiciones y la política de Privacidad
									</span>
								</label>

								<label className="flex items-start gap-3 cursor-pointer">
									<input
										type="checkbox"
										checked={formData.receiveOffers}
										onChange={(e) =>
											setFormData({
												...formData,
												receiveOffers: e.target.checked,
											})
										}
										className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
									/>
									<span className="text-sm text-gray-700">
										Quiero recibir ofertas y beneficios exclusivos
									</span>
								</label>
							</div>

							{/* Olvidó contraseña */}
							<div className="text-right">
								<button
									type="button"
									className="text-sm text-primary hover:text-primary-dark font-medium"
								>
									¿Olvidó la contraseña?
								</button>
							</div>

							{/* Botón Submit */}
							<button
								type="submit"
								className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-full transition"
							>
								Registrarse
							</button>
						</form>

						{/* Divider */}
						<div className="flex items-center my-6">
							<div className="flex-1 border-t border-gray-300"></div>
							<span className="px-4 text-sm text-gray-500">Or</span>
							<div className="flex-1 border-t border-gray-300"></div>
						</div>

						{/* Social Login */}
						<div className="space-y-3">
							<button
								onClick={handleGoogleSignup}
								className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
							>
								<FcGoogle size={20} />
								<span className="text-gray-700 font-medium">
									Inicie sesión con Google
								</span>
							</button>

							<button
								onClick={handleFacebookSignup}
								className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
							>
								<FaFacebook size={20} className="text-blue-600" />
								<span className="text-gray-700 font-medium">
									Inicie sesión con Facebook
								</span>
							</button>
						</div>

						{/* Link a Login */}
						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								¿Ya tienes cuenta?{' '}
								<button
									onClick={() => {
										onClose();
										onSwitchToLogin();
									}}
									className="text-primary hover:text-primary-dark font-semibold"
								>
									Inicia sesión aquí
								</button>
							</p>
						</div>
					</div>

					{/* Botón cerrar (X) */}
					<button
						onClick={onClose}
						className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
						aria-label="Cerrar"
					>
						<svg
							className="w-5 h-5 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			</div>

			<style jsx>{`
				@keyframes fade-in {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}
				@keyframes scale-in {
					from {
						opacity: 0;
						transform: scale(0.95) translateY(-10px);
					}
					to {
						opacity: 1;
						transform: scale(1) translateY(0);
					}
				}
				.animate-fade-in {
					animation: fade-in 0.2s ease-out;
				}
				.animate-scale-in {
					animation: scale-in 0.3s ease-out;
				}
			`}</style>
		</>
	);
}