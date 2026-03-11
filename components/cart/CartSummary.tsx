"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { CartCarrier, AppliedPromotion } from "@/lib/cart";
import { FaTimes, FaTag, FaSpinner } from "react-icons/fa";
import { getCurrentUser } from "@/lib/auth/authUtils";
import TrimegistoBalance from "./TrimegistoBalance";

interface CartSummaryProps {
  couponCode: string;
  onCouponCodeChange: (code: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: (code: string) => void;
  isApplyingCoupon: boolean;

  // New props from API
  totals: {
    subtotal: number;
    promoDiscount?: number;
    discount?: number;
    shipping: number;
    total: number;
    trismegistoBalance?: number;
  };
  appliedPromotions: AppliedPromotion[];

  selectedCarrier: CartCarrier | null;
  metodoEnvio: "delivery" | "retiro" | null;
  hasDeliveryDistrict?: boolean;
  acceptTerms: boolean;
  onAcceptTermsChange: (checked: boolean) => void;
  acceptNewsletter: boolean;
  onAcceptNewsletterChange: (checked: boolean) => void;
  isValidatingStock: boolean;
  tiendaSeleccionada: string | null;
  onCheckout: () => void;
  balanceAmount?: number;
  balanceInstallments?: number;
  onTotalsUpdate?: (totals: {
    subtotal: number;
    discount?: number;
    promoDiscount?: number;
    shipping: number;
    trismegistoBalance?: number;
    balanceAmount?: number;
    balanceInstallments?: number;
    total: number;
  }) => void;
}

export default function CartSummary({
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
  isApplyingCoupon,
  totals,
  appliedPromotions,
  selectedCarrier,
  metodoEnvio,
  hasDeliveryDistrict,
  acceptTerms,
  onAcceptTermsChange,
  acceptNewsletter,
  onAcceptNewsletterChange,
  isValidatingStock,
  tiendaSeleccionada,
  onCheckout,
  onTotalsUpdate,
  balanceAmount,
  balanceInstallments,
}: CartSummaryProps) {
  const [isTrimegisto, setIsTrimegisto] = useState(false);
  const [trimegistoApplied, setTrimegistoApplied] = useState(0);
  const [trimegistoCuotas, setTrimegistoCuotas] = useState(1);
  // Holds totals received directly from the PUT response (overrides prop until next full sync)
  const [overrideTotals, setOverrideTotals] = useState<typeof totals | null>(null);
  const activeTotals = overrideTotals ?? totals;

  useEffect(() => {
    const user = getCurrentUser();
    const role = (user?.role || "").toUpperCase();
    setIsTrimegisto(role === "TRIMEGISTO" || role === "TRISMEGISMO");
  }, []);

  // Whenever the cart prop totals change (full sync), clear the local override
  useEffect(() => {
    setOverrideTotals(null);
  }, [totals]);

  // Use the backend-provided trismegistoBalance when available, otherwise fall back to local state
  const trismegistoDiscountFromApi = activeTotals.trismegistoBalance ?? 0;
  const effectiveTrimegistoApplied = trismegistoDiscountFromApi > 0 ? trismegistoDiscountFromApi : trimegistoApplied;
  const finalTotal = Math.max(activeTotals.total - (trismegistoDiscountFromApi > 0 ? 0 : trimegistoApplied), 0);

  return (
    <div className="lg:col-span-1 z-10 space-y-6">
      {/* === SALDO TRIMEGISTO === */}
      {isTrimegisto && (
        <TrimegistoBalance
          cartTotal={Math.max(0, activeTotals.subtotal - (activeTotals.discount ?? 0) - (activeTotals.promoDiscount ?? 0))}
          initialBalanceAmount={balanceAmount}
          initialBalanceInstallments={balanceInstallments}
          onBalanceChange={(applied, cuotas) => {
            setTrimegistoApplied(applied);
            setTrimegistoCuotas(cuotas);
          }}
          onTotalsUpdate={(t) => {
            setOverrideTotals({ ...activeTotals, ...t });
            onTotalsUpdate?.(t);
          }}
        />
      )}

      {/* === SECCIÓN CUPÓN === */}
      {/* 
      <div className="bg-white rounded-sm shadow-lg p-6 animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">Código de cupón</h3>

        <div className="flex flex-col sm:flex-row md:gap-0 gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !isApplyingCoupon &&
              couponCode.trim() &&
              onApplyCoupon()
            }
            placeholder="Ingresa tu cupón"
            className="w-full px-4 py-2 border border-gray-300 rounded-xs md:rounded-r-none md:rounded-xs focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
          />

          <button
            onClick={onApplyCoupon}
            disabled={isApplyingCoupon || !couponCode.trim()}
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 md:rounded-l-none rounded-full md:rounded-xs border border-primary transition-colors flex items-center justify-center gap-2"
          >
            {isApplyingCoupon ? (
              <FaSpinner size={14} className="animate-spin" />
            ) : (
              "Aplicar"
            )}
          </button>
        </div>
      </div>
      */}

      {/* === SECCIÓN RESUMEN === */}
      <div className="bg-white rounded-sm shadow-lg p-6 lg:sticky lg:top-32 animate-fade-in">
        <h2 className="text-xl font-semibold mb-6">Resumen del pedido</h2>

        {/* Detalle */}
        <div className="space-y-3 mb-6 pb-6 border-b">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold">
              {formatPrice(activeTotals.subtotal.toString())}
            </span>
          </div>

          {/* Descuentos por promociones/cupones */}
          {/*
          {totals.promoDiscount !== undefined && totals.promoDiscount > 0 && (
            <div className="flex justify-between text-primary font-medium">
              <span className="flex items-center gap-1.5">
                <FaTag size={12} />
                Descuento promoción
              </span>
              <span className="font-semibold">
                -{formatPrice(totals.promoDiscount.toString())}
              </span>
            </div>
          )}
          */}

          {/* Otros descuentos globales/reglas */}
          {activeTotals.discount !== undefined && activeTotals.discount > 0 && (
            <div className="flex justify-between text-primary font-medium">
              <span className="flex items-center gap-1.5">
                <FaTag size={12} />
                Descuentos extras
              </span>
              <span className="font-semibold">
                -{formatPrice(activeTotals.discount.toString())}
              </span>
            </div>
          )}

          {/* Lista de promociones aplicadas (si hay) */}
          {/*
          {appliedPromotions && appliedPromotions.length > 0 && (
            <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Promociones Aplicadas
              </p>
              {appliedPromotions.map((promo) => (
                <div
                  key={promo.prestashopId}
                  className="flex flex-col bg-primary/5 rounded border border-primary/20 p-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-1.5 flex-1 pr-2">
                      <FaTag size={12} className="text-primary mt-1 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-primary break-all leading-tight">
                          {promo.code}
                        </p>
                        <p
                          className="text-xs text-gray-600 mt-0.5 line-clamp-2"
                          title={promo.name}
                        >
                          {promo.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {promo.totalSavings > 0 && (
                        <span className="text-sm font-bold text-primary">
                          -{formatPrice(promo.totalSavings.toString())}
                        </span>
                      )}
                      <button
                        onClick={() => onRemoveCoupon(promo.code)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar promoción"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          */}

          {/* Costo de Envío */}
          <div className="flex justify-between text-gray-600 mt-4">
            <span>Envío ({selectedCarrier?.name || "Pendiente"})</span>
            <span className="font-semibold">
              {!metodoEnvio ||
                (metodoEnvio === "delivery" && !hasDeliveryDistrict) ? (
                <span className="text-gray-400 font-normal text-sm">
                  Pendiente
                </span>
              ) : activeTotals.shipping === 0 ? (
                <span className="text-primary">Gratis</span>
              ) : (
                formatPrice(activeTotals.shipping.toString())
              )}
            </span>
          </div>

          {metodoEnvio === "delivery" &&
            selectedCarrier?.isFree &&
            hasDeliveryDistrict && (
              <p className="text-xs text-primary font-medium">
                ¡Este método de envío es gratuito!
              </p>
            )}

          {/* Saldo Trimegisto aplicado (de API o local) */}
          {isTrimegisto && effectiveTrimegistoApplied > 0 && (
            <div className="flex justify-between text-primary font-medium mt-2">
              <span className="flex items-center gap-1.5 text-sm">
                Saldo Trimegisto
                {trimegistoCuotas > 1 && (
                  <span className="text-xs text-gray-400">({trimegistoCuotas} cuotas)</span>
                )}
              </span>
              <span className="font-semibold">− {formatPrice(effectiveTrimegistoApplied.toFixed(2))}</span>
            </div>
          )}
        </div>

        {/* Total Final */}
        <div className="flex justify-between items-center text-2xl font-semibold mb-6">
          <span>Total</span>
          <span className="text-primary tracking-tight">
            {formatPrice(finalTotal.toFixed(2))}
          </span>
        </div>

        {isTrimegisto && effectiveTrimegistoApplied > 0 && finalTotal > 0 && (
          <p className="text-xs text-gray-500 -mt-4 mb-4 text-right">
            Restante a pagar: <span className="font-semibold text-gray-700">{formatPrice(finalTotal.toFixed(2))}</span>
          </p>
        )}
        {isTrimegisto && effectiveTrimegistoApplied > 0 && finalTotal === 0 && (
          <p className="text-xs text-green-600 font-medium -mt-4 mb-4 text-right">
            ✓ Pedido cubierto completamente por tu saldo
          </p>
        )}

        {/* Términos */}
        <div className="space-y-3 mb-6 pb-6 border-b">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => onAcceptTermsChange(e.target.checked)}
              className="mt-1 w-4 h-4 min-w-4 min-h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <label
              htmlFor="acceptTerms"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Acepto los{" "}
              <Link
                href="/terminos-y-condiciones"
                className="text-primary hover:underline"
                target="_blank"
              >
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link
                href="/politicas/politica-de-envio-y-recojo-pedidos"
                className="text-primary hover:underline"
                target="_blank"
              >
                Política de Envío y Recojo de Pedidos
              </Link>
            </label>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="acceptNewsletter"
              checked={acceptNewsletter}
              onChange={(e) => onAcceptNewsletterChange(e.target.checked)}
              className="mt-1 w-4 h-4 min-w-4 min-h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <label
              htmlFor="acceptNewsletter"
              className="text-sm text-gray-500 cursor-pointer"
            >
              Quiero recibir ofertas y beneficios exclusivos
            </label>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="primary"
          size="md"
          className="w-full mb-3 flex justify-center items-center gap-2"
          disabled={
            (metodoEnvio === "retiro" && !tiendaSeleccionada) ||
            isValidatingStock
          }
          onClick={onCheckout}
        >
          {isValidatingStock ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Validando stock...
            </div>
          ) : activeTotals.trismegistoBalance &&
            activeTotals.trismegistoBalance > 0 ? (
            "Enviar confirmacion"
          ) : (
            "Finalizar compra"
          )}
        </Button>

        <Button
          href="/productos"
          variant="outline"
          size="md"
          className="w-full"
        >
          Seguir comprando
        </Button>
      </div>
    </div>
  );
}
