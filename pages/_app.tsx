import '@/styles/globals.css';
import '@/styles/slider.css';
import type { AppProps } from 'next/app';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast'; // Opcional
import { useEffect } from 'react';
import { initializeAuth } from '@/lib/auth/tokenManager';

export default function App({ Component, pageProps }: AppProps) {
	// 🆕 Inicializar sistema de renovación de tokens al cargar la app
	useEffect(() => {
		initializeAuth();
	}, []);

	return (
		<CartProvider>
			<Component {...pageProps} />
			{/* Opcional: Notificaciones toast */}
			<Toaster
				position="top-right"
				toastOptions={{
					duration: 3000,
					style: {
						background: '#4CAF50',
						color: '#fff',
					},
					success: {
						iconTheme: {
							primary: '#fff',
							secondary: '#4CAF50',
						},
					},
				}}
			/>
		</CartProvider>
	);
}
