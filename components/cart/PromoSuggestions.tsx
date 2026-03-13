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
  FaPlus,
  FaSpinner,
} from "react-icons/fa";
import {
  PromoSuggestion,
  AppliedPromotion,
  ComboPlanStep,
  Combo2EligibleGroup,
  EligibleProduct,
} from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { showToast } from "@/lib/notifications";

interface PromoSuggestionsProps {
  suggestions: PromoSuggestion[];
  appliedPromotions: AppliedPromotion[];
  onApplyPromo: (code: string) => void;
  isApplyingCoupon: boolean;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const numValue = Number(value) || 0;
  const numMax = Number(max) || 1;
  const pct = Math.min(100, Math.round((numValue / numMax) * 100));
  const isComplete = pct >= 100;
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div
        className={`h-1.5 rounded-full transition-all duration-700 ease-out ${
          isComplete
            ? "bg-green-500"
            : numValue > 0
              ? "bg-primary"
              : "bg-gray-300"
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
    productId?: string | number;
    prestashopId?: number;
    name: string;
    coverImage: string;
    price: number;
    inCart?: boolean;
    isReductionProduct?: boolean;
    priceWithDiscount?: number | null;
    linkRewrite?: string;
    hasVariations?: boolean;
  };
  highlight?: boolean;
}) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const inCart = !!p.inCart;
  const href = p.linkRewrite
    ? `/tienda/${p.linkRewrite}`
    : `/tienda/${p.productId || p.prestashopId}`;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evitar navegar por el Link
    if (isAdding) return;

    setIsAdding(true);
    try {
      await addToCart(
        {
          id: p.prestashopId || p.productId,
          productId: p.prestashopId || Number(p.productId),
          name: p.name,
          price: p.priceWithDiscount ?? p.price,
          coverImage: p.coverImage,
          linkRewrite: p.linkRewrite,
          originalPrice: p.price,
          quantity: 1,
        } as any,
        1,
      );
      showToast(`${p.name} agregado al carrito`, "success");
    } catch (error) {
      console.error(error);
      showToast(`No se pudo agregar ${p.name}`, "error");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 rounded-sm px-3 py-2.5 border min-w-[220px] transition-all hover:shadow-sm active:scale-[0.98] ${
        inCart || highlight
          ? "bg-primary/5 border-primary/25 hover:bg-primary/10 pb-2.5"
          : "bg-gray-50 border-gray-100 hover:bg-gray-100 pb-2.5"
      }`}
    >
      <div className="w-14 h-14 shrink-0 rounded overflow-hidden bg-white flex items-center justify-center">
        <Image
          src={p.coverImage}
          alt={p.name}
          width={60}
          height={60}
          className="object-contain w-full h-full"
          sizes="60px"
        />
      </div>
      <div className="min-w-0 pr-6">
        <p className="text-xs font-semibold text-gray-700 leading-tight line-clamp-2 max-w-[130px]">
          {p.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          {p.priceWithDiscount != null ? (
            <>
              <span className="text-[11px] text-gray-400 line-through">
                {formatPrice(p.price.toString())}
              </span>
              <span className="text-sm text-primary font-bold">
                {formatPrice(p.priceWithDiscount.toString())}
              </span>
            </>
          ) : (
            <span className="text-sm text-primary font-bold">
              {formatPrice(p.price.toString())}
            </span>
          )}
        </div>
      </div>

      {inCart ? (
        <FaCheck
          size={9}
          className="text-primary shrink-0 ml-auto absolute right-2 top-1/2 -translate-y-1/2"
        />
      ) : p.hasVariations === false ? (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
          onClick={handleAdd}
          disabled={isAdding}
          aria-label="Agregar al carrito"
        >
          {isAdding ? (
            <FaSpinner size={10} className="animate-spin" />
          ) : (
            <FaPlus size={10} />
          )}
        </button>
      ) : null}
    </Link>
  );
}

/* ─── Step indicator for COMBO_PLAN ─── */
function StepRow({ step }: { step: ComboPlanStep }) {
  return (
    <div
      className={`flex gap-3 p-3 rounded-sm border ${
        step.completed
          ? "border-green-200 bg-green-50"
          : "border-gray-100 bg-gray-50"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
          step.completed
            ? "bg-green-500 text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        {step.completed ? <FaCheck size={7} /> : step.step}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <p
          className={`text-xs leading-snug ${
            step.completed ? "text-green-700 font-semibold" : "text-gray-600"
          }`}
        >
          {step.description}
        </p>

        {step.eligibleProducts && step.eligibleProducts.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2">
            {step.eligibleProducts.map((p, i) => (
              <ProductChip key={p.productId ?? p.prestashopId ?? i} p={p} />
            ))}
          </div>
        )}

        {step.product && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2">
            <ProductChip
              p={{ ...step.product, isReductionProduct: true }}
              highlight
            />
          </div>
        )}
      </div>
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

  const isAppliedPromotion = "totalSavings" in promo;
  const suggestion = promo as PromoSuggestion;

  const isReady = !isAppliedPromotion && suggestion.status === "ready";
  const isApplied = isAppliedPromotion || suggestion.alreadyApplied;

  const discountLabel = isAppliedPromotion
    ? `-S/${(promo as AppliedPromotion).totalSavings}`
    : suggestion.reductionPercent
      ? `${suggestion.reductionPercent}% OFF`
      : suggestion.reductionAmount
        ? `-S/${suggestion.reductionAmount}`
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
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isApplied
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-gray-800 leading-tight truncate">
              {promo.name}
            </p>
            <StatusPill isApplied={!!isApplied} isReady={isReady} />
          </div>
          {discountLabel && (
            <p
              className={`text-xs font-bold mt-0.5 ${isApplied ? "text-green-600" : "text-primary"}`}
            >
              {discountLabel}
            </p>
          )}
        </div>

        <div className="shrink-0 text-gray-300">
          {open ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
        </div>
      </button>

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
                  {suggestion.message}
                </p>

                {/* ── COMBO_2 ── */}
                {suggestion.description === "COMBO_2" &&
                  (() => {
                    // Use eligibleProducts as eligibleGroups
                    const isGroups =
                      suggestion.eligibleProducts &&
                      suggestion.eligibleProducts.length > 0 &&
                      "groupIndex" in suggestion.eligibleProducts[0];

                    const hasMatchingGroups =
                      suggestion.matchingGroups &&
                      suggestion.matchingGroups.length > 0;

                    // New format: eligibleGroups
                    if (isGroups) {
                      const groups =
                        suggestion.eligibleProducts as Combo2EligibleGroup[];
                      const combosRequired = 2; // COMBO_2 requires 2 groups
                      const satisfiedGroups = groups.filter((g) => g.satisfied);
                      const pendingGroups = groups.filter((g) => !g.satisfied);
                      const progressTowardCombo = Math.min(
                        satisfiedGroups.length,
                        combosRequired,
                      );
                      const ready = satisfiedGroups.length >= combosRequired;

                      return (
                        <div className="mt-3 space-y-3">
                          {/* <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 font-medium">
                                Progreso del combo
                              </span>
                              <span
                                className={
                                  ready
                                    ? "text-green-600 font-bold"
                                    : satisfiedGroups.length > 0
                                      ? "text-primary font-semibold"
                                      : "text-gray-400"
                                }
                              >
                                {progressTowardCombo}/{combosRequired}{" "}
                                {ready ? "✓" : ""}
                              </span>
                            </div>
                            <ProgressBar
                              value={progressTowardCombo}
                              max={combosRequired}
                            />
                          </div> */}

                          {satisfiedGroups.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wide">
                                ✓ Grupos completados ({satisfiedGroups.length})
                              </p>
                              {satisfiedGroups.map((g) => (
                                <div
                                  key={g.groupIndex}
                                  className="rounded-sm p-2.5 border bg-green-50 border-green-200"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-green-700">
                                      Grupo {g.groupIndex + 1}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                      <FaCheck size={7} /> Posible combinación
                                    </span>
                                  </div>
                                  {g.products && g.products.length > 0 && (
                                    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2">
                                      {g.products.map((p, i) => (
                                        <ProductChip
                                          key={
                                            p.productId ?? p.prestashopId ?? i
                                          }
                                          p={p}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {pendingGroups.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                                Grupos pendientes — elige 1 producto de
                                cualquiera
                              </p>
                              {pendingGroups.map((g) => (
                                <div
                                  key={g.groupIndex}
                                  className="rounded-md p-2.5 border bg-gray-50 border-gray-200"
                                >
                                  <span className="text-xs font-semibold text-gray-500 block mb-2">
                                    Grupo {g.groupIndex + 1}
                                  </span>
                                  {g.products && g.products.length > 0 && (
                                    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2">
                                      {g.products.map((p, i) => (
                                        <ProductChip
                                          key={
                                            p.productId ?? p.prestashopId ?? i
                                          }
                                          p={p}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Legacy format: matchingGroups (for backward compatibility if needed)
                    if (hasMatchingGroups) {
                      const groups = suggestion.matchingGroups!;
                      const combosRequired = 2;
                      const matchedGroups = groups.filter((g) => g.matched);
                      const pendingGroups = groups.filter((g) => !g.matched);
                      const progressTowardCombo = Math.min(
                        matchedGroups.length,
                        combosRequired,
                      );
                      const ready = matchedGroups.length >= combosRequired;

                      return (
                        <div className="mt-3 space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 font-medium">
                                Progreso del combo
                              </span>
                              <span
                                className={
                                  ready
                                    ? "text-green-600 font-bold"
                                    : matchedGroups.length > 0
                                      ? "text-primary font-semibold"
                                      : "text-gray-400"
                                }
                              >
                                {progressTowardCombo}/{combosRequired}{" "}
                                {ready ? "✓" : ""}
                              </span>
                            </div>
                            <ProgressBar
                              value={progressTowardCombo}
                              max={combosRequired}
                            />
                          </div>
                          {/* the rest of matchingGroups rendering omitted for brevity, but same as above */}
                        </div>
                      );
                    }

                    return null;
                  })()}

                {/* ── QTY_DISCOUNT ── */}
                {suggestion.description === "QTY_DISCOUNT" && (
                  <div className="mt-3 space-y-2">
                    {typeof suggestion.inCart === "number" &&
                      typeof suggestion.required === "number" && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Unidades en carrito</span>
                            <span>
                              {suggestion.inCart}/{suggestion.required}
                            </span>
                          </div>
                          <ProgressBar
                            value={suggestion.inCart}
                            max={suggestion.required}
                          />
                        </div>
                      )}
                    {suggestion.eligibleProducts &&
                      suggestion.eligibleProducts.length > 0 &&
                      !("groupIndex" in suggestion.eligibleProducts[0]) && (
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                            Productos elegibles
                          </p>
                          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2">
                            {(
                              suggestion.eligibleProducts as EligibleProduct[]
                            ).map((p, i) => (
                              <ProductChip
                                key={p.productId ?? p.prestashopId ?? i}
                                p={p}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* ── COMBO_PLAN ── */}
                {suggestion.description === "COMBO_PLAN" &&
                  (() => {
                    if (suggestion.steps && suggestion.steps.length > 0) {
                      const completedCount = suggestion.steps.filter(
                        (s) => s.completed,
                      ).length;
                      return (
                        <div className="mt-3 space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 font-medium">
                                Pasos completados
                              </span>
                              <span
                                className={
                                  completedCount === suggestion.steps!.length
                                    ? "text-green-600 font-bold"
                                    : "text-primary font-semibold"
                                }
                              >
                                {completedCount}/{suggestion.steps!.length}
                              </span>
                            </div>
                            <ProgressBar
                              value={completedCount}
                              max={suggestion.steps!.length}
                            />
                          </div>
                          {suggestion.steps.map((step) => (
                            <StepRow key={step.step} step={step} />
                          ))}
                        </div>
                      );
                    }

                    if (
                      suggestion.requiredProducts &&
                      suggestion.requiredProducts.length > 0
                    ) {
                      return (
                        <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2">
                          {suggestion.requiredProducts.map((p, i) => (
                            <ProductChip
                              key={p.productId ?? i}
                              p={p}
                              highlight={p.inCart}
                            />
                          ))}
                        </div>
                      );
                    }

                    return null;
                  })()}

                {/* ── MIN_PURCHASE ── */}
                {suggestion.description === "MIN_PURCHASE" && (
                  <div className="mt-3 space-y-3">
                    {typeof suggestion.currentSubtotal === "number" &&
                      typeof suggestion.minimumAmount === "number" && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Tu subtotal</span>
                            <span>
                              {formatPrice(
                                suggestion.currentSubtotal.toString(),
                              )}{" "}
                              <b>
                                /{" "}
                                {formatPrice(
                                  suggestion.minimumAmount.toString(),
                                )}
                              </b>
                            </span>
                          </div>
                          <ProgressBar
                            value={suggestion.currentSubtotal}
                            max={suggestion.minimumAmount}
                          />
                          {typeof suggestion.missingAmount === "number" &&
                            suggestion.missingAmount > 0 && (
                              <p className="text-[11px] text-gray-400 mt-1">
                                Te faltan{" "}
                                <span className="font-semibold text-primary">
                                  {formatPrice(
                                    suggestion.missingAmount.toString(),
                                  )}
                                </span>{" "}
                                para activar el descuento
                              </p>
                            )}
                        </div>
                      )}
                    {suggestion.eligibleProducts &&
                      suggestion.eligibleProducts.length > 0 &&
                      !("groupIndex" in suggestion.eligibleProducts[0]) && (
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                            Productos sugeridos con precio especial
                          </p>
                          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2">
                            {(
                              suggestion.eligibleProducts as EligibleProduct[]
                            ).map((p, i) => (
                              <ProductChip
                                key={p.productId ?? p.prestashopId ?? i}
                                p={p}
                              />
                            ))}
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

  // Condición pedida por el cliente: Si hay un producto elegible del COMBO_2 en el carrito,
  // se debe sugerir también el COMBO_PLAN.
  const combo2Suggestion = suggestions.find((s) => s.description === "COMBO_2");
  let hasCombo2InCart = false;
  if (
    combo2Suggestion?.eligibleProducts &&
    combo2Suggestion.eligibleProducts.length > 0
  ) {
    if ("groupIndex" in combo2Suggestion.eligibleProducts[0]) {
      hasCombo2InCart = (
        combo2Suggestion.eligibleProducts as Combo2EligibleGroup[]
      ).some((group) => group.products.some((prod) => prod.inCart));
    } else {
      hasCombo2InCart = (
        combo2Suggestion.eligibleProducts as EligibleProduct[]
      ).some((prod) => prod.inCart);
    }
  }

  // Condición pedida: Sólo mostrar sugerencias personalizadas cuando uno de sus productos elegibles ya está en el carrito.
  const filteredSuggestions = suggestions.filter((p) => {
    // 1. Ocultar si ya está aplicada
    if (appliedIds.has(p.prestashopId)) return false;

    // 2. Comprobar si hay algún producto elegible en el carrito
    let hasProductInCart = false;

    // QTY_DISCOUNT / MIN_PURCHASE usan eligibleProducts normal
    // COMBO_2 usa eligibleProducts pero en formato Combo2EligibleGroup
    if (p.eligibleProducts && p.eligibleProducts.length > 0) {
      if ("groupIndex" in p.eligibleProducts[0]) {
        // COMBO_2
        if (
          (p.eligibleProducts as Combo2EligibleGroup[]).some((group) =>
            group.products.some((prod) => prod.inCart),
          )
        ) {
          hasProductInCart = true;
        }
      } else {
        // QTY_DISCOUNT / MIN_PURCHASE
        if (
          (p.eligibleProducts as EligibleProduct[]).some((prod) => prod.inCart)
        ) {
          hasProductInCart = true;
        }
      }
    }

    // COMBO_PLAN usa steps, pero también mostramos el COMBO_PLAN si el COMBO_2 tiene items en el carro
    if (p.description === "COMBO_PLAN") {
      if (
        hasCombo2InCart ||
        p.steps?.some((step) =>
          step.eligibleProducts?.some((prod) => prod.inCart),
        )
      ) {
        hasProductInCart = true;
      }
    } else {
      if (
        !hasProductInCart &&
        p.steps?.some((step) =>
          step.eligibleProducts?.some((prod) => prod.inCart),
        )
      ) {
        hasProductInCart = true;
      }
    }

    // API antigua matchingGroups (por si acaso)
    if (
      !hasProductInCart &&
      p.matchingGroups?.some((group) =>
        group.products?.some((prod) => (prod as any).inCart),
      )
    ) {
      hasProductInCart = true;
    }

    // Para no ser tan destructivos y evitar que no salga nada en un MIN_PURCHASE:
    if (
      p.description === "MIN_PURCHASE" &&
      p.currentSubtotal &&
      p.currentSubtotal > 0
    ) {
      hasProductInCart = true;
    }

    return hasProductInCart;
  });

  const allItems = [...appliedPromotions, ...filteredSuggestions];

  if (allItems.length === 0) return null;

  const readyCount = filteredSuggestions.filter(
    (p) => p.status === "ready",
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
              Promociones personalizadas
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
