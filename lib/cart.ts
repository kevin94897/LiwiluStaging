import { apiPost, apiGet, apiDelete, apiPut } from './auth/apiClient';

/**
 * Cart Product Interface
 */
export interface CartProduct {
    id: number;
    idProductCart: number; // ID of the cart item
    prestashopId: number;
    idArticle: number | null;
    idVariation?: number | null; // ID for variation-specific operations
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
        const response = await apiPost('/cart/add', {
            productId,
            quantity,
            prestashopCombinationId
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error adding to cart: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // session ID is now automatically saved via httpOnly cookie by the proxy
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
        const response = await apiGet('/cart');

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

        // session ID is now automatically updated via httpOnly cookie by the proxy
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
        const response = await apiPut(`/cart/product/${productId}`, { quantity });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error updating cart: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // session ID is now automatically updated via httpOnly cookie by the proxy
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
        const response = await apiDelete(`/cart/product/${productId}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error removing from cart: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // session ID is now automatically updated via httpOnly cookie by the proxy
        return data;
    } catch (error) {
        console.error('Error in removeFromCart:', error);
        throw error;
    }
}

/**
 * Update quantity of a product variation in the cart
 * @param idVariation - The ID of the variation to update
 * @param quantity - The new quantity
 * @returns Promise with the updated cart response
 */
export async function updateCartVariationQuantity(idVariation: number, quantity: number): Promise<AddToCartResponse> {
    try {
        const response = await apiPut(`/cart/variation/${idVariation}`, { quantity });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error updating cart variation: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // session ID is now automatically updated via httpOnly cookie by the proxy
        return data;
    } catch (error) {
        console.error('Error in updateCartVariationQuantity:', error);
        throw error;
    }
}

/**
 * Remove a product variation from the cart
 * @param idVariation - The ID of the variation to remove
 * @returns Promise with the updated cart response
 */
export async function removeCartVariation(idVariation: number): Promise<AddToCartResponse> {
    try {
        const response = await apiDelete(`/cart/variation/${idVariation}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error removing cart variation: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // session ID is now automatically updated via httpOnly cookie by the proxy
        return data;
    } catch (error) {
        console.error('Error in removeCartVariation:', error);
        throw error;
    }
}

/**
 * Clear the entire cart
 * @returns Promise with the empty cart response
 */
export async function clearCart(): Promise<AddToCartResponse> {
    try {
        const response = await apiDelete('/cart');

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error clearing cart: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // session ID is now automatically updated via httpOnly cookie by the proxy
        return data;
    } catch (error) {
        console.error('Error in clearCart:', error);
        throw error;
    }
}



/**
 * Get available shipping carriers
 * @returns Promise with the list of carriers
 */
export async function getCarriers(): Promise<{ success: boolean; data: CartCarrier[]; total: number }> {
    try {
        const response = await apiGet('/cart/carriers');

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
        const response = await apiPut('/cart/carrier', { carrierId });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error updating carrier: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // session ID is now automatically updated via httpOnly cookie by the proxy
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
 * Get available warehouse provinces for pickup
 * @returns Promise with the list of provinces
 */
export async function getWarehouseProvinces(): Promise<{ success: boolean; data: WarehouseDistrict[]; total: number }> {
    try {
        const response = await apiGet('/orders/almacenes/provincias', {
            skipAuth: true
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error fetching provinces: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getWarehouseProvinces:', error);
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
 * Warehouse Detail Interface
 */
export interface WarehouseDetail {
    idAlmacen: number;
    direccion: string;
    atencion: string;
    telefono?: string;
    imagen?: string;
}

/**
 * Get warehouse details (address, hours) for a specific district (ubigeo)
 * @param ubigeo - The ubigeo code of the district
 * @returns Promise with the list of warehouse details
 */
export async function getWarehouseDetails(ubigeo: string): Promise<{ success: boolean; data: WarehouseDetail[]; total: number }> {
    try {
        const response = await apiGet(`/orders/almacenes/detalles/${ubigeo}`, {
            skipAuth: true
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error fetching warehouse details: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        // Fallback or empty array if endpoint fails or doesn't exist yet
        console.warn('Error in getWarehouseDetails, returning empty list:', error);
        return { success: false, data: [], total: 0 };
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

/**
 * Save guest personal data
 * @param data - The guest personal data
 * @returns Promise with the response
 */
export async function saveGuestPersonalData(data: any): Promise<{ success: boolean; message: string }> {
    try {
        // X-Session-Id is automatically added by apiClient.ts from liwilu_session_id
        const response = await apiPut('/cart/personal-data', data, {
            skipAuth: true
        });

        console.log("Datos personales guardados:", data);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error saving guest data: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in saveGuestPersonalData:', error);
        throw error;
    }
}


/**
 * Delivery Zone Interface
 */
export interface DeliveryZone {
    zoneId: number;
    zoneName: string;
    idCarrier: number;
    price: number;
}

/**
 * Delivery Zones Response Interface
 */
export interface DeliveryZonesResponse {
    success: boolean;
    carrierId: number;
    carrierName: string;
    isFree: boolean;
    total: number;
    zones: DeliveryZone[];
}

/**
 * Get delivery zones and prices for a specific carrier
 * @param carrierId - The ID of the carrier
 * @returns Promise with the delivery zones data
 */
export async function getDeliveryZones(carrierId: number): Promise<DeliveryZonesResponse> {
    try {
        const response = await apiGet(`/cart/delivery-zones/${carrierId}`, {
            skipAuth: true
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error fetching delivery zones: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getDeliveryZones:', error);
        throw error;
    }
}

/**
 * Save delivery address to the cart
 * @param data - The address data (distritoSeleccionado, direccion, numeroDptoPiso, referencia)
 * @returns Promise with the response
 */
export async function saveCartDeliveryAddress(data: {
    distritoSeleccionado: string;
    direccion: string;
    numeroDptoPiso: string;
    referencia: string;
}): Promise<{ success: boolean; message: string }> {
    try {
        console.log('📡 Syncing delivery address to API:', data);

        const response = await apiPut('/cart/delivery-address', data);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error saving delivery address: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in saveCartDeliveryAddress:', error);
        throw error;
    }
}

/**
 * Savar Stock Validation Result Interface
 */
export interface SavarStockValidationResult {
    success: boolean;
    reference: string;
    descripcion: string;
    stock: number;
    stockSeleccionado: number;
    estado: string;
    mensaje: string;
    disponible: boolean;
}

/**
 * Validate stock for a single product via Savar endpoint
 * @param reference - Product reference code
 * @param quantity - Selected quantity
 * @returns Promise with validation results
 */
export async function validateSavarStock(reference: string, quantity: number): Promise<SavarStockValidationResult> {
    try {
        const response = await apiGet(`/cart/validate-stock-savar?reference=${reference}&stockSeleccionado=${quantity}`, {
            skipAuth: true
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error validating Savar stock: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in validateSavarStock:', error);
        throw error;
    }
}

/**
 * Save delivery price and zone to the cart session
 */
export async function saveCartDeliveryPrice(data: {
    carrierId: number;
    shippingCost: number;
    zoneId: number;
    zoneName: string;
}): Promise<{ success: boolean; message: string }> {
    try {
        const response = await apiPut('/cart/delivery-price', data);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error saving delivery price: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in saveCartDeliveryPrice:', error);
        throw error;
    }
}

/**
 * Save authorized person for pickup
 * @param data - The authorized person data (tipoDocumento, numeroDocumento, nombreCompleto)
 * @returns Promise with the response
 */
export async function savePickupPerson(data: {
    tipoDocumento: string;
    numeroDocumento: string;
    nombreCompleto: string;
}): Promise<{ success: boolean; message: string }> {
    try {
        const response = await apiPut('/cart/pickup-person', data);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error saving pickup person: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in savePickupPerson:', error);
        throw error;
    }
}

/**
 * Save pickup store selection
 */
export interface SavePickupStoreRequest {
    idAlmacen: number;
    desAlmacen: string;
    direccion: string;
    atencion: string;
}

export interface SavePickupStoreResponse {
    success: boolean;
    message: string;
    data: {
        pickupStoreInfo: {
            carrierId: number;
            carrierName: string;
            carrierPrestashopId: number;
            idAlmacen: number;
            desAlmacen: string;
            direccionAlmacen: string;
            atencion: string;
        }
    }
}

export async function savePickupStore(data: SavePickupStoreRequest): Promise<SavePickupStoreResponse> {
    try {
        const response = await apiPut('/cart/pickup-store', data);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error saving pickup store: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in savePickupStore:', error);
        throw error;
    }
}

/**
 * Process payment with Culqi token
 * @param orderId - The ID of the order or cart to pay
 * @param data - token and user email
 */
export async function payOrder(orderId: string | number, data: {
    token: string;
    email: string;
}): Promise<{ success: boolean; message?: string;[key: string]: any }> {
    try {
        const response = await apiPost(`/payments/orders/${orderId}/pay`, data, {
            skipAuth: true // Payment might be for guest or handled by session headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error processing payment: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in payOrder:', error);
        throw error;
    }
}

/**
 * Create order with invoice data
 */
export async function createOrder(data: {
    invoiceType: string;
    invoiceData?: any;
}): Promise<{ success: boolean; data?: { orderId: number;[key: string]: any }; orderId?: number; message?: string;[key: string]: any }> {
    try {
        const response = await apiPost('/orders', data);

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || `Error creating order: ${response.statusText}`);
        }

        return result;
    } catch (error) {
        console.error('Error in createOrder:', error);
        throw error;
    }
}
/**
 * Get full order details by ID
 */
export async function getOrderDetail(orderId: string): Promise<{ success: boolean; data: any; message?: string }> {
    try {
        const response = await apiGet(`/orders/detail/${orderId}`);

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || `Error fetching order details: ${response.statusText}`);
        }

        return result;
    } catch (error) {
        console.error('Error in getOrderDetail:', error);
        throw error;
    }
}

/**
 * Get order payment status
 * @param orderId - The ID of the order to check
 */
export async function getOrderPaymentStatus(orderId: string | number): Promise<{ success: boolean; data: any; message?: string }> {
    try {
        const response = await apiGet(`/payments/orders/${orderId}/status`, {
            skipAuth: true // Usually checkable by guest with session or ID
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || `Error fetching order status: ${response.statusText}`);
        }

        return result;
    } catch (error) {
        console.error('Error in getOrderPaymentStatus:', error);
        throw error;
    }
}

/**
 * Send paid confirmation email
 * @param orderId - The ID of the order
 */
export async function sendOrderPaidEmail(orderId: string | number): Promise<{ success: boolean; message: string }> {
    try {
        const response = await apiPost(`/orders/${orderId}/send-paid-email`, {}, {
            skipAuth: true
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || `Error sending paid email: ${response.statusText}`);
        }

        return result;
    } catch (error) {
        console.error('Error in sendOrderPaidEmail:', error);
        throw error;
    }
}
