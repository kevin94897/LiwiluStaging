// context/CartContext.tsx
'use client';

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react';
import { Product } from '@/lib/prestashop';

export interface CartItem {
	product: Product;
	quantity: number;
}

interface CartContextType {
	items: CartItem[];
	addToCart: (product: Product, quantity?: number) => void;
	removeFromCart: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;
	getCartCount: () => number;
	getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);

	// Cargar carrito desde localStorage al iniciar
	useEffect(() => {
		const savedCart = localStorage.getItem('liwilu_cart');
		if (savedCart) {
			try {
				setItems(JSON.parse(savedCart));
			} catch (error) {
				console.error('Error al cargar el carrito:', error);
			}
		}
	}, []);

	// Guardar carrito en localStorage cada vez que cambie
	useEffect(() => {
		if (items.length > 0) {
			localStorage.setItem('liwilu_cart', JSON.stringify(items));
		} else {
			localStorage.removeItem('liwilu_cart');
		}
	}, [items]);

	const addToCart = (product: Product, quantity: number = 1) => {
		setItems((prevItems) => {
			const existingItem = prevItems.find(
				(item) => item.product.id === product.id
			);

			if (existingItem) {
				// Si el producto ya existe, aumentar la cantidad
				return prevItems.map((item) =>
					item.product.id === product.id
						? { ...item, quantity: item.quantity + quantity }
						: item
				);
			} else {
				// Si es nuevo, agregarlo
				return [...prevItems, { product, quantity }];
			}
		});
	};

	const removeFromCart = (productId: string) => {
		setItems((prevItems) =>
			prevItems.filter((item) => item.product.id !== productId)
		);
	};

	const updateQuantity = (productId: string, quantity: number) => {
		if (quantity <= 0) {
			removeFromCart(productId);
			return;
		}

		setItems((prevItems) =>
			prevItems.map((item) =>
				item.product.id === productId ? { ...item, quantity } : item
			)
		);
	};

	const clearCart = () => {
		setItems([]);
		localStorage.removeItem('liwilu_cart');
	};

	const getCartCount = () => {
		return items.reduce((total, item) => total + item.quantity, 0);
	};

	const getCartTotal = () => {
		return items.reduce((total, item) => {
			const price = parseFloat(item.product.price || '0');
			return total + price * item.quantity;
		}, 0);
	};

	return (
		<CartContext.Provider
			value={{
				items,
				addToCart,
				removeFromCart,
				updateQuantity,
				clearCart,
				getCartCount,
				getCartTotal,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error('useCart debe ser usado dentro de un CartProvider');
	}
	return context;
}
