import '@/styles/globals.css';
import '@/styles/slider.css';
import type { AppProps } from 'next/app';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast'; // Opcional

export default function App({ Component, pageProps }: AppProps) {
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
