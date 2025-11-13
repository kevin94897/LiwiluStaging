// components/LoginModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSwitchToRegister: () => void;
}

export default function LoginModal({
	isOpen,
	onClose,
	onSwitchToRegister,
}: LoginModalProps) {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
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
		console.log('Login:', formData);
		// Aquí iría tu lógica de autenticación
		onClose();
	};

	const handleGoogleLogin = () => {
		console.log('Login with Google');
		// Implementar OAuth con Google
	};

	const handleFacebookLogin = () => {
		console.log('Login with Facebook');
		// Implementar OAuth con Facebook
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
								Inicia sesión
							</h2>
							<p className="text-gray-600 text-sm">
								Accede a tu cuenta para seguir tus pedidos y comprar más rápido
							</p>
						</div>

						{/* Formulario */}
						<form onSubmit={handleSubmit} className="space-y-4">
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
								Iniciar sesión
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
								onClick={handleGoogleLogin}
								className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
							>
								<FcGoogle size={20} />
								<span className="text-gray-700 font-medium">
									Inicie sesión con Google
								</span>
							</button>

							<button
								onClick={handleFacebookLogin}
								className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
							>
								<FaFacebook size={20} className="text-blue-600" />
								<span className="text-gray-700 font-medium">
									Inicie sesión con Facebook
								</span>
							</button>
						</div>

						{/* Link a Registro */}
						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								¿Aún no tienes cuenta?{' '}
								<button
									onClick={() => {
										onClose();
										onSwitchToRegister();
									}}
									className="text-primary hover:text-primary-dark font-semibold"
								>
									Regístrate aquí
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