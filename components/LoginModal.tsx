// components/LoginModal.tsx
"use client";

import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { PiWarningCircleFill } from "react-icons/pi";
import { FaFacebook } from "react-icons/fa";
import Button from "./ui/Button";
import { loginSchema, LoginSchemaType } from "../lib/loginSchema";
import { loginUser } from "../pages/api/auth/login"; // 🔹 Importar función de auth
import ForgotPasswordModal from "./ForgotPasswordModal";

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSwitchToRegister: () => void;
	fromTrimegisto?: boolean;
}

export default function LoginModal({
	isOpen,
	onClose,
	onSwitchToRegister,
	fromTrimegisto = false,
}: LoginModalProps) {
	// ✅ Estado del formulario
	const [formData, setFormData] = useState<LoginSchemaType>({
		email: "",
		password: "",
	});

	const [errors, setErrors] = useState<
		Partial<Record<keyof LoginSchemaType, string>>
	>({});

	const [isLoading, setIsLoading] = useState(false); // 🔹 Estado de carga

	const [showForgotPassword, setShowForgotPassword] = useState(false);

	// ✅ Manejador de cambios
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Limpiar error del campo
		setErrors((prev) => ({ ...prev, [name]: undefined }));
	};

	// ✅ Resetear formulario cuando se cierra el modal
	useEffect(() => {
		if (!isOpen) {
			setFormData({ email: "", password: "" });
			setErrors({});
			setIsLoading(false);
			setShowForgotPassword(false);
		}
	}, [isOpen]);

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		if (isOpen) {
			window.addEventListener("keydown", handleEsc);
			document.body.style.overflow = "hidden";
		}

		return () => {
			window.removeEventListener("keydown", handleEsc);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	if (showForgotPassword) {
		return (
			<ForgotPasswordModal
				isOpen={true}
				onClose={onClose}
				onBackToLogin={() => setShowForgotPassword(false)}
			/>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// 1️⃣ Validar con Zod
		const result = loginSchema.safeParse(formData);

		if (!result.success) {
			const formattedErrors = result.error.flatten().fieldErrors;
			const newErrors: Partial<Record<keyof LoginSchemaType, string>> = {};

			for (const key in formattedErrors) {
				const errorArray = formattedErrors[key as keyof typeof formattedErrors];
				if (errorArray && errorArray.length > 0) {
					newErrors[key as keyof LoginSchemaType] = errorArray[0];
				}
			}

			setErrors(newErrors);
			console.log("Errores de validación:", newErrors);
			return;
		}

		// 2️⃣ Enviar al backend usando la función de auth.ts
		setIsLoading(true);

		try {
			await loginUser(formData);
			// 🔹 La función loginUser automáticamente:
			// - Guarda los tokens y datos del usuario
			// - Recarga la página
			// - Redirige al home
			// Por lo tanto, no necesitamos hacer nada más aquí
		} catch (err) {
			setIsLoading(false);
			console.error("Error en login:", err);

			const errorMessage = err instanceof Error
				? err.message
				: "Error de conexión con el servidor";

			setErrors({ password: errorMessage });
		}
	};

	const handleGoogleLogin = () => {
		console.log("Login with Google");
	};

	const handleFacebookLogin = () => {
		console.log("Login with Facebook");
	};

	return (
		<>
			{/* Overlay */}
			<div
				className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
				onClick={onClose}
			/>

			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div
					className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-scale-in overflow-y-auto max-h-[90vh] relative"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="p-8">
						{/* Header */}
						<div className="mb-6">
							<h2 className="text-3xl font-bold text-primary-dark mb-2">
								Inicia sesión
							</h2>
							<p className="text-gray-600 text-sm">
								{fromTrimegisto
									? "Ingresa tus credenciales para acceder a Trimegisto"
									: "Accede a tu cuenta para seguir tus pedidos y comprar más rápido"}
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4" noValidate>
							{/* Email */}
							<div>
								<label className="block text-sm font-semibold text-primary-dark mb-2">
									Correo electrónico
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									disabled={isLoading}
									placeholder="correo@ejemplo.com"
									className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-primary focus:border-transparent transition ${errors.email ? "border-red-500" : "border-gray-300"
										} ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
								/>
								{errors.email && (
									<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
										<PiWarningCircleFill size={16} /> {errors.email}
									</p>
								)}
							</div>

							{/* Password */}
							<div>
								<label className="block text-sm font-semibold text-primary-dark mb-2">
									Contraseña
								</label>
								<input
									type="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									disabled={isLoading}
									placeholder="Mínimo 6 caracteres"
									className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-primary focus:border-transparent transition ${errors.password ? "border-red-500" : "border-gray-300"
										} ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
								/>
								{errors.password && (
									<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
										<PiWarningCircleFill size={16} /> {errors.password}
									</p>
								)}
							</div>

							<div className="text-right">
								<button
									type="button"
									className="text-sm text-primary hover:text-primary-dark font-medium disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={isLoading}
									onClick={() => setShowForgotPassword(true)}
								>
									¿Olvidó la contraseña?
								</button>
							</div>

							<Button
								variant="primary"
								size="md"
								className="w-full"
								type="submit"
								disabled={isLoading}
							>
								{isLoading ? (
									<div className="flex items-center justify-center gap-2">
										<svg
											className="animate-spin h-5 w-5"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										<span>Iniciando sesión...</span>
									</div>
								) : (
									"Iniciar sesión"
								)}
							</Button>
						</form>

						{/* Solo si no es Trimegisto */}
						{!fromTrimegisto && (
							<>
								<div className="flex items-center my-6">
									<div className="flex-1 border-t border-gray-300"></div>
									<span className="px-4 text-sm text-gray-500">O</span>
									<div className="flex-1 border-t border-gray-300"></div>
								</div>

								<div className="space-y-3">
									<button
										onClick={handleGoogleLogin}
										disabled={isLoading}
										className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<FcGoogle size={20} />
										<span className="text-gray-700 font-medium">
											Inicie sesión con Google
										</span>
									</button>

									<button
										onClick={handleFacebookLogin}
										disabled={isLoading}
										className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<FaFacebook size={20} className="text-blue-600" />
										<span className="text-gray-700 font-medium">
											Inicie sesión con Facebook
										</span>
									</button>
								</div>
							</>
						)}

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								¿Aún no tienes cuenta?{" "}
								<button
									onClick={() => {
										onClose();
										onSwitchToRegister();
									}}
									disabled={isLoading}
									className="text-primary hover:text-primary-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Regístrate aquí
								</button>
							</p>
						</div>
					</div>

					<button
						onClick={onClose}
						disabled={isLoading}
						className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
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