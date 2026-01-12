// lib/cart.ts
import { apiPost, apiGet, apiDelete, apiPut } from './auth/apiClient';

/**
 * Cart Product Interface
 */
export interface CartProduct {
    id: number;
    prestashopId: number;
    idArticle: number | null;
    name: string;
    price: number;
    priceWithTax: number;
    discountPrice: number | null;
    quantity: number;
    coverImage: string;
    subtotal: number;
}

/**
 * Cart Carrier Interface
 */
export interface CartCarrier {
    id: number;
    prestashopId: number;
    idReference: number;
    name: string;
    delay: string;
    isFree: boolean;
    logo: string;
    shippingCost: number;
}

/**
 * Cart Totals Interface
 */
export interface CartTotals {
    subtotal: number;
    shipping: number;
    total: number;
}

/**
 * Cart Data Interface
 */
export interface CartData {
    cartId?: string;
    sessionId?: string;
    products: CartProduct[];
    carrier: CartCarrier | null;
    totals: CartTotals;
    expiresAt: string | null;
}

/**
 * Add to Cart Response Interface
 */
export interface AddToCartResponse {
    success: boolean;
    message: string;
    data: CartData;
}

/**
 * Get Cart Response Interface
 */
export interface GetCartResponse {
    success: boolean;
    data: CartData;
}

/**
 * Add to Cart Request Interface
 */
export interface AddToCartRequest {
    productId: number;
    quantity: number;
}

/**
 * Add a product to the cart
 * @param productId - The ID of the product to add
 * @param quantity - The quantity to add
 * @returns Promise with the cart response
 */
export async function addToCart(productId: number, quantity: number): Promise<AddToCartResponse> {
    try {
        // Check if user is authenticated
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        const response = await apiPost('/cart/add', {
            productId,
            quantity
        }, {
            skipAuth: !accessToken // Skip auth if no token (guest mode)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error adding to cart: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // Save session ID if returned (for anonymous carts)
        if (data?.data?.sessionId && typeof window !== 'undefined') {
            localStorage.setItem('liwilu_session_id', data.data.sessionId);
            console.log('💾 Saved new session ID to localStorage:', data.data.sessionId);
        }

        return data;
    } catch (error) {
        console.error('Error in addToCart:', error);
        throw error;
    }
}

/**
 * Get the current cart
 * @returns Promise with the cart data
 */
export async function getCart(): Promise<GetCartResponse> {
    try {
        // Check if user is authenticated
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        const response = await apiGet('/cart', {
            skipAuth: !accessToken // Skip auth if no token (guest mode)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error fetching cart: ${response.statusText}`);
        }

        const data: GetCartResponse = await response.json();

        // Save/Update session ID if returned
        if (data?.data?.sessionId && typeof window !== 'undefined') {
            localStorage.setItem('liwilu_session_id', data.data.sessionId);
            console.log('💾 Updated session ID from getCart:', data.data.sessionId);
        }

        return data;
    } catch (error) {
        console.error('Error in getCart:', error);
        throw error;
    }
}

/**
 * Get cart count (total number of items)
 * @param cartData - The cart data
 * @returns Total number of items in cart
 */
export function getCartCount(cartData: CartData): number {
    return cartData.products.reduce((total, product) => total + product.quantity, 0);
}

/**
 * Get cart total price
 * @param cartData - The cart data
 * @returns Total price of cart
 */
export function getCartTotal(cartData: CartData): number {
    return cartData.totals.total;
}

/**
 * Update quantity of a product in the cart
 * @param productId - The ID of the product to update
 * @param quantity - The new quantity
 * @returns Promise with the updated cart response
 */
export async function updateCartQuantity(productId: number, quantity: number): Promise<AddToCartResponse> {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiPut(`/cart/product/${productId}`, { quantity }, {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error updating cart: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // Update session ID if returned (though apiPut handles header sending, we might want to update local if it changed)
        if (data?.data?.sessionId && typeof window !== 'undefined') {
            localStorage.setItem('liwilu_session_id', data.data.sessionId);
        }

        return data;
    } catch (error) {
        console.error('Error in updateCartQuantity:', error);
        throw error;
    }
}

/**
 * Remove a product from the cart
 * @param productId - The ID of the product to remove
 * @returns Promise with the updated cart response
 */
export async function removeFromCart(productId: number): Promise<AddToCartResponse> {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiDelete(`/cart/product/${productId}`, {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error removing from cart: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // Update session ID if returned
        if (data?.data?.sessionId && typeof window !== 'undefined') {
            localStorage.setItem('liwilu_session_id', data.data.sessionId);
        }

        return data;
    } catch (error) {
        console.error('Error in removeFromCart:', error);
        throw error;
    }
}

/**
 * Clear the entire cart
 * @returns Promise with the empty cart response
 */
export async function clearCart(): Promise<AddToCartResponse> {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiDelete('/cart', {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error clearing cart: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // Update session ID if returned
        if (data?.data?.sessionId && typeof window !== 'undefined') {
            localStorage.setItem('liwilu_session_id', data.data.sessionId);
        }

        return data;
    } catch (error) {
        console.error('Error in clearCart:', error);
        throw error;
    }
}

/**
 * Merge guest cart with user cart upon login
 * @returns Promise with the merged cart response
 */
export async function mergeCart(): Promise<AddToCartResponse> {
    try {
        console.log('🔄 Merging cart...');
        // The apiPost will automatically include Authorization header (if logged in) 
        // and X-Session-Id (from localStorage)
        const response = await apiPost('/cart/merge', {});

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error merging cart: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        console.log('✅ Cart results merged successfully:', data);

        // Update session ID if returned
        if (data?.data?.sessionId && typeof window !== 'undefined') {
            localStorage.setItem('liwilu_session_id', data.data.sessionId);
        }

        return data;
    } catch (error) {
        console.error('Error in mergeCart:', error);
        // We throw so the caller knows it failed, but often login proceeds anyway
        throw error;
    }
}
