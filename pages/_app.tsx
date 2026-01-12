import '@/styles/globals.css';
import '@/styles/slider.css';
import type { AppProps } from 'next/app';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast'; // Opcional
import { useEffect } from 'react';
import { initializeAuth } from '@/lib/auth/tokenManager';

import { Outfit } from 'next/font/google';

const outfit = Outfit({
	subsets: ['latin'],
	variable: '--font-outfit',
});

export default function App({ Component, pageProps }: AppProps) {
	// 🆕 Inicializar sistema de renovación de tokens al cargar la app
	useEffect(() => {
		initializeAuth();
	}, []);

	return (
		<CartProvider>
			<main className={`${outfit.variable} font-sans`}>
				<Component {...pageProps} />
			</main>
			{/* Opcional: Notificaciones toast */}
			<Toaster
				position="bottom-right"
				toastOptions={{
					className: 'liwilu-toast',
					duration: 3000,
				}}
			/>
		</CartProvider>
	);
}
