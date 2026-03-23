// components/checkout/TrismegistoPaymentSection.tsx
/**
 * Trimegisto Payment Method Section
 * Handles payment method selection and installment configuration for Trimegisto
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CartTotals } from "@/lib/cart";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import {
  validateTrismegistoPayment,
  formatInstallmentDisplay,
  TrismegistoBalanceInfo,
} from "@/lib/trimegisto";
import { PiInfo } from "react-icons/pi";
import logger from "@/lib/logger";

interface TrismegistoPaymentSectionProps {
  isSelected: boolean;
  onSelect: () => void;
  totals: CartTotals;
  balanceInfo?: TrismegistoBalanceInfo;
  selectedInstallments: number;
  onInstallmentsChange: (installments: number) => void;
  isLoading?: boolean;
}

export default function TrismegistoPaymentSection({
  isSelected,
  onSelect,
  totals,
  balanceInfo,
  selectedInstallments,
  onInstallmentsChange,
  isLoading = false,
}: TrismegistoPaymentSectionProps) {
  const { user } = useAuth();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [availableBalance, setAvailableBalance] = useState<number>(0);

  // Update available balance when balanceInfo changes
  useEffect(() => {
    if (balanceInfo) {
      setAvailableBalance(balanceInfo.available);
    }
  }, [balanceInfo]);

  // Validate current selection whenever totals or installments change
  useEffect(() => {
    if (!isSelected) return;

    const validation = validateTrismegistoPayment(
      totals.total,
      selectedInstallments,
      availableBalance,
    );

    if (!validation.valid) {
      setValidationError(validation.error || null);
    } else {
      setValidationError(null);
    }
  }, [totals.total, selectedInstallments, availableBalance, isSelected]);

  const handleInstallmentsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    onInstallmentsChange(value);
  };

  const handleSelect = () => {
    const validation = validateTrismegistoPayment(
      totals.total,
      selectedInstallments,
      availableBalance,
    );

    if (!validation.valid) {
      setValidationError(validation.error || null);
      return;
    }

    setValidationError(null);
    onSelect();
  };

  // Calculate per-installment amount
  const perInstallmentAmount = totals.total / selectedInstallments;

  return (
    <div
      className={`border-2 rounded-xl p-6 transition cursor-pointer ${
        isSelected
          ? "border-primary-light bg-primary-light bg-opacity-5"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={handleSelect}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="paymentMethod"
            checked={isSelected}
            onChange={handleSelect}
            className="w-5 h-5 text-primary-light cursor-pointer"
          />
          <div>
            <h3 className="font-semibold text-gray-900">Pagar con Saldo Trimegisto</h3>
            <p className="text-sm text-gray-600">Pago en cuotas sin intereses</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-dark">
            {formatPrice(totals.total)}
          </p>
        </div>
      </div>

      {/* Expanded Details */}
      {isSelected && (
        <div className="mt-6 space-y-4 border-t pt-4">
          {/* Balance Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <PiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900">Saldo disponible</p>
              <p className="text-blue-700">
                {formatPrice(availableBalance)}
              </p>
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <PiInfo className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-red-900">Validación</p>
                <p className="text-red-700">{validationError}</p>
              </div>
            </div>
          )}

          {/* Installments Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Número de Cuotas
            </label>
            <Select
              name="installments"
              value={selectedInstallments.toString()}
              onChange={handleInstallmentsChange}
              disabled={isLoading}
            >
              <option value="1">1 cuota - {formatPrice(totals.total)}</option>
              <option value="2">
                2 cuotas - {formatInstallmentDisplay(totals.total, 2)}
              </option>
              <option value="3">
                3 cuotas - {formatInstallmentDisplay(totals.total, 3)}
              </option>
            </Select>
          </div>

          {/* Installment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Monto por cuota:</span>
              <span className="font-bold text-gray-900">
                {formatPrice(perInstallmentAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
              <span>Cuotas:</span>
              <span className="font-semibold">{selectedInstallments}</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              📧 <span className="font-semibold">Importante:</span> Recibirás un correo de
              confirmación. Haz click en el enlace para completar la compra.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">✓ Beneficios:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Sin intereses adicionales</li>
              <li>✓ Confirmación instantánea por email</li>
              <li>✓ Compra segura con token de verificación</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
