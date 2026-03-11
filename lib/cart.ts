// lib/cart.ts
import { apiPost, apiGet, apiDelete, apiPut } from './auth/apiClient';
import logger from './logger';

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
    linkRewrite?: string; // Product slug for URL generation
    price: number;
    priceWithTax: number;
    discountPrice?: number | null; // Changed to optional
    quantity: number;
    priceImpact?: number; // Added
    promoDiscount?: number; // Discount applied by a promo/coupon
    promoCodes?: string[]; // Codes that generated the promo discount
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
    queryString?: string; // Query string for variation-specific URLs
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
    zoneId?: number;
    zoneName?: string;
}

/**
 * Cart Totals Interface
 */
export interface CartTotals {
    subtotal: number;
    shipping: number;
    total: number;
    discount?: number;         // Total coupon/rule discount
    promoDiscount?: number;    // Discount from applied promotions
    trismegistoBalance?: number; // Balance applied from Trismegisto account
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
 * Applied Promotion Summary (from /cart response)
 */
export interface AppliedPromotion {
    code: string;
    name: string;
    description: string;
    prestashopId: number;
    totalSavings: number;
}

/**
 * Cart Data Interface
 */
export interface CartData {
    cartId: string; // Changed from optional to required
    sessionId?: string;
    products: CartProduct[];
    carrier?: any; // Changed from CartCarrier | null to any
    totals: {
        total: number;
        shipping: number;
        subtotal: number;
        discount?: number;
        promoDiscount?: number;
        trismegistoBalance?: number;
    };
    balanceAmount?: number;
    balanceInstallments?: number;
    appliedPromotions?: AppliedPromotion[];
    expiresAt?: string; // Changed from string | null to optional string
    timeRemaining?: string; // Added
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
            logger.log('💾 Saved new session ID to localStorage:', data.data.sessionId);
        }

        return data;
    } catch (error) {
        logger.error('Error in addToCart:', error);
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
                logger.warn('🛒 Cart session expired or not found');
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
            logger.log('💾 Updated session ID from getCart:', data.data.sessionId);
        }

        return data;
    } catch (error) {
        logger.error('Error in getCart:', error);
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
        logger.error('Error in updateCartQuantity:', error);
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
        logger.error('Error in removeFromCart:', error);
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
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiPut(`/cart/variation/${idVariation}`, { quantity }, {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error updating cart variation: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // Update session ID if returned
        if (data?.data?.sessionId && typeof window !== 'undefined') {
            localStorage.setItem('liwilu_session_id', data.data.sessionId);
        }

        return data;
    } catch (error) {
        logger.error('Error in updateCartVariationQuantity:', error);
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
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiDelete(`/cart/variation/${idVariation}`, {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error removing cart variation: ${response.statusText}`);
        }

        const data: AddToCartResponse = await response.json();

        // Update session ID if returned
        if (data?.data?.sessionId && typeof window !== 'undefined') {
            localStorage.setItem('liwilu_session_id', data.data.sessionId);
        }

        return data;
    } catch (error) {
        logger.error('Error in removeCartVariation:', error);
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
        logger.error('Error in clearCart:', error);
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
        logger.error('Error in getCarriers:', error);
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
        logger.error('Error in updateCartCarrier:', error);
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
        logger.error('Error in getWarehouseDistricts:', error);
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
        logger.error('Error in getWarehouseProvinces:', error);
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

        const json = await response.json();

        // Temporal: Actualizar coordenadas para TIENDA WEB INGENIEROS
        if (json?.data && Array.isArray(json.data)) {
            json.data = json.data.map((store: WarehouseMapItem) => {
                if (store.idAlmacen === 239) {
                    return {
                        ...store,
                        latitud: -12.055074821816591,
                        longitud: -76.95361789279112
                    };
                }
                return store;
            });
        }

        return json;
    } catch (error) {
        logger.error('Error in getWarehouseMap:', error);
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
        logger.warn('Error in getWarehouseDetails, returning empty list:', error);
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
        logger.error('Error in validateStock:', error);
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
        // Ensure document type is uppercase for backend validation
        const payload = { ...data };
        if (payload.tipoDocumento) {
            payload.tipoDocumento = payload.tipoDocumento.toUpperCase();
        }

        // X-Session-Id is automatically added by apiClient.ts from liwilu_session_id
        const response = await apiPut('/cart/personal-data', payload, {
            skipAuth: true
        });

        logger.log("Datos personales guardados:", data);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Especial handling for 404 - Carrito no encontrado
            if (response.status === 404 || errorData.message?.toLowerCase().includes('carrito no encontrado')) {
                const error = new Error('CARRITO_NO_ENCONTRADO');
                (error as any).statusCode = 404;
                (error as any).apiMessage = errorData.message;
                throw error;
            }

            // Preserve field-level validation errors (e.g. { nombre: "...", apellido: "..." })
            const error = new Error(errorData.message || `Error saving guest data: ${response.statusText}`);
            if (errorData.errors && typeof errorData.errors === 'object') {
                (error as any).fieldErrors = errorData.errors;
            }
            throw error;
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in saveGuestPersonalData:', error);
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
        logger.error('Error in getDeliveryZones:', error);
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
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        logger.log('📡 Syncing delivery address to API:', data);
        logger.log('🔑 Access Token present:', !!accessToken);

        const response = await apiPut('/cart/delivery-address', data, {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error saving delivery address: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in saveCartDeliveryAddress:', error);
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
        logger.error('Error in validateSavarStock:', error);
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
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiPut('/cart/delivery-price', data, {
            skipAuth: !accessToken // Skip auth if no token (guest mode)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error saving delivery price: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in saveCartDeliveryPrice:', error);
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
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        // Ensure document type is uppercase for backend validation
        const payload = { ...data };
        if (payload.tipoDocumento) {
            payload.tipoDocumento = payload.tipoDocumento.toUpperCase();
        }

        const response = await apiPut('/cart/pickup-person', payload, {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error saving pickup person: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in savePickupPerson:', error);
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
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiPut('/cart/pickup-store', data, {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error saving pickup store: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in savePickupStore:', error);
        throw error;
    }
}

/**
 * Payment Order Response Interface
 */
export interface PayOrderResponse {
    success: boolean;
    message?: string;
    requires3DS?: boolean;
    data?: {
        orderId: number;
        orderNumber: string;
        paymentStatus: string;
        status: string;
        chargeId: string;
        amount: number;
        currency: string;
        paidAt: string;
    };
}

/**
 * Process payment with Culqi token
 * @param orderId - The ID of the order or cart to pay
 * @param data - token and user email
 */
export async function payOrder(orderId: string | number, data: {
    token: string;
    email: string;
    deviceFingerprint?: string; // ✅ OPCIONAL
    authentication3DS?: {
        eci: string;
        xid: string;
        cavv: string;
        protocolVersion: string;
        directoryServerTransactionId: string;
    };
}): Promise<PayOrderResponse> {
    try {
        // Validar que deviceFingerprint sea string si existe
        if (data.deviceFingerprint !== undefined && typeof data.deviceFingerprint !== 'string') {
            logger.error('❌ deviceFingerprint debe ser string, recibido:', typeof data.deviceFingerprint);
            throw new Error('deviceFingerprint debe ser un string');
        }

        const response = await apiPost(`/payments/orders/${orderId}/pay`, data, {
            skipAuth: true
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error processing payment: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in payOrder:', error);
        throw error;
    }
}

/**
 * Crea una orden en Culqi desde el backend para pagos asíncronos
 */
export async function createCulqiOrder(pendingOrderId: string | number, email: string): Promise<CheckAsyncPaymentStatusResponse> {
    try {
        logger.log(`🔄 Creando orden Culqi para orden pendiente #${pendingOrderId}...`);

        const response = await apiPost(`/payments/orders/${pendingOrderId}/create-culqi-order`, {
            email
        }, {
            skipAuth: true
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error creating Culqi order: ${response.statusText}`);
        }

        const data = await response.json();
        logger.log('✅ Orden Culqi creada exitosamente:', data);
        return data;
    } catch (error: any) {
        logger.error('Error in createCulqiOrder:', error);

        // Soportar recuperación en caso de conflicto 409 (la orden ya existe para este pendingOrderId)
        if (error.message?.includes('409') || error.message?.toLowerCase().includes('ya existe')) {
            logger.warn('⚠️ Conflicto 409: La orden ya existe en Culqi. Intentando recuperar...');
            try {
                // Importación dinámica o asumiendo que checkAsyncPaymentStatus está disponible en el mismo archivo
                const statusResp = await checkAsyncPaymentStatus(pendingOrderId);
                if (statusResp.success && statusResp.data?.culqiOrderId) {
                    logger.log('✅ Orden recuperada exitosamente:', statusResp.data.culqiOrderId);
                    return statusResp; // Retornamos el mismo formato que se espera
                }
            } catch (recoveryError) {
                logger.error('❌ Error fatal al intentar recuperar orden Culqi:', recoveryError);
            }
        }

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
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiPost('/orders', data, {
            skipAuth: !accessToken
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || `Error creating order: ${response.statusText}`);
        }

        return result;
    } catch (error) {
        logger.error('Error in createOrder:', error);
        throw error;
    }
}
/**
 * Get full order details by ID
 */
/**
 * Get order detail with payment info
 */
export async function getOrderDetail(orderId: string): Promise<{
    success: boolean;
    data?: {
        pendingOrderId: number;
        culqiOrderId: string;
        paymentMethod: 'qr' | 'pagoefectivo';
        paymentMethodType?: string; // Added for async payments
        amount: number;
        currency: string;
        expirationDate: string;
        qr?: string; // URL del QR
        paymentCode?: string; // CIP
        deliveryType: string;
        orderNumber: string;
        ingresado?: string;
        status: string;
    };
    message?: string;
}> {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        const response = await apiGet(`/orders/detail/${orderId}`, {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error fetching order details: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in getOrderDetail:', error);
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
        logger.error('Error in getOrderPaymentStatus:', error);
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
        logger.error('Error in sendOrderPaidEmail:', error);
        throw error;
    }
}

/**
 * Checkout Summary Response Interface
 */
export interface CheckoutSummaryResponse {
    success: boolean;
    isComplete: boolean;
    message?: string;
    data?: {
        cartId: string;
        products: Array<{
            id: number;
            reference: string;
            quantity: number;
            name: string;
            price: number;
            subtotal: number;
            [key: string]: any;
        }>;
        deliveryType: 'DELIVERY' | 'RETIRO' | string;
        pickupStoreInfo?: {
            idAlmacen: number;
            desAlmacen: string;
            [key: string]: any;
        } | null;
        [key: string]: any;
    };
}

/**
 * Get checkout summary to validate if all information is complete
 */
export async function getCheckoutSummary(): Promise<CheckoutSummaryResponse> {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiGet('/cart/checkout-summary', {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            logger.error('❌ [getCheckoutSummary] API error:', {
                status: response.status,
                errorData
            });
            // Return success: false but with the error message from API
            return {
                success: false,
                isComplete: false,
                message: errorData.message || 'Error al validar el resumen del checkout'
            };
        }

        const data = await response.json();
        logger.log('📦 [getCheckoutSummary] Success response:', data);
        return data;
    } catch (error: any) {
        logger.error('Error in getCheckoutSummary:', error);
        return {
            success: false,
            isComplete: false,
            message: error.message || 'Error de conexión al validar el checkout'
        }
    }
}

/**
 * Merge guest cart with user cart after login
 * @param accessToken - User's access token
 * @param sessionId - Guest's session ID
 * @returns Response from merge endpoint
 */
export async function mergeGuestCart(
    accessToken: string,
    sessionId: string
): Promise<{
    success: boolean;
    message: string;
    data?: any;
}> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/merge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-Session-Id': sessionId,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al fusionar carritos');
        }

        const data = await response.json();
        logger.log('✅ [mergeGuestCart] Cart merged successfully:', data);
        return data;
    } catch (error: any) {
        logger.error('❌ [mergeGuestCart] Error merging cart:', error);
        throw error;
    }
}

/**
 * Create async order (QR/PagoEfectivo)
 */
export async function createAsyncOrder(
    pendingOrderId: number | string,
    paymentMethod: 'qr' | 'pagoefectivo',
    email: string
): Promise<{
    success: boolean;
    data?: {
        culqiOrderId?: string;
        [key: string]: any;
    };
    message?: string;
    pendingOrderId?: number;
}> {
    try {
        const response = await apiPost(
            `/payments/orders/${pendingOrderId}/create-async-order`,
            {
                email,
                paymentMethod
            },
            {
                skipAuth: true
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error creating async order: ${response.statusText}`);
        }

        const data = await response.json();
        logger.log('📦 [cart.ts] Response raw from createAsyncOrder:', JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        logger.error('Error in createAsyncOrder:', error);
        throw error;
    }
}

/**
 * Check async payment status response interface
 */
export interface CheckAsyncPaymentStatusResponse {
    success: boolean;
    data?: {
        status: 'waiting' | 'paid' | 'expired' | 'failed';
        pendingOrderId: number;
        culqiOrderId?: string;
        orderId?: number; // Real order ID if paid
        total?: number;
        currency?: string;
        createdAt?: string;
        expirationDate?: string; // Fecha de expiración en formato ISO
        paymentMethod?: 'qr' | 'pagoefectivo';
        paymentMethodType?: string;
        qr?: string;
        paymentCode?: string;
        [key: string]: any;
    };
    message?: string;
}

/**
 * Check async payment status
 */
export async function checkAsyncPaymentStatus(
    pendingOrderId: number | string
): Promise<CheckAsyncPaymentStatusResponse> {
    try {
        const response = await apiGet(
            `/payments/pending-orders/${pendingOrderId}/async-status`,
            {
                skipAuth: true
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error checking payment status: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in checkAsyncPaymentStatus:', error);
        throw error;
    }
}

/**
 * Retrieve a pending order attempt by status
 * @param status - The status to filter by (e.g., 'AWAITING_PAYMENT')
 */
export async function getPendingOrderAttempt(status: string): Promise<{ success: boolean; data?: { pendingOrderId: number }; message?: string }> {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiGet(`/orders/pending-attempts?status=${status}`, {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error fetching pending order: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in getPendingOrderAttempt:', error);
        throw error;
    }
}

/**
 * Get asynchronous payment status and Culqi Order ID
 */
export async function getAsyncPaymentStatus(pendingOrderId: number | string): Promise<any> {
}

/**
 * Initiate Trimegisto pre-order
 * @param pendingOrderId - The ID of the pending order generated at checkout
 * @param balanceAmount - The amount of the Trimegisto balance applied
 * @param installments - The number of installments
 */
export async function initiateTrimegistoPreOrder(
    pendingOrderId: number,
    balanceAmount: number,
    installments: number
): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiPost(
            '/orders/trismegisto/initiate',
            {
                balanceAmount,
                installments,
                pendingOrderId
            },
            {
                skipAuth: !accessToken
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error initiating trimegisto order: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in initiateTrimegistoPreOrder:', error);
        throw error;
    }
}

// ─────────────────────────────────────────────
// CUPONES Y SUGERENCIAS DE PROMOCIONES
// ─────────────────────────────────────────────

export interface ApplyCouponResponse {
    success: boolean;
    message?: string;
    data?: {
        code?: string;
        discount?: number;
        [key: string]: any;
    };
}

export interface MatchingGroup {
    groupIndex: number;
    required: number;
    inCart: number;
    matched: boolean;
    products?: EligibleProduct[];
}

export interface EligibleProduct {
    productId: number;
    prestashopId: number;
    name: string;
    price: number;
    coverImage: string;
    linkRewrite?: string;
}

export interface RequiredProduct {
    productId: number;
    prestashopId: number;
    name: string;
    price: number;
    priceWithDiscount?: number;
    coverImage: string;
    inCart: boolean;
    isReductionProduct: boolean;
    linkRewrite?: string;
}

export interface PromoSuggestion {
    prestashopId: number;
    code: string;
    name: string;
    description: 'COMBO_2' | 'QTY_DISCOUNT' | 'COMBO_PLAN' | 'MIN_PURCHASE' | string;
    alreadyApplied: boolean;
    status: 'requires_products' | 'requires_minimum' | 'requires_combo2' | 'ready' | string;
    message: string;
    reductionPercent?: number;
    reductionAmount?: number;
    // COMBO_2
    combosAvailable?: number;
    matchingGroups?: MatchingGroup[];
    missingProductIds?: number[];
    // QTY_DISCOUNT
    inCart?: number;
    required?: number;
    discountedUnits?: number;
    eligibleProducts?: EligibleProduct[];
    // COMBO_PLAN
    requiresCombo2?: boolean;
    reductionProductId?: number;
    requiredProducts?: RequiredProduct[];
    // MIN_PURCHASE
    minimumAmount?: number;
    currentSubtotal?: number;
    missingAmount?: number;
}

export interface PromoSuggestionsResponse {
    success: boolean;
    appliedPromotions: AppliedPromotion[];
    suggestions: PromoSuggestion[];
}

/**
 * Apply a coupon to the cart
 * @param code - Coupon code to apply
 */
export async function applyCoupon(code: string): Promise<ApplyCouponResponse> {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiPost('/cart/apply-coupon', { code }, {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error applying coupon: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in applyCoupon:', error);
        throw error;
    }
}

/**
 * Remove an applied coupon from the cart
 * @param code - Coupon code to remove
 */
export async function removeCoupon(code: string): Promise<{ success: boolean; message?: string }> {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiDelete(`/cart/coupon/${encodeURIComponent(code)}`, {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error removing coupon: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in removeCoupon:', error);
        throw error;
    }
}

/**
 * Get promotion suggestions for the current cart
 */
export async function getPromoSuggestions(): Promise<PromoSuggestionsResponse> {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await apiGet('/cart/promo-suggestions', {
            skipAuth: !accessToken
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error fetching promo suggestions: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in getPromoSuggestions:', error);
        throw error;
    }
}
