import Image from 'next/image';
import Button from './ui/Button';

export default function Contacto() {
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

			<div className="w-full md:w-1/2 bg-primary flex items-center justify-center p-10">
				<form className="w-full max-w-md text-white space-y-6">
					<h2 className="text-3xl md:text-5xl font-bold text-white text-left md:text-left max-w-44">
						¿Estás interesado(a)?
					</h2>

					{/* Campo: Número de celular */}
					<div>
						<input
							type="tel"
							className="w-full bg-transparent border-b border-white/70 focus:outline-none focus:border-white text-white placeholder-white/60 py-2"
							placeholder="Numero de celular"
							required
						/>
					</div>

					{/* Campo: DNI / CE / RUC */}
					<div>
						<input
							type="text"
							className="w-full bg-transparent border-b border-white/70 focus:outline-none focus:border-white text-white placeholder-white/60 py-2"
							placeholder="DNI / CE / RUC"
							required
						/>
					</div>

					{/* Checkbox */}
					<div className="flex items-start gap-2 text-sm mt-4">
						<input
							type="checkbox"
							id="privacidad"
							className="mt-1 accent-white"
							required
						/>
						<label htmlFor="privacidad" className="text-white/90 leading-snug">
							He leído y acepto las{' '}
							<a href="#" className="underline text-white">
								políticas de privacidad
							</a>
						</label>
					</div>

					{/* Botón */}
					<div className="text-center">
						<Button variant="secondary" size="md">
							Solicite un asesor
						</Button>
					</div>
				</form>
			</div>
		</section>
	);
}
