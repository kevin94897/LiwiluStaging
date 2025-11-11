// components/AddToCartModal.tsx
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, getProductImageUrl, formatPrice } from '@/lib/prestashop';

interface AddToCartModalProps {
	isOpen: boolean;
	onClose: () => void;
	product: Product;
}

export default function AddToCartModal({
	isOpen,
	onClose,
	product,
}: AddToCartModalProps) {
	// Cerrar con tecla ESC
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};

		if (isOpen) {
			window.addEventListener('keydown', handleEsc);
			// Prevenir scroll del body
			document.body.style.overflow = 'hidden';
		}

		return () => {
			window.removeEventListener('keydown', handleEsc);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const imageId = product.associations?.images?.[0]?.id;
	const imageUrl = imageId
		? getProductImageUrl(product.id, imageId)
		: '/no-image.png';

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
					className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-scale-in"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header con ícono de check */}
					<div className="flex items-center gap-3 px-6 pt-6 pb-4">
						<div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
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
									d="M12 4v16m8-8H4"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900">
							Tu producto ha sido añadido al carrito
						</h3>
					</div>

					{/* Contenido del producto */}
					<div className="px-6 pb-6">
						<div className="flex gap-4 mb-6">
							{/* Imagen del producto */}
							<div className="relative w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
								<Image
									src={imageUrl}
									alt={product.name?.[0]?.value || 'Producto'}
									fill
									className="object-contain"
									unoptimized
								/>
							</div>

							{/* Info del producto */}
							<div className="flex-1">
								<h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
									{product.name?.[0]?.value || 'Producto'}
								</h4>
								<div className="flex items-baseline gap-2">
									<span className="text-2xl font-bold text-gray-900">
										{formatPrice(product.price || '0')}
									</span>
									<span className="text-sm text-gray-400 line-through">
										{formatPrice(parseFloat(product.price || '0') * 1.5)}
									</span>
								</div>
							</div>
						</div>

						{/* Botones */}
						<div className="flex gap-3">
							<button
								onClick={onClose}
								className="flex-1 px-6 py-3 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary/5 transition"
							>
								Seguir comprando
							</button>
							<Link href="/carrito" className="flex-1">
								<button className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition">
									Ir a carrito
								</button>
							</Link>
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
