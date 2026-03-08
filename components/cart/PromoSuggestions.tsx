import { useState } from "react";
import Image from "next/image";
import {
  FaTag,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaBoxOpen,
} from "react-icons/fa";
import { PromoSuggestion, AppliedPromotion } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

interface PromoSuggestionsProps {
  suggestions: PromoSuggestion[];
  appliedPromotions: AppliedPromotion[];
  onApplyPromo: (code: string) => void;
  isApplyingCoupon: boolean;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-1.5">
      <div
        className="bg-primary h-2 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function PromoCard({
  promo,
  onApply,
  isApplying,
}: {
  promo: PromoSuggestion | AppliedPromotion;
  onApply: (code: string) => void;
  isApplying: boolean;
}) {
  const [open, setOpen] = useState(false);

  // Check which type it is
  const isAppliedPromotion = "totalSavings" in promo;

  const isReady =
    !isAppliedPromotion && (promo as PromoSuggestion).status === "ready";
  const isApplied =
    isAppliedPromotion || (promo as PromoSuggestion).alreadyApplied;

  const discountLabel = isAppliedPromotion
    ? `-S/${(promo as AppliedPromotion).totalSavings}`
    : (promo as PromoSuggestion).reductionPercent
      ? `${(promo as PromoSuggestion).reductionPercent}% OFF`
      : (promo as PromoSuggestion).reductionAmount
        ? `-S/${(promo as PromoSuggestion).reductionAmount}`
        : null;

  return (
    <div
      className={`border rounded-sm overflow-hidden transition-all ${
        isApplied
          ? "border-primary bg-primary/5"
          : isReady
            ? "border-primary/40"
            : "border-gray-200"
      }`}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FaTag
            size={13}
            className={
              isApplied || isReady
                ? "text-primary shrink-0"
                : "text-gray-400 shrink-0"
            }
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-800 leading-tight truncate">
              {promo.name}
            </p>
            {discountLabel && (
              <span className="text-xs font-bold text-primary">
                {discountLabel}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isApplied && (
            <span className="flex items-center gap-1 text-xs text-primary font-semibold">
              <FaCheck size={10} /> Aplicado
            </span>
          )}
          {open ? (
            <FaChevronUp size={12} className="text-gray-400" />
          ) : (
            <FaChevronDown size={12} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {isAppliedPromotion ? (
            <p className="text-sm text-gray-600">
              Promoción aplicada correctamente.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                {(promo as PromoSuggestion).message}
              </p>

              {/* COMBO_2 – matching groups */}
              {(promo as PromoSuggestion).description === "COMBO_2" &&
                (promo as PromoSuggestion).matchingGroups && (
                  <div className="space-y-2">
                    {(promo as PromoSuggestion).matchingGroups!.map((g) => (
                      <div key={g.groupIndex}>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Grupo {g.groupIndex + 1}</span>
                          <span>
                            {g.inCart}/{g.required}
                            {g.matched ? " ✓" : ""}
                          </span>
                        </div>
                        <ProgressBar value={g.inCart} max={g.required} />
                      </div>
                    ))}
                  </div>
                )}

              {/* QTY_DISCOUNT – eligible products */}
              {(promo as PromoSuggestion).description === "QTY_DISCOUNT" && (
                <div className="space-y-2">
                  {typeof (promo as PromoSuggestion).inCart === "number" &&
                    typeof (promo as PromoSuggestion).required === "number" && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Unidades en carrito</span>
                          <span>
                            {(promo as PromoSuggestion).inCart}/
                            {(promo as PromoSuggestion).required}
                          </span>
                        </div>
                        <ProgressBar
                          value={(promo as PromoSuggestion).inCart!}
                          max={(promo as PromoSuggestion).required!}
                        />
                      </div>
                    )}
                  {(promo as PromoSuggestion).eligibleProducts &&
                    (promo as PromoSuggestion).eligibleProducts!.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(promo as PromoSuggestion).eligibleProducts!.map(
                          (p) => (
                            <div
                              key={p.productId}
                              className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-sm px-2 py-1"
                            >
                              <div className="relative w-8 h-8 shrink-0">
                                <Image
                                  src={p.coverImage}
                                  alt={p.name}
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-700 leading-tight line-clamp-2">
                                  {p.name}
                                </p>
                                <p className="text-xs text-primary font-semibold">
                                  {formatPrice(p.price.toString())}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                </div>
              )}

              {/* COMBO_PLAN – required products */}
              {(promo as PromoSuggestion).description === "COMBO_PLAN" &&
                (promo as PromoSuggestion).requiredProducts && (
                  <div className="flex flex-wrap gap-2">
                    {(promo as PromoSuggestion).requiredProducts!.map((p) => (
                      <div
                        key={p.productId}
                        className={`flex items-center gap-2 rounded-sm px-2 py-1 border ${
                          p.inCart
                            ? "bg-primary/5 border-primary/30"
                            : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <div className="relative w-8 h-8 shrink-0">
                          <Image
                            src={p.coverImage}
                            alt={p.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700 leading-tight line-clamp-2">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-1">
                            {p.isReductionProduct &&
                            p.priceWithDiscount != null ? (
                              <>
                                <p className="text-xs text-gray-400 line-through">
                                  {formatPrice(p.price.toString())}
                                </p>
                                <p className="text-xs text-primary font-semibold">
                                  {formatPrice(p.priceWithDiscount.toString())}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-primary font-semibold">
                                {formatPrice(p.price.toString())}
                              </p>
                            )}
                          </div>
                        </div>
                        {p.inCart && (
                          <FaCheck
                            size={10}
                            className="text-primary shrink-0"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

              {/* MIN_PURCHASE – missing amount */}
              {(promo as PromoSuggestion).description === "MIN_PURCHASE" && (
                <div>
                  {typeof (promo as PromoSuggestion).currentSubtotal ===
                    "number" &&
                    typeof (promo as PromoSuggestion).minimumAmount ===
                      "number" && (
                      <>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Tu subtotal</span>
                          <span>
                            {formatPrice(
                              (
                                promo as PromoSuggestion
                              ).currentSubtotal!.toString(),
                            )}{" "}
                            /{" "}
                            {formatPrice(
                              (
                                promo as PromoSuggestion
                              ).minimumAmount!.toString(),
                            )}
                          </span>
                        </div>
                        <ProgressBar
                          value={(promo as PromoSuggestion).currentSubtotal!}
                          max={(promo as PromoSuggestion).minimumAmount!}
                        />
                      </>
                    )}
                </div>
              )}

              {/* CTA – apply button */}
              {!isApplied && isReady && (
                <button
                  onClick={() => onApply(promo.code)}
                  disabled={isApplying}
                  className="mt-1 w-full text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-sm transition-colors"
                >
                  {isApplying ? "Aplicando..." : `Aplicar ${promo.code}`}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function PromoSuggestions({
  suggestions,
  appliedPromotions,
  onApplyPromo,
  isApplyingCoupon,
}: PromoSuggestionsProps) {
  // Evitar duplicados si el backend retorna la misma promo en ambas listas
  const appliedIds = new Set(appliedPromotions.map((p) => p.prestashopId));
  const filteredSuggestions = suggestions.filter(
    (p) => !appliedIds.has(p.prestashopId),
  );

  const allItems = [...appliedPromotions, ...filteredSuggestions];

  if (allItems.length === 0) return null;

  return (
    <div className="bg-white rounded-sm shadow-lg p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <FaBoxOpen size={18} className="text-primary" />
        <h3 className="text-lg font-semibold">Promociones disponibles</h3>
      </div>

      <div className="space-y-3">
        {allItems.map((promo) => (
          <PromoCard
            key={promo.prestashopId}
            promo={promo}
            onApply={onApplyPromo}
            isApplying={isApplyingCoupon}
          />
        ))}
      </div>
    </div>
  );
}
