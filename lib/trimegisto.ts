// lib/trimegisto.ts
/**
 * Trimegisto Payment Integration
 * Handles payment initiation and confirmation flow for balance-based payments
 */

import { apiPost, apiGet } from './auth/apiClient';
import logger from './logger';

/**
 * Pre-Order Status Types
 */
export type PreOrderStatus = 
  | 'PENDIENTE_CONFIRMACION'
  | 'CONFIRMADA'
  | 'COMPLETADA'
  | 'EXPIRADA'
  | 'CANCELADA';

/**
 * Pre-Order Interface
 */
export interface PreOrder {
  id: number;
  preOrderId: string;
  userId: number;
  pendingOrderId: number;
  balanceAmount: number;
  installments: number;
  status: PreOrderStatus;
  token: string;
  expiresAt: string;
  confirmedAt?: string;
  completedAt?: string;
  createdAt: string;
}

/**
 * Invoice data for Boleta
 */
export interface InvoiceDataBoleta {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

/**
 * Invoice data for Factura
 */
export interface InvoiceDataFactura {
  ruc: string;
  razonSocial: string;
  direccionFiscal: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

/**
 * Initiate Trimegisto Payment Request
 */
export interface InitiateTrismegistoRequest {
  balanceAmount: number;         // Amount to charge from balance
  installments: number;          // Number of installments (1-3)
  invoiceType?: 'BOLETA' | 'FACTURA';
  invoiceData?: InvoiceDataBoleta | InvoiceDataFactura;
}

/**
 * Initiate Trimegisto Payment Response
 */
export interface InitiateTrismegistoResponse {
  success: boolean;
  message: string;
  error?: string;
  /** Datos de la pre-orden — vienen anidados bajo "data" en la respuesta del API */
  data?: {
    preOrderId: string;
    expiresAt: string;
    /** Ruta relativa al PDF de consentimiento, e.g. /uploads/consent-files/xxx.pdf */
    trismegistoDocumentUrl?: string;
    token?: string;
  };
  // Campos aplanados que devuelve la función initiateTrismegistoPayment
  preOrderId: string;
  expiresAt: string;
  trismegistoDocumentUrl?: string;
  token?: string;
}

/**
 * Verify OTP Response — two possible cases:
 * A) Mixed payment (still needs card) → success=true, autoProcessed=false, token and redirectUrl
 * B) 100% balance → success=true, autoProcessed=true, orderNumber and redirectUrl
 */
export interface VerifyOTPResponse {
  success: boolean;
  autoProcessed: boolean;
  orderNumber?: string;
  message: string;
  /** URL to redirect to after OTP confirmation */
  redirectUrl?: string;
  /** Token used when redirecting to mixed checkout */
  token?: string;
  /** trismegistoDocumentUrl from the pre-order */
  trismegistoDocumentUrl?: string;
  orderId?: number;
  error?: string;
}

/**
 * Confirm Trimegisto Payment Response
 */
export interface ConfirmTrismegistoResponse {
  success: boolean;
  autoProcessed: boolean;
  orderNumber: string;
  message: string;
  redirectUrl: string;
  orderId?: number;
  error?: string;
}

/**
 * Trimegisto Balance Info
 */
export interface TrismegistoBalanceInfo {
  available: number;          // Available balance
  used: number;               // Used balance
  pending: number;            // Pending confirmation amount
  maxInstallments: number;    // Max installments allowed (usually 3)
}

/**
 * Initiate a Trimegisto payment
 * Creates a pre-order and sends a confirmation email to the user.
 * No pendingOrderId needed — the backend creates the order at confirmation time.
 *
 * @param balanceAmount - Amount to charge from balance
 * @param installments - Number of installments (1-3)
 * @param invoiceType - 'BOLETA' | 'FACTURA'
 * @param invoiceData - Invoice fields matching the selected type
 */
export async function initiateTrismegistoPayment(
  balanceAmount: number,
  installments: number,
  invoiceType?: 'BOLETA' | 'FACTURA',
  invoiceData?: InvoiceDataBoleta | InvoiceDataFactura,
): Promise<InitiateTrismegistoResponse> {
  try {
    logger.log('[Trimegisto] Initiating payment:', { balanceAmount, installments, invoiceType });

    const payload: InitiateTrismegistoRequest = {
      balanceAmount,
      installments,
      ...(invoiceType ? { invoiceType } : {}),
      ...(invoiceData ? { invoiceData } : {}),
    };

    const response = await apiPost('/orders/trismegisto/initiate', payload);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('[Trimegisto] Initiation failed:', errorData);
      throw new Error(
        errorData.error || errorData.message || 'Error al iniciar el pago Trimegisto'
      );
    }

    const json = await response.json();

    // La API retorna { success, message, data: { preOrderId, expiresAt, trismegistoDocumentUrl, token } }
    // Aplanamos para que los consumers accedan directamente a response.preOrderId, etc.
    const inner = json.data ?? json;
    const result: InitiateTrismegistoResponse = {
      success: json.success,
      message: json.message,
      preOrderId: inner.preOrderId,
      expiresAt: inner.expiresAt,
      trismegistoDocumentUrl: inner.trismegistoDocumentUrl,
      token: inner.token,
    };

    logger.log('[Trimegisto] Initiation successful:', { preOrderId: result.preOrderId });

    return result;
  } catch (error) {
    logger.error('[Trimegisto] Error in initiateTrismegistoPayment:', error);
    throw error;
  }
}

/**
 * Confirm a Trimegisto payment via email link
 * Should be called when user clicks the confirmation link from email
 * 
 * @param token - Confirmation token from email link
 * @returns Response with success status and redirect URL
 */
export async function confirmTrismegistoPayment(
  token: string,
): Promise<ConfirmTrismegistoResponse> {
  try {
    logger.log('[Trimegisto] Confirming payment with token:', token.substring(0, 10) + '...');

    // Use apiGet for confirmation endpoint (it's a GET with token in URL)
    const response = await apiGet(`/orders/trismegisto/confirm/${encodeURIComponent(token)}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('[Trimegisto] Confirmation failed:', errorData);
      
      // Handle specific error cases but prioritize the backend message
      const backendMessage = errorData.message || errorData.error;
      
      if (response.status === 400) {
        throw new Error(backendMessage || 'Token inválido o expirado');
      } else if (response.status === 404) {
        throw new Error(backendMessage || 'Pre-orden no encontrada');
      } else if (response.status === 409) {
        throw new Error(backendMessage || 'Esta pre-orden ya fue confirmada');
      }
      
      throw new Error(
        backendMessage || 'Failed to confirm Trimegisto payment'
      );
    }

    const data = await response.json() as ConfirmTrismegistoResponse;
    logger.log('[Trimegisto] Confirmation successful:', { 
      orderNumber: data.orderNumber,
      redirectUrl: data.redirectUrl 
    });
    
    return data;
  } catch (error) {
    logger.error('[Trimegisto] Error in confirmTrismegistoPayment:', error);
    throw error;
  }
}

/**
 * Get user's Trimegisto balance information
 * 
 * @returns Balance info including available, used, and pending amounts
 */
export async function getTrismegistoBalance(): Promise<TrismegistoBalanceInfo> {
  try {
    logger.log('[Trimegisto] Fetching balance information');

    const response = await apiGet('/user/trismegisto/balance');

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('[Trimegisto] Failed to fetch balance:', errorData);
      throw new Error(
        errorData.error || errorData.message || 'Failed to fetch Trimegisto balance'
      );
    }

    const data = await response.json() as TrismegistoBalanceInfo;
    logger.log('[Trimegisto] Balance fetched:', data);
    
    return data;
  } catch (error) {
    logger.error('[Trimegisto] Error in getTrismegistoBalance:', error);
    throw error;
  }
}

/**
 * Cancel a pending Trimegisto pre-order
 * User can cancel before confirming via email
 * 
 * @param preOrderId - ID of the pre-order to cancel
 * @returns Success status
 */
export async function cancelTrismegistoPreOrder(
  preOrderId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    logger.log('[Trimegisto] Cancelling pre-order:', preOrderId);

    const response = await apiPost(`/orders/trismegisto/cancel/${encodeURIComponent(preOrderId)}`, {});

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('[Trimegisto] Cancellation failed:', errorData);
      throw new Error(
        errorData.error || errorData.message || 'Failed to cancel Trimegisto pre-order'
      );
    }

    const data = await response.json();
    logger.log('[Trimegisto] Pre-order cancelled:', preOrderId);
    
    return data;
  } catch (error) {
    logger.error('[Trimegisto] Error in cancelTrismegistoPreOrder:', error);
    throw error;
  }
}

/**
 * Validate if amount is within user's balance and installment limits
 * 
 * @param amount - Amount to validate
 * @param installments - Number of installments
 * @param availableBalance - User's available balance
 * @returns Validation result with error message if invalid
 */
export function validateTrismegistoPayment(
  amount: number,
  installments: number,
  availableBalance: number,
): { valid: boolean; error?: string } {
  // Validate installments (1-3)
  if (installments < 1 || installments > 3) {
    return {
      valid: false,
      error: 'Las cuotas deben ser entre 1 y 3',
    };
  }

  // Validate amount is positive
  if (amount <= 0) {
    return {
      valid: false,
      error: 'El monto debe ser mayor a 0',
    };
  }

  // Validate sufficient balance
  if (amount > availableBalance) {
    return {
      valid: false,
      error: `Saldo insuficiente. Disponible: S/. ${availableBalance.toFixed(2)}`,
    };
  }

  return { valid: true };
}

/**
 * Format installment amount for display
 * Calculates per-installment amount and formatting
 * 
 * @param totalAmount - Total amount to pay
 * @param installments - Number of installments
 * @returns Formatted display string
 */
export function formatInstallmentDisplay(totalAmount: number, installments: number): string {
  const perInstallment = totalAmount / installments;
  return `${installments} cuota${installments > 1 ? 's' : ''} de S/. ${perInstallment.toFixed(2)}`;
}

/**
 * Verify a Trismegisto OTP code.
 * Called when the user submits the 6-digit code received via email.
 *
 * @param preOrderId - ID of the pre-order from /initiate
 * @param otpCode - 6-digit code entered by the user
 */
export async function verifyTrismegistoOTP(
  preOrderId: string,
  otpCode: string,
): Promise<VerifyOTPResponse> {
  try {
    logger.log('[Trimegisto] Verifying OTP for preOrderId:', preOrderId);

    const response = await apiPost('/orders/trismegisto/verify-otp', {
      preOrderId,
      otpCode,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('[Trimegisto] OTP verification failed:', errorData);
      throw new Error(
        errorData.message || errorData.error || 'Código OTP inválido o expirado'
      );
    }

    const data = await response.json() as VerifyOTPResponse;
    logger.log('[Trimegisto] OTP verified successfully:', { autoProcessed: data.autoProcessed });

    return data;
  } catch (error) {
    logger.error('[Trimegisto] Error in verifyTrismegistoOTP:', error);
    throw error;
  }
}

/**
 * Resend the OTP code for a Trismegisto pre-order.
 * Extends OTP lifetime to 10 minutes and sends a new code to the user's email.
 *
 * @param preOrderId - ID of the pre-order from /initiate
 */
export async function resendTrismegistoOTP(
  preOrderId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    logger.log('[Trimegisto] Resending OTP for preOrderId:', preOrderId);

    const response = await apiPost('/orders/trismegisto/resend-otp', {
      preOrderId,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('[Trimegisto] OTP resend failed:', errorData);
      throw new Error(
        errorData.message || errorData.error || 'Error al reenviar el código OTP'
      );
    }

    const data = await response.json();
    logger.log('[Trimegisto] OTP resent successfully');

    return data;
  } catch (error) {
    logger.error('[Trimegisto] Error in resendTrismegistoOTP:', error);
    throw error;
  }
}
