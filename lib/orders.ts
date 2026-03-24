// lib/orders.ts
import { apiGet } from './auth/apiClient';
import logger from './logger';

export interface OrderItem {
    reference: string;
    prestashopId: number;
    prestashopCombinationId: number;
    name: string;
    price: number;
    quantity: number;
    quantityExistenteERP: number | null;
    quantityExistenteSavar: number;
    image?: string;
}

export interface PersonalData {
    nombre: string;
    apellido: string;
    tipoDocumento: string;
    numeroDocumento: string;
    email: string;
    celular: string;
    telefono: string;
    departamento: string;
    provincia: string;
    distrito: string;
    direccion: string;
    numeroDptoPiso: string;
    referencia: string;
}

export interface DeliveryInfo {
    carrierId: number;
    carrierName: string;
    carrierPrestashopId: number;
    // Pickup fields
    idAlmacenERP?: number;
    desAlmacen?: string;
    direccionAlmacen?: string;
    atencion?: string;
    // Delivery fields
    zoneId?: number;
    zoneName?: string;
    shippingCost?: number;
    idAlmacenSAVAR?: string;
}

export interface InvoiceData {
    tipoDocumento: string;
    numeroDocumento: string;
}

export interface PaymentData {
    brand: string;
    email: string;
    last4: string;
    amount: number;
    paidAt: string;
    status: string;
    cardType: string;
    chargeId: string;
    currency: string;
    amountInCents: number;
    referenceCode: string;
    rawResponse?: any;
    trismegistoInfo?: TrismegistoInfo;
}

export interface TrismegistoInfo {
    balanceAmount: number;
    cardAmount: number;
    balanceInstallments: number;
    soTpRegistroId?: string;
}

export interface Order {
    id: number;
    orderNumber: string;
    paymentStatus: string;
    personalData: PersonalData;
    deliveryType: string;
    deliveryInfo: DeliveryInfo;
    items: OrderItem[];
    invoiceType: string;
    invoiceData: InvoiceData;
    paymentData: PaymentData;
    priceTotal: number;
    shippingCost: number;
    paidAt: string;
    ingresado?: string;
    pendienteArreglo?: string;
    confirmado?: string;
    enRuta?: string;
    entregado?: string;
}

export interface MyOrdersResponse {
    success: boolean;
    total: number;
    data: Order[];
}

/**
 * Fetches the orders for the currently authenticated user.
 * The access token is automatically added to the headers by apiClient.ts.
 */
export async function getMyOrders(): Promise<MyOrdersResponse> {
    try {
        const response = await apiGet('/orders/my-orders');

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error fetching orders: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in getMyOrders:', error);
        throw error;
    }
}

// Package Tracking Interfaces
export interface TrackingState {
    id: string;
    titulo: string;
    descripcion: string;
    fecha: string;
    hora: string;
    completado: boolean;
    activo: boolean;
}

export interface PackageProduct {
    nombre: string;
    talla: string;
    precio: number;
    precioAnterior?: number;
    imagen: string;
}

export interface SAVARPackageResponse {
    nIdePaquete: number;
    vcodpaquete: string;
    vCodSubServicio: string;
    vSubServicio: string;
    vfechadetalleestado: string;
    vRutaSeguimiento: string;
    Estados: {
        vCodEstado: string;
        vNombreEstado: string;
        dFechaEstado: string;
        vMotivo: string;
        vCodMotivo: string;
        lstfotos: string[];
    }[];
}

export type PackageStatusResponse = SAVARPackageResponse;


/**
 * Fetches the package tracking status for a specific order.
 * @param orderId - The order ID to track
 * @returns Package tracking information
 */
export async function getPackageStatus(orderId: string): Promise<PackageStatusResponse> {
    try {
        const response = await apiGet(`/orders/delivery/package-status/${orderId}`, {
            skipAuth: true // Tracking might be public, or at least we don't want to fail if token is missing for public page
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Create a more specific error for 404 package not found
            if (response.status === 404) {
                const error: any = new Error(
                    errorData.message ||
                    `No se encontró información para el paquete ${orderId}. Verifica el número e intenta nuevamente.`
                );
                error.statusCode = 404;
                error.isPackageNotFound = true;
                throw error;
            }

            throw new Error(errorData.message || `Error fetching package status: ${response.statusText}`);
        }

        return await response.json();
    } catch (error: any) {
        logger.error('Error in getPackageStatus:', error);

        // Re-throw with additional context if it's not already our custom error
        if (!error.isPackageNotFound && error.message) {
            const enhancedError: any = new Error(error.message);
            enhancedError.statusCode = error.statusCode;
            enhancedError.originalError = error;
            throw enhancedError;
        }

        throw error;
    }
}
// Pickup Tracking Interfaces
export interface PickupStatus {
    IdPedido: number;
    EstadoDespacho: string;
    NombreEstadoDespacho: string;
}

export type PickupStatusResponse = PickupStatus[];

/**
 * Fetches the pickup status for a specific order.
 * @param orderId - The order ID to track
 */
export async function getPickupStatus(orderId: string): Promise<PickupStatusResponse> {
    try {
        const response = await apiGet(`/orders/pickup/order-status/${orderId}`, {
            skipAuth: true
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 404) {
                const error: any = new Error(
                    errorData.message ||
                    `No se encontró información de retiro para el paquete ${orderId}.`
                );
                error.statusCode = 404;
                throw error;
            }

            throw new Error(errorData.message || `Error fetching pickup status: ${response.statusText}`);
        }

        return await response.json();
    } catch (error: any) {
        logger.error('Error in getPickupStatus:', error);
        throw error;
    }
}
// Delivery Type Interface
export interface DeliveryTypeResponse {
    success: boolean;
    data: {
        orderId: number;
        deliveryType: string; // "RETIRO_TIENDA" | "DELIVERY"
    };
}

/**
 * Fetches the delivery type for a specific order.
 * Used to determine whether to show SAVAR or pickup tracking.
 * @param orderId - The order ID to check
 */
export async function getDeliveryType(orderId: string): Promise<DeliveryTypeResponse> {
    try {
        const response = await apiGet(`/orders/delivery-type/${orderId}`, {
            skipAuth: true // Public tracking page, no auth required
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 404) {
                const error: any = new Error(
                    errorData.message ||
                    `No se encontró el pedido #${orderId}. Verifica el número e intenta nuevamente.`
                );
                error.statusCode = 404;
                throw error;
            }

            throw new Error(errorData.message || `Error fetching delivery type: ${response.statusText}`);
        }

        return await response.json();
    } catch (error: any) {
        logger.error('Error in getDeliveryType:', error);
        throw error;
    }
}
