import Image from "next/image";
import Link from "next/link";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaRegClock,
  FaRegTrashAlt,
} from "react-icons/fa";
import {
  formatPrice,
  getProductName,
  getProductImageUrl,
  getEffectivePrice,
  getRegularPrice,
  hasDiscount,
} from "@/lib/utils";
import { CartItem as CartItemType } from "@/context/CartContext";
import {
  SavarStockValidationResult,
  StockValidationResponse,
  WarehouseMapItem,
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
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
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
  onRemove,
  onUpdateQuantity,
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

  // Determine the stock status for the item: available, outOfStock, or neutral
  const itemStockStatus = (() => {
    // Show neutral while validating to avoid flickering (handled by loader UI)
    if (metodoEnvio === "delivery" && isValidatingSavar) return "loading";
    if (metodoEnvio === "retiro" && isValidatingStock) return "loading";

    if (metodoEnvio === "delivery") {
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

  return (
    <div
      className={`bg-white rounded-sm shadow-md p-6 flex gap-4 animate-fade-in-up relative overflow-hidden transition-all ${itemStockStatus === "available"
          ? "border-2 border-primary"
          : "border-2 border-transparent"
        }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
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

      <div className="w-full">
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
                      <div className="flex items-center gap-1.5 text-red-600 font-medium text-xs mb-2 hidden">
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
              <div className="flex items-center border border-gray-300 rounded-sm">
                <button
                  onClick={() =>
                    onUpdateQuantity(
                      item.product.id.toString(),
                      item.quantity - 1,
                    )
                  }
                  className="px-3 py-1 hover:bg-gray-100 transition"
                >
                  -
                </button>

                <span className="px-4 py-1 border-x">{item.quantity}</span>

                <button
                  onClick={() =>
                    onUpdateQuantity(
                      item.product.id.toString(),
                      item.quantity + 1,
                    )
                  }
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
