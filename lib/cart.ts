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
    discountPrice?: number | null; // Changed to optional
    quantity: number;
    coverImage: string;
    subtotal: number;
    codArticle: string | null;
    reference: string; // Changed from string | null to string
    prestashopCombinationId: number | null; // Changed from optional to required
    variationImage?: string | null; // Added
    variationPrice?: number | null; // Added
    variationReference?: string | null; // Added
    variationAttributes?: any[]; // Added
    variationPriceWithTax?: number | null; // Added
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
 * Warehouse District Interface
 */
export interface WarehouseDistrict {
    codUbigeoAlm: string;
    desDistrito: string;
}

/**
 * Warehouse Map Item Interface
 */
export interface WarehouseMapItem {
    idAlmacen: number;
    codUbigeoAlm: string;
    desAlmacen: string;
    latitud: number;
    longitud: number;
}

/**
 * Cart Data Interface
 */
export interface CartData {
    cartId: string; // Changed from optional to required
    sessionId?: string;
    products: CartProduct[];
    carrier?: any; // Changed from CartCarrier | null to any
    totals: { // Changed to inline interface
        total: number;
        shipping: number;
        subtotal: number;
    };
    expiresAt?: string; // Changed from string | null to optional string
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
    prestashopCombinationId: number | null;
}

/**
 * Add a product to the cart
 * @param productId - The ID of the product to add
 * @param quantity - The quantity to add
 * @returns Promise with the cart response
 */
export async function addToCart(productId: number, quantity: number, prestashopCombinationId: number | null = null): Promise<AddToCartResponse> {
    try {
        // Check if user is authenticated
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        const response = await apiPost('/cart/add', {
            productId,
            quantity,
            prestashopCombinationId
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
export async function getCart(): Promise<GetCartResponse & { isExpired?: boolean }> {
    try {
        // Check if user is authenticated
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        const response = await apiGet('/cart', {
            skipAuth: !accessToken // Skip auth if no token (guest mode)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Si es 404 o el mensaje indica que no existe/expiró, lo tratamos como expirado
            if (response.status === 404 || errorData.message?.toLowerCase().includes('expired') || errorData.message?.toLowerCase().includes('not found') || errorData.message?.toLowerCase().includes('expirado')) {
                console.warn('🛒 Cart session expired or not found');
                return {
                    success: false,
                    isExpired: true,
                    data: { cartId: "", products: [], carrier: null, totals: { subtotal: 0, shipping: 0, total: 0 }, expiresAt: undefined }
                };
            }

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

/**
 * Get available shipping carriers
 * @returns Promise with the list of carriers
 */
export async function getCarriers(): Promise<{ success: boolean; data: CartCarrier[]; total: number }> {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiGet('/cart/carriers', {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error fetching carriers: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getCarriers:', error);
        throw error;
    }
}

/**
 * Update the cart carrier (shipping method)
 * @param carrierId - The ID of the carrier to select
 * @returns Promise with the updated cart response
 */
export async function updateCartCarrier(carrierId: number): Promise<AddToCartResponse> {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiPut('/cart/carrier', { carrierId }, {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error updating carrier: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // Update session ID if returned
        if (data?.data?.sessionId && typeof window !== 'undefined') {
            localStorage.setItem('liwilu_session_id', data.data.sessionId);
        }

        return data;
    } catch (error) {
        console.error('Error in updateCartCarrier:', error);
        throw error;
    }
}

/**
 * Get available warehouse districts for pickup
 * @returns Promise with the list of districts
 */
export async function getWarehouseDistricts(): Promise<{ success: boolean; data: WarehouseDistrict[]; total: number }> {
    try {
        const response = await apiGet('/orders/almacenes/distritos', {
            skipAuth: true // Usually public
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error fetching districts: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getWarehouseDistricts:', error);
        throw error;
    }
}

/**
 * Get warehouse map data for a specific district (ubigeo)
 * @param ubigeo - The ubigeo code of the district
 * @returns Promise with the list of warehouses and their coordinates
 */
export async function getWarehouseMap(ubigeo: string): Promise<{ success: boolean; data: WarehouseMapItem[]; total: number }> {
    try {
        const response = await apiGet(`/orders/almacenes/mapa/${ubigeo}`, {
            skipAuth: true
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error fetching warehouse map: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getWarehouseMap:', error);
        throw error;
    }
}
/**
 * Stock Validation Result Product Interface
 */
export interface StockValidationProduct {
    reference: string;
    nomArticulo: string;
    stock: number;
    stockSeleccionado: number;
    disponible: boolean;
    mensaje: string;
    coverImage: string;
}

/**
 * Stock Validation Result Warehouse Interface
 */
export interface StockValidationWarehouseResult {
    idAlmacen: number;
    desAlmacen: string;
    direccion: string;
    atencion: string;
    productos: StockValidationProduct[];
    todosDisponibles: boolean;
}

/**
 * Stock Validation Response Interface
 */
export interface StockValidationResponse {
    success: boolean;
    message: string;
    totalAlmacenes: number;
    totalProductos: number;
    resultadosPorAlmacen: StockValidationWarehouseResult[];
}

/**
 * Validate stock for products in the cart across specified warehouses
 * @param idAlmacenes - Array of warehouse IDs to validate against
 * @param products - Array of product objects with reference and quantity
 * @returns Promise with the stock validation results
 */
export async function validateStock(
    idAlmacenes: number[],
    products: { reference: string; quantity: number }[]
): Promise<StockValidationResponse> {
    try {
        const response = await apiPost('/orders/validar-stock', {
            idAlmacenes,
            productos: products
        }, {
            skipAuth: true // Explicitly public or handled by apiClient session
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error validating stock: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in validateStock:', error);
        throw error;
    }
}
