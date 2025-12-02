// components/RegisterModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import Button from './ui/Button';
import { PiWarningCircleFill } from "react-icons/pi";
import { registerSchema } from '../lib/registerSchema';
import { z } from 'zod';

interface RegisterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSwitchToLogin: () => void;
}

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterModal({
	isOpen,
	onClose,
	onSwitchToLogin,
}: RegisterModalProps) {
	// ✅ Estado completo del formulario
	const [formData, setFormData] = useState<RegisterFormValues>({
		firstName: '',
		lastName: '',
		email: '',
		emailConfirm: '',
		password: '',
		passwordConfirm: '',
		acceptTerms: false,
		receiveOffers: false,
	});

	const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({});

	// ✅ Resetear formulario cuando se cierra el modal
	useEffect(() => {
		if (!isOpen) {
			setFormData({
				firstName: '',
				lastName: '',
				email: '',
				emailConfirm: '',
				password: '',
				passwordConfirm: '',
				acceptTerms: false,
				receiveOffers: false,
			});
			setErrors({});
		}
	}, [isOpen]);

	// ✅ Manejador para inputs de texto
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		// Limpiar error del campo
		setErrors(prev => ({ ...prev, [name]: undefined }));
	};

	// ✅ Manejador para checkboxes
	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		setFormData(prev => ({ ...prev, [name]: checked }));
		// Limpiar error del campo
		setErrors(prev => ({ ...prev, [name]: undefined }));
	};

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

		// ✅ Validación con Zod
		const result = registerSchema.safeParse(formData);

		if (!result.success) {
			const formattedErrors = result.error.flatten().fieldErrors;
			const newErrors: Partial<Record<keyof RegisterFormValues, string>> = {};

			for (const key in formattedErrors) {
				const errorArray = formattedErrors[key as keyof typeof formattedErrors];
				if (errorArray && errorArray.length > 0) {
					newErrors[key as keyof RegisterFormValues] = errorArray[0];
				}
			}

			setErrors(newErrors);
			console.log("Errores de validación:", newErrors);
			return;
		}

		// Si es válido
		setErrors({});
		console.log("Registro exitoso!", formData);
		onClose();
	};

	const handleGoogleSignup = () => {
		console.log('Signup with Google');
	};

	const handleFacebookSignup = () => {
		console.log('Signup with Facebook');
	};

	// Helper para determinar la clase de borde
	const inputClasses = (fieldName: keyof RegisterFormValues) =>
		`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-primary focus:border-transparent transition ${errors[fieldName] ? 'border-error' : 'border-gray-300'
		}`;

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
							<h2 className="text-3xl font-bold text-primary-dark mb-2">
								Crea tu cuenta
							</h2>
							<p className="text-gray-600 text-sm">
								Regístrate para comprar más rápido, hacer seguimiento a tus
								pedidos y recibir promociones exclusivas.
							</p>
						</div>

						{/* Formulario */}
						<form onSubmit={handleSubmit} className="space-y-4" noValidate>
							{/* Nombre y Apellido */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="firstName"
										className="block text-sm font-semibold text-primary-dark mb-2"
									>
										Nombre
									</label>
									<input
										name="firstName"
										type="text"
										id="firstName"
										value={formData.firstName}
										onChange={handleChange}
										placeholder="Gonzalo"
										className={inputClasses('firstName')}
									/>
									{errors.firstName && (
										<p className="text-error text-xs mt-1 flex items-start gap-1">
											<PiWarningCircleFill size={16} /> {errors.firstName}
										</p>
									)}
								</div>

								<div>
									<label
										htmlFor="lastName"
										className="block text-sm font-semibold text-primary-dark mb-2"
									>
										Apellido
									</label>
									<input
										name="lastName"
										type="text"
										id="lastName"
										value={formData.lastName}
										onChange={handleChange}
										placeholder="García"
										className={inputClasses('lastName')}
									/>
									{errors.lastName && (
										<p className="text-error text-xs mt-1 flex items-start gap-1">
											<PiWarningCircleFill size={16} /> {errors.lastName}
										</p>
									)}
								</div>
							</div>

							{/* Email */}
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-semibold text-primary-dark mb-2"
								>
									Correo electrónico
								</label>
								<input
									name="email"
									type="email"
									id="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="correo@ejemplo.com"
									className={inputClasses('email')}
								/>
								{errors.email && (
									<p className="text-error text-xs mt-1 flex items-start gap-1">
										<PiWarningCircleFill size={16} /> {errors.email}
									</p>
								)}
							</div>

							{/* Confirmar Email */}
							<div>
								<label
									htmlFor="emailConfirm"
									className="block text-sm font-semibold text-primary-dark mb-2"
								>
									Confirmar correo electrónico
								</label>
								<input
									name="emailConfirm"
									type="email"
									id="emailConfirm"
									value={formData.emailConfirm}
									onChange={handleChange}
									placeholder="correo@ejemplo.com"
									className={inputClasses('emailConfirm')}
								/>
								{errors.emailConfirm && (
									<p className="text-error text-xs mt-1 flex items-start gap-1">
										<PiWarningCircleFill size={16} /> {errors.emailConfirm}
									</p>
								)}
							</div>

							{/* Contraseña */}
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-semibold text-primary-dark mb-2"
								>
									Contraseña
								</label>
								<input
									name="password"
									type="password"
									id="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="Mínimo 6 caracteres"
									className={inputClasses('password')}
								/>
								{errors.password && (
									<p className="text-error text-xs mt-1 flex items-start gap-1">
										<PiWarningCircleFill size={16} /> {errors.password}
									</p>
								)}
							</div>

							{/* Confirmar Contraseña */}
							<div>
								<label
									htmlFor="passwordConfirm"
									className="block text-sm font-semibold text-primary-dark mb-2"
								>
									Confirmar contraseña
								</label>
								<input
									name="passwordConfirm"
									type="password"
									id="passwordConfirm"
									value={formData.passwordConfirm}
									onChange={handleChange}
									placeholder="Repite tu contraseña"
									className={inputClasses('passwordConfirm')}
								/>
								{errors.passwordConfirm && (
									<p className="text-error text-xs mt-1 flex items-start gap-1">
										<PiWarningCircleFill size={16} /> {errors.passwordConfirm}
									</p>
								)}
							</div>

							{/* Checkboxes */}
							<div className="space-y-3">
								{/* Aceptar Términos */}
								<label className="flex items-start gap-3 cursor-pointer">
									<input
										type="checkbox"
										name="acceptTerms"
										checked={formData.acceptTerms}
										onChange={handleCheckboxChange}
										className={`mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary ${errors.acceptTerms ? 'border-error' : ''
											}`}
									/>
									<span className="text-sm text-gray-700">
										Acepto los Términos y Condiciones y la política de Privacidad
									</span>
								</label>
								{errors.acceptTerms && (
									<p className="text-error text-xs mt-1 flex items-start gap-1">
										<PiWarningCircleFill size={16} /> {errors.acceptTerms}
									</p>
								)}

								{/* Recibir Ofertas */}
								<label className="flex items-start gap-3 cursor-pointer">
									<input
										type="checkbox"
										name="receiveOffers"
										checked={formData.receiveOffers}
										onChange={handleCheckboxChange}
										className={`mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary ${errors.receiveOffers ? 'border-error' : ''
											}`}
									/>
									<span className="text-sm text-gray-700">
										Quiero recibir ofertas y beneficios exclusivos
									</span>
								</label>
								{errors.receiveOffers && (
									<p className="text-error text-xs mt-1 flex items-start gap-1">
										<PiWarningCircleFill size={16} /> {errors.receiveOffers}
									</p>
								)}
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
							<Button variant="primary" size="md" className="w-full" type="submit">
								Registrarse
							</Button>
						</form>

						{/* Divider */}
						<div className="flex items-center my-6">
							<div className="flex-1 border-t border-gray-300"></div>
							<span className="px-4 text-sm text-gray-500">O</span>
							<div className="flex-1 border-t border-gray-300"></div>
						</div>

						{/* Social Login */}
						<div className="space-y-3">
							<button
								onClick={handleGoogleSignup}
								className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-sm hover:bg-gray-50 transition"
							>
								<FcGoogle size={20} />
								<span className="text-gray-700 font-medium">
									Registrarse con Google
								</span>
							</button>

							<button
								onClick={handleFacebookSignup}
								className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-sm hover:bg-gray-50 transition"
							>
								<FaFacebook size={20} className="text-blue-600" />
								<span className="text-gray-700 font-medium">
									Registrarse con Facebook
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
					from { opacity: 0; }
					to { opacity: 1; }
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