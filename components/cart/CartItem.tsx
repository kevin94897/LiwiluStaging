import Image from "next/image";
import Link from "next/link";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaRegClock,
  FaRegTrashAlt,
  FaBoxes,
} from "react-icons/fa";
import {
  formatPrice,
  getProductName,
  getProductImageUrl,
  getEffectivePrice,
  getRegularPrice,
  hasDiscount,
} from "@/lib/utils";
import { FaTag } from "react-icons/fa6";
import { CartItem as CartItemType } from "@/context/CartContext";
import {
  SavarStockValidationResult,
  StockValidationResponse,
  WarehouseMapItem,
  AppliedPromotion,
} from "@/lib/cart";

interface CartItemProps {
  item: CartItemType;
  index: number;
  metodoEnvio: "delivery" | "retiro" | null;
  savarStockResults: SavarStockValidationResult[];
  tiendaSeleccionada: string | null;
  stockValidationResult: StockValidationResponse | null;
  infoTiendaSeleccionada: WarehouseMapItem | undefined;
  isValidatingStock: boolean;
  isValidatingSavar: boolean;
  hasDeliveryDistrict: boolean;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  appliedPromotions?: AppliedPromotion[];
  hasMixedItems?: boolean;
}

export default function CartItem({
  item,
  index,
  metodoEnvio,
  savarStockResults,
  tiendaSeleccionada,
  stockValidationResult,
  infoTiendaSeleccionada,
  isValidatingStock,
  isValidatingSavar,
  hasDeliveryDistrict,
  onRemove,
  onUpdateQuantity,
  appliedPromotions = [],
  hasMixedItems = false,
}: CartItemProps) {
  // Prioritize the direct coverImage property if available (new logic)
  // Otherwise fall back to associations (legacy logic)
  let imageUrl = item.product.coverImage;

  if (!imageUrl) {
    const imageId = item.product.associations?.images?.[0]?.id;
    if (imageId) {
      imageUrl = getProductImageUrl(item.product.id.toString(), imageId);
    } else {
      imageUrl = "/images/placeholder-product.jpg";
    }
  }

  // Use centralized price logic from utils
  const effectivePrice = getEffectivePrice(item.product);
  const regularPrice = getRegularPrice(item.product);
  const hasDiscountPrice = hasDiscount(item.product);

  const precioUnitario = effectivePrice;
  const precioTotal = precioUnitario * item.quantity;

  const notAvailableForDelivery =
    metodoEnvio === "delivery" && item.product.availableForOrder === false;

  // Determine the stock status for the item: available, outOfStock, or neutral
  const itemStockStatus = (() => {
    // Show neutral while validating to avoid flickering (handled by loader UI)
    if (metodoEnvio === "delivery" && isValidatingSavar) return "loading";
    if (metodoEnvio === "retiro" && isValidatingStock) return "loading";

    if (metodoEnvio === "delivery") {
      if (!hasDeliveryDistrict) return "neutral";
      if (savarStockResults.length === 0) return "neutral";
      const savarResult = savarStockResults.find(
        (r) => r.reference === item.product.reference,
      );
      if (!savarResult) return "neutral";
      return savarResult.disponible ? "available" : "outOfStock";
    }

    if (metodoEnvio === "retiro") {
      if (!tiendaSeleccionada || !stockValidationResult) return "neutral";
      const selectedWh = stockValidationResult.resultadosPorAlmacen.find(
        (w) => w.idAlmacen.toString() === tiendaSeleccionada,
      );
      if (!selectedWh) return "neutral";
      const productInWh = selectedWh.productos.find(
        (p) => p.reference === item.product.reference,
      );
      if (!productInWh) return "neutral";
      return productInWh.disponible ? "available" : "outOfStock";
    }

    return "neutral";
  })();

  const isRetailInMixedCart = hasMixedItems && !item.product.mayorista;

  return (
    <div
      className={`bg-white rounded-sm shadow-md p-6 flex gap-4 animate-fade-in-up relative overflow-hidden transition-all ${isRetailInMixedCart
        ? "border-2 border-red-500 bg-red-50/30"
        : notAvailableForDelivery
          ? "border-2 border-amber-400 opacity-75"
          : itemStockStatus === "available"
            ? "border-2 border-primary"
            : "border-2 border-transparent"
        }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* No disponible para delivery banner */}
      {notAvailableForDelivery && !isRetailInMixedCart && (
        <div className="absolute top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center gap-2 z-10">
          <FaRegClock size={13} className="text-amber-600 shrink-0" />
          <span className="text-xs font-semibold text-amber-700">
            No disponible para delivery
          </span>
        </div>
      )}

      {item.product.mayorista && (
        <div className="absolute top-2 right-2 bg-blue-50 border-b px-4 py-1.5 flex items-center gap-2 z-10 rounded-md border border-blue-300">
          <FaRegClock size={13} className="text-blue-600 shrink-0" />
          <span className="text-xs font-semibold text-blue-700">
            Producto para pedido mayorista
          </span>
        </div>
      )}

      {/* Retirar para pedido mayorista banner */}
      {isRetailInMixedCart && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 border-b border-red-200 px-4 py-1.5 flex items-center gap-2 z-10">
          <FaRegTrashAlt size={13} className="text-red-600 shrink-0" />
          <span className="text-xs font-semibold text-red-700">
            Debes retirar este producto para tu pedido mayorista
          </span>
        </div>
      )}

      {/* Overlay Loader */}
      {itemStockStatus === "loading" && (
        <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center rounded-sm backdrop-blur-[1px] transition-all duration-300">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
          <p className="text-secondary text-sm font-medium animate-pulse">
            Verificando stock...
          </p>
        </div>
      )}

      {itemStockStatus !== "neutral" && itemStockStatus !== "loading" && (
        <div className="w-[25px] flex justify-center shrink-0">
          {itemStockStatus === "outOfStock" && (
            <FaTimesCircle size={25} className="text-red-500 animate-pulse" />
          )}
          {itemStockStatus === "available" && (
            <FaCheckCircle size={25} className="text-primary" />
          )}
        </div>
      )}

      <div className={`w-full ${notAvailableForDelivery ? "mt-6" : ""}`}>
        {metodoEnvio === "retiro" &&
          tiendaSeleccionada &&
          infoTiendaSeleccionada && (
            <div className="w-full mb-5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-3">
                <Image
                  src="/images/liwilu_logo_dark.png"
                  alt="Liwilu"
                  width={70}
                  height={22}
                  priority
                />
                <span className="font-semibold">
                  {infoTiendaSeleccionada.desAlmacen}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-neutral-grayLighter text-sm">
                  <p className="pb-1 text-xs text-gray-500">
                    Ubigeo: {infoTiendaSeleccionada.codUbigeoAlm}
                  </p>
                  <div className="flex items-center gap-4">
                    {(() => {
                      // Check loading state first
                      if (isValidatingStock) return null; // Handled by overlay

                      // Verificar primero si tenemos resultados de validación
                      if (!stockValidationResult) return null;

                      const productInStore =
                        stockValidationResult.resultadosPorAlmacen
                          .find(
                            (w) =>
                              w.idAlmacen.toString() === tiendaSeleccionada,
                          )
                          ?.productos.find(
                            (p) => p.reference === item.product.reference,
                          );

                      // Si no encontramos info del producto en la tienda, estado neutro
                      if (!productInStore) return null;

                      const isAvailable = productInStore.disponible;

                      return isAvailable ? (
                        <span className="text-primary inline-flex gap-1 items-center">
                          <FaRegClock size={15} /> Disponible para recojo
                        </span>
                      ) : (
                        <span className="text-red-500 inline-flex gap-1 items-center font-semibold">
                          <FaTimesCircle size={15} /> No hay stock
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="font-semibold text-dark">GRATIS</div>
              </div>
            </div>
          )}

        <div className="flex flex-col-reverse md:flex-row gap-6">
          {/* Imagen */}
          <div className="relative w-32 h-32 shrink-0 bg-gray-50 rounded-sm overflow-hidden">
            <Image
              src={imageUrl}
              alt={getProductName(item.product)}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Contenido */}
          <div className="flex flex-1 items-start gap-6">
            {/* Info producto */}
            <div className="flex flex-col flex-1 min-w-0">
              <Link
                href={`/tienda/${item.product.linkRewrite || item.product.id || item.product.productId}${item.product.queryString ? `?${item.product.queryString}` : ""}`}
              >
                <h3 className="font-semibold text-md md:text-lg leading-tight mb-2 hover:text-primary transition">
                  {getProductName(item.product)}
                </h3>
              </Link>

              {/* Badge cupón aplicado */}
              {(() => {
                const { promoCodes, promoDiscount, totalSavings } = item.product as any;

                // Priority 1: Backend explicit promo properties
                if (promoCodes && promoCodes.length > 0) {
                  return (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {promoCodes.map((code: string, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          <FaTag size={10} />
                          {code}
                          {promoDiscount && promoDiscount > 0
                            ? ` | -S/${promoDiscount}`
                            : totalSavings && totalSavings > 0
                              ? ` | -S/${totalSavings}`
                              : ""}
                        </span>
                      ))}
                    </div>
                  );
                }

                // Priority 2: Fallback to matching appliedPromotions from context
                const productPrestashopId = item.product.productId;

                const matchingPromos = appliedPromotions.filter((promo) => {
                  if (
                    promo.eligibleProducts &&
                    promo.eligibleProducts.length > 0
                  ) {
                    // Check if it's COMBO_2 format (groups)
                    if ("groupIndex" in promo.eligibleProducts[0]) {
                      const groups = promo.eligibleProducts as any[];
                      return groups.some((g) =>
                        g.products.some(
                          (p: any) => p.prestashopId === productPrestashopId,
                        ),
                      );
                    }
                    // Regular format
                    return (promo.eligibleProducts as any[]).some(
                      (p) => p.prestashopId === productPrestashopId,
                    );
                  }

                  if (promo.steps && promo.steps.length > 0) {
                    return promo.steps.some(
                      (step: any) =>
                        step.eligibleProducts?.some(
                          (p: any) => p.prestashopId === productPrestashopId,
                        ) || step.product?.prestashopId === productPrestashopId,
                    );
                  }

                  // Fallback to older format
                  return (promo as any).eligibleProductIds?.includes(
                    productPrestashopId,
                  );
                });

                if (matchingPromos.length > 0) {
                  return (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {matchingPromos.map((p) => (
                        <span
                          key={p.prestashopId}
                          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          <FaTag size={7} />
                          {p.code} · -
                          {p.totalSavings > 0 ? `S/${p.totalSavings}` : "desc."}
                        </span>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Variation Attributes */}
              {item.product.variationAttributes &&
                item.product.variationAttributes.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-1 mb-3">
                    {[...item.product.variationAttributes]
                      .sort((a: any, b: any) => {
                        const aName = (a.name || "").toLowerCase();
                        const bName = (b.name || "").toLowerCase();
                        const aIsTipo = aName.includes("tipo");
                        const bIsTipo = bName.includes("tipo");
                        if (aIsTipo && !bIsTipo) return -1;
                        if (!aIsTipo && bIsTipo) return 1;
                        return 0;
                      })
                      .map((attr: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-sm border border-gray-100"
                        >
                          <span className="font-semibold text-gray-400 capitalize">
                            {attr.name}:
                          </span>
                          <div className="flex items-center gap-1.5">
                            {attr.colorHex && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm"
                                style={{ backgroundColor: attr.colorHex }}
                                title={attr.value}
                              />
                            )}
                            <span className="font-medium text-gray-700">
                              {attr.value}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

              {/* Error de Stock Inline */}
              {(() => {
                // Check if loading FIRST
                if (metodoEnvio === "delivery" && isValidatingSavar)
                  return null; // Handled by overlay

                if (
                  itemStockStatus === "neutral" ||
                  itemStockStatus === "loading"
                )
                  return null;

                if (metodoEnvio === "delivery") {
                  const savarResult = savarStockResults.find(
                    (r) => r.reference === item.product.reference,
                  );
                  if (savarResult && !savarResult.disponible) {
                    return (
                      <div className="flex items-center gap-1.5 text-red-600 font-semibold text-xs mb-2 animate-pulse">
                        <FaTimesCircle className="shrink-0" />
                        <span>No hay stock</span>
                      </div>
                    );
                  } else if (savarResult && savarResult.disponible) {
                    return (
                      <div className="flex items-center gap-1.5 text-primary font-semibold text-xs mb-2">
                        <FaCheckCircle className="shrink-0 font-semibold" />
                        <span>Stock disponible</span>
                      </div>
                    );
                  }
                }

                if (metodoEnvio === "retiro" && stockValidationResult) {
                  const selectedWh =
                    stockValidationResult.resultadosPorAlmacen.find(
                      (w) => w.idAlmacen.toString() === tiendaSeleccionada,
                    );
                  const productIssue = selectedWh?.productos.find(
                    (p) =>
                      p.reference === item.product.reference && !p.disponible,
                  );
                  if (productIssue) {
                    return (
                      <div className="flex items-center gap-1.5 text-red-600 font-medium text-xs mb-2">
                        <FaTimesCircle className="shrink-0" />
                        <span>{productIssue.mensaje}</span>
                      </div>
                    );
                  }
                }

                return null;
              })()}

              <button
                onClick={() => onRemove(item.product.id.toString())}
                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 mt-auto"
              >
                <FaRegTrashAlt size={18} />
                Eliminar
              </button>
            </div>

            {/* Precio + cantidad */}
            <div className="flex flex-col items-end justify-between shrink-0 gap-4">
              {/* Cantidad */}
              <div className="flex items-center border border-gray-300 rounded-xs">
                <button
                  onClick={() => {
                    const step = item.product.mayorista ? 3 : 1;
                    onUpdateQuantity(
                      item.product.id.toString(),
                      item.quantity - step,
                    );
                  }}
                  className="px-3 py-1 hover:bg-gray-100 transition"
                >
                  -
                </button>

                <span className="px-4 py-1 border-x">{item.quantity}</span>

                <button
                  onClick={() => {
                    const step = item.product.mayorista ? 3 : 1;
                    onUpdateQuantity(
                      item.product.id.toString(),
                      item.quantity + step,
                    );
                  }}
                  className="px-3 py-1 hover:bg-gray-100 transition"
                >
                  +
                </button>
              </div>

              {/* Precio */}
              <div className="text-right">
                {hasDiscountPrice && regularPrice > effectivePrice && (
                  <p className="text-sm text-gray-400 line-through">
                    {formatPrice(regularPrice.toString())}
                  </p>
                )}

                <p className="text-2xl font-semibold text-primary-dark">
                  {formatPrice(precioTotal.toString())}
                </p>

                <p className="text-xs text-gray-500">
                  {formatPrice(precioUnitario.toString())} c/u
                </p>

                {item.product.mayorista && (item.product as any).specificPrices?.length > 0 && (() => {
                  const prices = (item.product as any).specificPrices;
                  const maxPriceObj = prices.reduce((prev: any, current: any) =>
                    prev.from_quantity > current.from_quantity ? prev : current
                  );
                  return (
                    <div className="mt-1.5 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-sm px-3 py-2 text-[11px]">
                      <span>
                        <strong>Precio de Unidad:</strong> {formatPrice(precioUnitario.toString())} — Comprando <strong>{item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'}</strong> el precio mayorista es <strong>{formatPrice(maxPriceObj.price)}</strong> por unidad
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
