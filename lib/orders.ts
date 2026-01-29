// lib/orders.ts
import { apiGet } from './auth/apiClient';

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
    zoneId: number;
    zoneName: string;
    shippingCost: number;
    idAlmacenSAVAR: string;
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
        console.error('Error in getMyOrders:', error);
        throw error;
    }
}
