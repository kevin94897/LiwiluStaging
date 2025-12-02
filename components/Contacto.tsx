// components/Contacto.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Button from './ui/Button';
import { contactoSchema, ContactoSchemaType } from '@/lib/componentcontactoSchema';
import { PiWarningCircleFill } from 'react-icons/pi';

export default function Contacto() {
	const [formData, setFormData] = useState<ContactoSchemaType>({
		celular: '',
		documento: '',
		aceptaPrivacidad: false
	});

	const [errors, setErrors] = useState<Partial<Record<keyof ContactoSchemaType, string>>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;

		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));

		// Limpiar error del campo
		setErrors(prev => ({ ...prev, [name]: undefined }));
	};

	const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, ''); // Solo números
		if (value.length <= 9) {
			setFormData(prev => ({ ...prev, celular: value }));
			setErrors(prev => ({ ...prev, celular: undefined }));
		}
	};

	const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, ''); // Solo números
		if (value.length <= 11) {
			setFormData(prev => ({ ...prev, documento: value }));
			setErrors(prev => ({ ...prev, documento: undefined }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Validación con Zod
		const result = contactoSchema.safeParse(formData);

		if (!result.success) {
			const formattedErrors = result.error.flatten().fieldErrors;
			const newErrors: Partial<Record<keyof ContactoSchemaType, string>> = {};

			for (const key in formattedErrors) {
				const errorArray = formattedErrors[key as keyof typeof formattedErrors];
				if (errorArray && errorArray.length > 0) {
					newErrors[key as keyof ContactoSchemaType] = errorArray[0];
				}
			}

			setErrors(newErrors);
			setIsSubmitting(false);
			console.log("Errores de validación:", newErrors);
			return;
		}

		// Si es válido
		setErrors({});
		console.log('Solicitud de contacto exitosa:', formData);

		try {
			// Aquí iría la llamada a tu API
			// await fetch('/api/contacto', { method: 'POST', body: JSON.stringify(formData) });

			alert('✅ Solicitud enviada. Un asesor se contactará pronto.');

			// Resetear formulario
			setFormData({
				celular: '',
				documento: '',
				aceptaPrivacidad: false
			});
		} catch (error) {
			console.error('Error al enviar:', error);
			alert('❌ Hubo un error. Intenta nuevamente.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="md:min-h-screen flex flex-col md:flex-row">
			{/* Lado Izquierdo */}
			<div className="relative w-full md:w-1/2 flex items-center justify-center px-8 py-16 overflow-hidden">
				{/* Imagen de fondo */}
				<Image
					src="/images/liwilu_contacto_banner.png"
					alt="Productos de limpieza"
					fill
					className="object-cover"
					priority
				/>

				{/* Contenido */}
				<div className="relative z-10 text-white max-w-md text-center md:text-left">
					<Image
						src="/images/liwilu_logo.png"
						alt="Liwilu"
						width={130}
						height={40}
						className="mb-6 mx-auto md:mx-0"
						priority
					/>
					<h2 className="text-3xl md:text-4xl font-semibold leading-tight">
						Compra al por
					</h2>
					<h1 className="text-5xl md:text-6xl font-extrabold leading-[65px] whitespace-nowrap">
						MAYOR
					</h1>
				</div>
			</div>

			{/* Lado Derecho - Formulario */}
			<div className="w-full md:w-1/2 bg-primary flex items-center justify-center p-10">
				<form onSubmit={handleSubmit} className="w-full max-w-md text-white space-y-6">
					<h2 className="text-3xl md:text-5xl font-bold text-white text-left md:text-left max-w-44">
						¿Estás interesado(a)?
					</h2>

					{/* Campo: Número de celular */}
					<div>
						<input
							type="tel"
							name="celular"
							value={formData.celular}
							onChange={handleCelularChange}
							className={`w-full bg-transparent border-b focus:outline-none text-white placeholder-white/60 py-2 ${errors.celular
								? 'border-red-500 focus:border-red-500'
								: 'border-white/70 focus:border-white'
								}`}
							placeholder="Numero de celular (9 dígitos)"
							maxLength={9}
						/>
						{/* {errors.celular && (
							<p className="text-red-200 text-xs mt-1 flex items-center gap-1">
								<PiWarningCircleFill size={14} /> {errors.celular}
							</p>
						)} */}
					</div>

					{/* Campo: DNI / CE / RUC */}
					<div>
						<input
							type="text"
							name="documento"
							value={formData.documento}
							onChange={handleDocumentoChange}
							className={`w-full bg-transparent border-b focus:outline-none text-white placeholder-white/60 py-2 ${errors.documento
								? 'border-red-500 focus:border-red-500'
								: 'border-white/70 focus:border-white'
								}`}
							placeholder="DNI / CE / RUC"
							maxLength={11}
						/>
						{/* {errors.documento && (
							<p className="text-red-200 text-xs mt-1 flex items-center gap-1">
								<PiWarningCircleFill size={14} /> {errors.documento}
							</p>
						)} */}
					</div>

					{/* Checkbox */}
					<div>
						<div className="flex items-start gap-2 text-sm mt-4">
							<input
								type="checkbox"
								id="privacidad"
								name="aceptaPrivacidad"
								checked={formData.aceptaPrivacidad}
								onChange={handleChange}
								className={`mt-1 accent-white ${errors.aceptaPrivacidad ? 'outline outline-2 outline-red-300' : ''
									}`}
							/>
							<label htmlFor="privacidad" className="text-white/90 leading-snug">
								He leído y acepto las{' '}
								<a href="/privacidad" className="underline text-white hover:text-white/80">
									políticas de privacidad
								</a>
							</label>
						</div>
						{errors.aceptaPrivacidad && (
							<p className="text-red-500 text-xs mt-1 flex items-center gap-1">
								<PiWarningCircleFill size={14} /> {errors.aceptaPrivacidad}
							</p>
						)}
					</div>

					{/* Botón */}
					<div className="text-center pt-2">
						<Button
							variant="secondary"
							size="md"
							className='w-full'
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<span className="flex items-center justify-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
									Enviando...
								</span>
							) : (
								'Solicite un asesor'
							)}
						</Button>
					</div>
				</form>
			</div>
		</section>
	);
}