import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaTag,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaBolt,
  FaLock,
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
  const isComplete = pct >= 100;
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div
        className={`h-1.5 rounded-full transition-all duration-700 ease-out ${isComplete ? "bg-green-500" : "bg-primary"
          }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatusPill({
  isApplied,
  isReady,
}: {
  isApplied: boolean;
  isReady: boolean;
}) {
  if (isApplied)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        <FaCheck size={8} /> Aplicado
      </span>
    );
  if (isReady)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
        <FaBolt size={8} /> Listo
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      <FaLock size={8} /> Pendiente
    </span>
  );
}

function ProductChip({
  p,
  highlight,
}: {
  p: {
    productId: string | number;
    name: string;
    coverImage: string;
    price: number;
    inCart?: boolean;
    isReductionProduct?: boolean;
    priceWithDiscount?: number | null;
    linkRewrite?: string;
  };
  highlight?: boolean;
}) {
  return (
    <Link
      href={`/tienda/${p.linkRewrite || p.productId}`}
      className={`flex items-center gap-2 rounded-sm px-2 py-1.5 border min-w-[170px] transition-all hover:shadow-sm active:scale-[0.98] ${highlight
        ? "bg-primary/5 border-primary/25 hover:bg-primary/10"
        : "bg-gray-50 border-gray-100 hover:bg-gray-100"
        }`}
    >
      <div className="relative w-9 h-9 shrink-0 rounded overflow-hidden bg-white">
        <Image
          src={p.coverImage}
          alt={p.name}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-gray-700 leading-tight line-clamp-2 max-w-[100px]">
          {p.name}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          {p.isReductionProduct && p.priceWithDiscount != null ? (
            <>
              <span className="text-[10px] text-gray-400 line-through">
                {formatPrice(p.price.toString())}
              </span>
              <span className="text-[10px] text-primary font-bold">
                {formatPrice(p.priceWithDiscount.toString())}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-primary font-bold">
              {formatPrice(p.price.toString())}
            </span>
          )}
        </div>
      </div>
      {p.inCart && (
        <FaCheck size={9} className="text-primary shrink-0 ml-auto" />
      )}
    </Link>
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

  const borderClass = isApplied
    ? "border-green-200 bg-green-50/50"
    : isReady
      ? "border-primary/30 bg-primary/[0.02]"
      : "border-gray-200 bg-white";

  return (
    <div
      className={`border rounded-sm overflow-hidden transition-all duration-200 ${borderClass}`}
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((prev) => !prev)}
      >
        {/* Icon */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isApplied
            ? "bg-green-100"
            : isReady
              ? "bg-primary/10"
              : "bg-gray-100"
            }`}
        >
          <FaTag
            size={12}
            className={
              isApplied
                ? "text-green-600"
                : isReady
                  ? "text-primary"
                  : "text-gray-400"
            }
          />
        </div>

        {/* Title + badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-gray-800 leading-tight truncate">
              {promo.name}
            </p>
            <StatusPill isApplied={!!isApplied} isReady={isReady} />
          </div>
          {discountLabel && (
            <p
              className={`text-xs font-bold mt-0.5 ${isApplied ? "text-green-600" : "text-primary"
                }`}
            >
              {discountLabel}
            </p>
          )}
        </div>

        {/* Chevron */}
        <div className="shrink-0 text-gray-300">
          {open ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
        </div>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-gray-100">
          <div className="pt-3">
            {isAppliedPromotion ? (
              <p className="text-sm text-gray-500">
                🎉 ¡Promoción aplicada! Ahorras{" "}
                <strong className="text-green-600">
                  S/{(promo as AppliedPromotion).totalSavings}
                </strong>{" "}
                en tu pedido.
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {(promo as PromoSuggestion).message}
                </p>

                {/* COMBO_2 */}
                {(promo as PromoSuggestion).description === "COMBO_2" &&
                  (promo as PromoSuggestion).matchingGroups && (
                    <div className="mt-3 space-y-4">
                      {(promo as PromoSuggestion).matchingGroups!.map((g) => (
                        <div key={g.groupIndex}>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span className="font-medium text-gray-600">
                              Grupo {g.groupIndex + 1}
                            </span>
                            <span
                              className={
                                g.matched ? "text-green-600 font-bold" : ""
                              }
                            >
                              {g.inCart}/{g.required}
                              {g.matched ? " ✓" : ""}
                            </span>
                          </div>
                          <ProgressBar value={g.inCart} max={g.required} />
                          {g.products && g.products.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {g.products.map((p) => (
                                <ProductChip key={p.productId} p={p} />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                {/* QTY_DISCOUNT */}
                {(promo as PromoSuggestion).description === "QTY_DISCOUNT" && (
                  <div className="mt-3 space-y-2">
                    {typeof (promo as PromoSuggestion).inCart === "number" &&
                      typeof (promo as PromoSuggestion).required ===
                      "number" && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
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
                      (promo as PromoSuggestion).eligibleProducts!.length >
                      0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(promo as PromoSuggestion).eligibleProducts!.map(
                            (p) => (
                              <ProductChip key={p.productId} p={p} />
                            )
                          )}
                        </div>
                      )}
                  </div>
                )}

                {/* COMBO_PLAN */}
                {(promo as PromoSuggestion).description === "COMBO_PLAN" &&
                  (promo as PromoSuggestion).requiredProducts && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(promo as PromoSuggestion).requiredProducts!.map((p) => (
                        <ProductChip
                          key={p.productId}
                          p={p}
                          highlight={p.inCart}
                        />
                      ))}
                    </div>
                  )}

                {/* MIN_PURCHASE */}
                {(promo as PromoSuggestion).description === "MIN_PURCHASE" && (
                  <div className="mt-3 space-y-3">
                    {typeof (promo as PromoSuggestion).currentSubtotal ===
                      "number" &&
                      typeof (promo as PromoSuggestion).minimumAmount ===
                      "number" && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Tu subtotal</span>
                            <span>
                              {formatPrice(
                                (
                                  promo as PromoSuggestion
                                ).currentSubtotal!.toString()
                              )}{" "}
                              <b>/{" "}
                                {formatPrice(
                                  (
                                    promo as PromoSuggestion
                                  ).minimumAmount!.toString()
                                )}</b>
                            </span>
                          </div>
                          <ProgressBar
                            value={(promo as PromoSuggestion).currentSubtotal!}
                            max={(promo as PromoSuggestion).minimumAmount!}
                          />
                        </div>
                      )}
                    {(promo as PromoSuggestion).eligibleProducts &&
                      (promo as PromoSuggestion).eligibleProducts!.length >
                      0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                            Productos elegibles
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(promo as PromoSuggestion).eligibleProducts!.map(
                              (p) => (
                                <ProductChip key={p.productId} p={p} />
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* CTA */}
                {!isApplied && isReady && (
                  <button
                    onClick={() => onApply(promo.code)}
                    disabled={isApplying}
                    className="mt-4 w-full text-sm font-semibold text-white bg-primary hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 rounded-md transition-all duration-150"
                  >
                    {isApplying ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Aplicando...
                      </span>
                    ) : (
                      `Aplicar ${promo.code}`
                    )}
                  </button>
                )}
              </>
            )}
          </div>
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
  const appliedIds = new Set(appliedPromotions.map((p) => p.prestashopId));
  const filteredSuggestions = suggestions.filter(
    (p) => !appliedIds.has(p.prestashopId)
  );

  const allItems = [...appliedPromotions, ...filteredSuggestions];

  if (allItems.length === 0) return null;

  const readyCount = filteredSuggestions.filter(
    (p) => p.status === "ready"
  ).length;

  return (
    <div className="bg-white rounded-md border border-gray-100 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FaTag size={13} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 leading-tight">
              Promociones disponibles
            </h3>
            <p className="text-xs text-gray-400">
              {allItems.length} promocion{allItems.length !== 1 ? "es" : ""}
              {readyCount > 0 && (
                <span className="text-primary font-semibold">
                  {" "}
                  · {readyCount} lista{readyCount !== 1 ? "s" : ""} para aplicar
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-2">
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