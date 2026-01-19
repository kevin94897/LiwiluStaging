import { GetServerSideProps } from "next";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";
import Aptitudes from "@/components/Aptitudes";
import BannerPublicidad from "@/components/BannerPublicidad";
import { FaPlus, FaMinus } from "react-icons/fa";
import ProductosRelacionados from "@/components/ProductosRelacionados";
import { useCart } from "@/context/CartContext";
import AddToCartModal from "@/components/AddToCartModal";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/lib/notifications";

import {
  getProductBasic,
  getProductVariations,
  getRelatedProducts,
  ProductBasicData,
  ProductVariationsData,
  ProductVariation,
  Product,
  toggleFavorite,
  checkMultipleFavorites,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface ProductDetailProps {
  productId: string;
  basicData: ProductBasicData | null;
  variationsData: ProductVariationsData | null;
  error?: string;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  try {
    const [basicData, variationsData] = await Promise.all([
      getProductBasic(id),
      getProductVariations(id),
    ]);

    if (!basicData || !variationsData) {
      return {
        props: {
          productId: id,
          basicData: null,
          variationsData: null,
          error: "Producto no encontrado",
        },
      };
    }

    return {
      props: {
        productId: id,
        basicData,
        variationsData,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return {
      props: {
        productId: id || "",
        basicData: null,
        variationsData: null,
        error: message,
      },
    };
  }
};

// ✅ Función helper para validar imágenes
// Updated to handle both string URLs and ProductImage objects if needed (though we expect objects mostly now)
const isValidImageUrl = (
  urlOrObj: string | any | null | undefined,
): boolean => {
  if (!urlOrObj) return false;
  const url = typeof urlOrObj === "string" ? urlOrObj : urlOrObj?.url;
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("http")) return false;
  if (url.includes("Array.jpg")) return false;
  if (url.includes("undefined")) return false;
  return true;
};

// Helper to extract URL string
const getImageUrl = (urlOrObj: string | any | null | undefined): string => {
  if (!urlOrObj) return "/images/placeholder-product.jpg";
  return typeof urlOrObj === "string"
    ? urlOrObj
    : urlOrObj?.url || "/images/placeholder-product.jpg";
};

export default function ProductDetail({
  productId,
  basicData,
  variationsData,
  error,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, number>
  >({});
  const [currentVariation, setCurrentVariation] =
    useState<ProductVariation | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [thumbnailScrollPosition, setThumbnailScrollPosition] = useState(0);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  type TabKey =
    | "Descripción del producto"
    | "Especificaciones"
    | "Guía de tallas";
  const [activeTab, setActiveTab] = useState<TabKey>(
    "Descripción del producto",
  );

  // ✅ Inicializar variación por defecto
  useEffect(() => {
    if (variationsData?.variations && variationsData.variations.length > 0) {
      const defaultVar =
        variationsData.variations.find((v) => v.isDefault) ||
        variationsData.variations[0];

      if (defaultVar) {
        const initialAttrs: Record<string, number> = {};
        // Updated: variations attributes are now an array of objects {id, type, name, value...}
        if (defaultVar.attributes && Array.isArray(defaultVar.attributes)) {
          defaultVar.attributes.forEach((attr) => {
            initialAttrs[attr.type] = attr.id;
          });
        }

        setSelectedAttributes(initialAttrs);
        setCurrentVariation(defaultVar);
      }
    }
  }, [variationsData]);

  // ✅ Verificar si es favorito al cargar
  useEffect(() => {
    const checkFavorite = async () => {
      if (!productId) return;
      try {
        const result = await checkMultipleFavorites([parseInt(productId)]);
        setIsFavorite(result[productId] || false);
      } catch (error: any) {
        // Si no hay sesión, simplemente no es favorito
        if (error.message === "No hay sesión activa") {
          setIsFavorite(false);
          return;
        }
        console.error("Error checking favorite:", error);
      }
    };
    checkFavorite();
  }, [productId]);

  // ✅ Obtener galería de la variación actual o galería general
  const currentGallery = useMemo(() => {
    const images: string[] = [];

    // Si hay una variación seleccionada, usar sus imágenes
    if (currentVariation?.images && currentVariation.images.length > 0) {
      // New structure: images is ProductImage[]
      const validVariationImages = currentVariation.images
        .map((img) => img.url)
        .filter((url) => isValidImageUrl(url));

      if (validVariationImages.length > 0) {
        return validVariationImages;
      }
    }

    // Si no hay variación o no tiene imágenes válidas, usar galería general
    // 1. Agregar coverImage si es válida
    // New structure: variationsData.media.coverImage
    if (
      variationsData?.media?.coverImage &&
      isValidImageUrl(variationsData.media.coverImage.url)
    ) {
      images.push(variationsData.media.coverImage.url);
    }

    // 2. Agregar gallery si existe
    // New structure: variationsData.media.gallery
    if (
      variationsData?.media?.gallery &&
      Array.isArray(variationsData.media.gallery)
    ) {
      const validGallery = variationsData.media.gallery
        .map((img) => img.url)
        .filter((url) => isValidImageUrl(url));
      images.push(...validGallery);
    }

    // 3. Fallback: Check variations if main gallery empty (optional, depending on logic)
    // Kept similar to before but adapted
    if (images.length === 0 && variationsData?.variations) {
      for (const variation of variationsData.variations) {
        if (variation.images && variation.images.length > 0) {
          const validImages = variation.images
            .map((img) => img.url)
            .filter((url) => isValidImageUrl(url));

          if (validImages.length > 0) {
            images.push(...validImages);
            break; // Usar solo las imágenes de la primera variación válida
          }
        }
      }
    }

    // 4. Si aún no hay imágenes, usar placeholder
    if (images.length === 0) {
      images.push("/images/placeholder-product.jpg");
    }

    // Eliminar duplicados
    return Array.from(new Set(images));
  }, [currentVariation, variationsData]);

  // ✅ Obtener precio actual
  const getCurrentPrice = useMemo(() => {
    if (!variationsData) return { price: 0, priceWithTax: 0 };

    if (currentVariation) {
      // New structure: currentVariation.price is an object { amount, amountWithTax... }
      return {
        price: currentVariation.price.amount,
        priceWithTax: currentVariation.price.amountWithTax,
      };
    }

    // New structure: variationsData.base.price
    return {
      price: variationsData.base?.price?.amount || 0,
      priceWithTax: variationsData.base?.price?.amountWithTax || 0,
    };
  }, [currentVariation, variationsData]);

  // ✅ Obtener cantidad disponible
  const getAvailableQuantity = useMemo(() => {
    if (currentVariation) {
      return currentVariation.stock?.quantity || 0;
    }
    return variationsData?.base?.stock?.quantity || 0;
  }, [currentVariation, variationsData]);

  // ✅ Resetear índice de imagen cuando cambia la variación
  useEffect(() => {
    setSelectedImageIndex(0);
    setThumbnailScrollPosition(0);
  }, [currentVariation]);

  // ✅ Handlers para navegación de thumbnails
  const THUMBNAILS_VISIBLE = 4;
  const maxScroll = Math.max(0, currentGallery.length - THUMBNAILS_VISIBLE);

  const handleScrollUp = () => {
    setThumbnailScrollPosition((prev) => Math.max(0, prev - 1));
  };

  const handleScrollDown = () => {
    setThumbnailScrollPosition((prev) => Math.min(maxScroll, prev + 1));
  };

  // ✅ Obtener primera imagen válida de una variación
  const getVariationPreviewImage = (variation: ProductVariation): string => {
    if (variation.images && variation.images.length > 0) {
      const validImage = variation.images.find(isValidImageUrl);
      if (validImage) return getImageUrl(validImage);
    }
    // Updated to check variationsData.media.coverImage
    if (
      variationsData?.media?.coverImage &&
      isValidImageUrl(variationsData.media.coverImage)
    ) {
      return getImageUrl(variationsData.media.coverImage);
    }
    return "/images/placeholder-product.jpg";
  };

  if (error || !basicData || !variationsData) {
    return (
      <Layout title="Error - Liwilu" description="Producto no encontrado">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
            <strong>Error:</strong> {error || "Producto no encontrado"}
          </div>
          <Link
            href="/productos"
            className="text-primary hover:underline mt-4 inline-block"
          >
            Volver a la tienda
          </Link>
        </div>
      </Layout>
    );
  }

  const handleIncrease = () => {
    if (quantity < getAvailableQuantity) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrease = () => setQuantity((q) => Math.max(1, q - 1));

  const handleAddToCart = async () => {
    const priceInfo = getCurrentPrice;

    // Construct the product name with attributes if a variation is selected
    let productName = basicData.name;
    if (currentVariation) {
      if (
        currentVariation.attributes &&
        currentVariation.attributes.length > 0
      ) {
        const attributesString = currentVariation.attributes
          .map((attr) => `${attr.name}: ${attr.value}`)
          .join(", ");
        productName += ` (${attributesString})`;
      } else if (currentVariation.name) {
        // Fallback to variation name if no specific attributes are structured
        productName += ` (${currentVariation.name})`;
      }
    }

    // Create a unique ID for cart items
    // IMPORTANT: Use productId (from URL) as base to match IDs from catalog/other components
    let cartItemId: string | number = productId;

    // Only add variation suffix if there's actually a variation selected
    if (
      currentVariation &&
      currentVariation.attributes &&
      currentVariation.attributes.length > 0
    ) {
      // Append variation attributes to create unique ID for this specific variation
      const variantKey = currentVariation.attributes
        .map((attr) => `${attr.type}-${attr.id}`)
        .sort()
        .join("_");
      cartItemId = `${productId}_${variantKey}`;
    }

    // Create a product object with tax-inclusive price and simulated original price for savings calculation
    const finalProduct: Product = {
      id: cartItemId, // ✅ Use productId for base, or productId_variant for variations
      productId: productId, // ✅ Use URL productId for correct cart links
      prestashopCombinationId: currentVariation
        ? currentVariation.prestashopCombinationId
        : null,
      name: productName,
      price: priceInfo.priceWithTax, // Use price with tax as the selling price
      originalPrice: priceInfo.priceWithTax * 1.5, // Emulate the mockup logic from the UI
      quantity: getAvailableQuantity,
      reference: currentVariation ? currentVariation.reference : basicData.sku,
      coverImage:
        currentVariation?.images?.[0]?.url ||
        variationsData.media?.coverImage?.url ||
        "/images/placeholder-product.jpg",
      associations: {
        ...(basicData.defaultCategory
          ? { categories: [{ id: basicData.defaultCategory.name }] }
          : {}),
      },
    };

    // Add to cart (works for both authenticated and guest users)
    await addToCart(finalProduct, quantity);
    setModalProduct(finalProduct);
  };

  const openLoginModal = () => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, login: "true" },
      },
      undefined,
      { shallow: true },
    );
  };

  const handleToggleFavorite = async () => {
    // Validar autenticación preliminar usando estado local
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (!productId) return;
    setLoadingFavorite(true);

    try {
      const response = await toggleFavorite(parseInt(productId));
      setIsFavorite(response.isFavorite);
    } catch (error: any) {
      // Si falla por sesión expirada o inexistente (y el estado local decía que sí),
      // forzamos el modal de login
      if (
        error.message === "No hay sesión activa" ||
        error.message === "Sesión expirada"
      ) {
        openLoginModal();
      } else {
        console.error("Error toggling favorite:", error);
        showToast("Ocurrió un error al actualizar favoritos", "error");
      }
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleAttributeChange = (type: string, valueId: number) => {
    const newAttrs = { ...selectedAttributes, [type]: valueId };
    setSelectedAttributes(newAttrs);

    // Buscar variación que coincida EXACTAMENTE
    const foundVariation = variationsData.variations.find((v) => {
      // Debe tener exactamente los mismos atributos
      if (v.attributes.length !== Object.keys(newAttrs).length) {
        return false;
      }

      return v.attributes.every((attr) => newAttrs[attr.type] === attr.id);
    });

    if (foundVariation) {
      setCurrentVariation(foundVariation);
    } else {
      // Opción A: Mantener variación anterior (comportamiento actual)
      // No hacer nada

      // Opción B: Buscar variación PARCIAL (más flexible)
      const partialVariation = variationsData.variations.find((v) =>
        v.attributes.every((attr) => {
          // Si el atributo está en newAttrs, debe coincidir
          if (newAttrs[attr.type] !== undefined) {
            return newAttrs[attr.type] === attr.id;
          }
          return true; // Si no está, lo ignoramos
        }),
      );

      if (partialVariation) {
        setCurrentVariation(partialVariation);
      } else {
        // Opción C: Limpiar variación si no hay match
        setCurrentVariation(null);
      }
    }

    console.log("🔄 Attribute Changed:", type, valueId);
    console.log("📝 New Selection:", newAttrs);
    console.log("🎯 Found Variation:", foundVariation);
  };

  // ✅ Validar disponibilidad de atributos (si tiene precio > 0)
  const checkAttributeAvailability = (
    attributeType: string,
    attributeValueId: number,
  ) => {
    if (!variationsData?.variations) return true;

    const proposedSelection = {
      ...selectedAttributes,
      [attributeType]: attributeValueId,
    };

    return variationsData.variations.some((v) => {
      // ✅ FIXED: Check if variation is COMPATIBLE with proposed selection
      // A variation is compatible if all of its attributes match the proposed selection
      // (but the variation doesn't need to have all proposed attributes)
      const isCompatible = v.attributes.every((attr) => {
        const proposedValue = proposedSelection[attr.type];
        // If we have a value for this attribute type, it must match
        return proposedValue === undefined || proposedValue === attr.id;
      });

      if (!isCompatible) return false;

      // ✅ VALIDAR TANTO STOCK COMO PRECIO
      const hasStock = v.stock?.inStock && v.stock?.quantity > 0;
      const hasValidPrice =
        (v.price?.amount && v.price.amount > 0) ||
        (v.price?.amountWithTax && v.price.amountWithTax > 0);

      return hasStock && hasValidPrice;
    });
  };

  const tabs = {
    "Descripción del producto": (
      <div className="space-y-6">
        {basicData.resume && (
          <div
            className="prose prose-sm max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: basicData.resume }}
          />
        )}
        {basicData.description && (
          <div
            className="prose prose-sm max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: basicData.description }}
          />
        )}
      </div>
    ),
    Especificaciones: (
      <div className="overflow-x-auto">
        {basicData.features && basicData.features.length > 0 ? (
          <table className="min-w-full border border-gray-200 rounded-md">
            <tbody className="divide-y divide-gray-200">
              {basicData.features.map((feature, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 font-medium text-gray-700 w-1/3 bg-gray-50">
                    {feature.name}:
                  </td>
                  <td className="px-4 py-2 text-gray-600">{feature.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No hay especificaciones disponibles.</p>
        )}
      </div>
    ),
    "Guía de tallas": (
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Guía de Tallas (cm)
        </h3>
        <table className="min-w-full border border-gray-200 rounded-md text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Talla
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Pecho
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Cintura
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Largo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            <tr>
              <td className="px-4 py-2 font-medium">S</td>
              <td className="px-4 py-2">90 - 94</td>
              <td className="px-4 py-2">74 - 78</td>
              <td className="px-4 py-2">64</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">M</td>
              <td className="px-4 py-2">95 - 99</td>
              <td className="px-4 py-2">79 - 83</td>
              <td className="px-4 py-2">66</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">L</td>
              <td className="px-4 py-2">100 - 106</td>
              <td className="px-4 py-2">84 - 90</td>
              <td className="px-4 py-2">68</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">XL</td>
              <td className="px-4 py-2">107 - 113</td>
              <td className="px-4 py-2">91 - 97</td>
              <td className="px-4 py-2">70</td>
            </tr>
          </tbody>
        </table>
        <p className="text-gray-500 text-xs mt-3">
          📏 Las medidas pueden variar ±2 cm según el modelo y el tejido.
        </p>
      </div>
    ),
  };

  return (
    <Layout
      title={`${basicData.name} - Liwilu`}
      description={basicData.metaDescription || "Detalle del producto"}
    >
      {/* Vectores decorativos */}
      <div className="absolute md:right-[-15vw] md:top-80 w-auto md:w-auto z-0 pointer-events-none md:block hidden">
        <Image
          src="/images/vectores/liwilu_banner_productos_vector_04.png"
          alt="Vector background"
          width={408}
          height={427}
          quality={100}
          className="h-auto"
          priority
        />
      </div>
      <div className="absolute -left-56 md:-left-40 bottom-10 md:bottom-1/3 w-auto md:w-auto z-0 pointer-events-none">
        <Image
          src="/images/vectores/liwilu_banner_productos_vector_05.png"
          alt="Vector background"
          width={408}
          height={427}
          quality={100}
          className="h-auto"
          priority
        />
      </div>
      {/* Breadcrumb */}
      <div className="mt-14">
        <div className="max-w-7xl mx-auto px-6 xl:px-0 py-4">
          <div className="text-neutral-gray text-md font-semibold">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <Link href="/productos" className="hover:underline">
              Tienda virtual
            </Link>
            {basicData.defaultCategory && (
              <>
                <span className="mx-2">/</span>
                <Link
                  href={`/productos?category=${basicData.defaultCategory.linkRewrite}`}
                  className="hover:underline"
                >
                  {basicData.defaultCategory.name}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-primary-dark font-medium">
              {basicData.name}
            </span>
          </div>
        </div>
      </div>
      {/* Contenido principal */}
      <div className="px-6 py-2 md:py-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Columna izquierda - Imágenes */}
            <div className="w-full lg:w-2/3 flex flex-col lg:flex-row gap-6">
              {/* Columna de miniaturas - Slider vertical */}
              {currentGallery.length > 1 && (
                <div className="order-2 lg:order-1 w-full lg:w-24">
                  <div className="flex lg:flex-col gap-4 lg:gap-0">
                    {/* Botón scroll arriba (desktop) */}
                    {currentGallery.length > THUMBNAILS_VISIBLE &&
                      thumbnailScrollPosition > 0 && (
                        <button
                          onClick={handleScrollUp}
                          className="hidden lg:flex items-center justify-center w-full h-10 bg-gray-100 hover:bg-gray-200 rounded-md mb-2 transition"
                          aria-label="Scroll up thumbnails"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>
                      )}

                    {/* Grid de miniaturas */}
                    <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible scrollbar-hide w-full">
                      {currentGallery
                        .slice(
                          thumbnailScrollPosition,
                          thumbnailScrollPosition + THUMBNAILS_VISIBLE,
                        )
                        .map((img, idx) => {
                          const actualIndex = idx + thumbnailScrollPosition;
                          const isSelected = selectedImageIndex === actualIndex;

                          return (
                            <div
                              key={actualIndex}
                              onClick={() => setSelectedImageIndex(actualIndex)}
                              className={`relative aspect-square bg-white rounded-md shadow-md overflow-hidden cursor-pointer transition-all flex-shrink-0 w-20 lg:w-full
																${
                                  isSelected
                                    ? "ring-2 ring-primary scale-105"
                                    : "hover:shadow-lg hover:scale-105"
                                }
															`}
                            >
                              <Image
                                src={img}
                                alt={`${basicData.name} - miniatura ${
                                  actualIndex + 1
                                }`}
                                fill
                                className="object-contain p-2"
                                unoptimized
                              />
                            </div>
                          );
                        })}
                    </div>

                    {/* Botón scroll abajo (desktop) */}
                    {currentGallery.length > THUMBNAILS_VISIBLE &&
                      thumbnailScrollPosition < maxScroll && (
                        <button
                          onClick={handleScrollDown}
                          className="hidden lg:flex items-center justify-center w-full h-10 bg-gray-100 hover:bg-gray-200 rounded-md mt-2 transition"
                          aria-label="Scroll down thumbnails"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      )}

                    {/* Contador de imágenes */}
                    {currentGallery.length > THUMBNAILS_VISIBLE && (
                      <div className="hidden lg:flex items-center justify-center mt-2 text-xs text-gray-500">
                        {thumbnailScrollPosition + 1}-
                        {Math.min(
                          thumbnailScrollPosition + THUMBNAILS_VISIBLE,
                          currentGallery.length,
                        )}{" "}
                        de {currentGallery.length}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Imagen principal */}
              <div className="flex-1 order-1 lg:order-2">
                <div className="relative aspect-square bg-white rounded-sm shadow-md overflow-hidden">
                  <Image
                    src={
                      currentGallery[selectedImageIndex] || currentGallery[0]
                    }
                    alt={basicData.name}
                    fill
                    className="object-contain p-4"
                    priority
                    unoptimized
                  />

                  {/* Navegación de flechas en la imagen principal */}
                  {currentGallery.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImageIndex((prev) => Math.max(0, prev - 1))
                        }
                        disabled={selectedImageIndex === 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition lg:hidden"
                        aria-label="Imagen anterior"
                      >
                        <svg
                          className="w-6 h-6 text-gray-800"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            Math.min(currentGallery.length - 1, prev + 1),
                          )
                        }
                        disabled={
                          selectedImageIndex === currentGallery.length - 1
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition lg:hidden"
                        aria-label="Siguiente imagen"
                      >
                        <svg
                          className="w-6 h-6 text-gray-800"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Indicador de posición */}
                  {currentGallery.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {currentGallery.length}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columna derecha - Información */}
            <div className="w-full lg:w-1/3">
              <div className="md:p-6">
                {/* Badge condición */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-[#D3D3D3] text-greendark-500 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {basicData.condition === "new"
                      ? "Nuevo"
                      : basicData.condition === "used"
                        ? "Usado"
                        : basicData.condition === "refurbished"
                          ? "Reacondicionado"
                          : basicData.condition}
                  </span>
                </div>

                {/* Título */}
                <h1 className="text-2xl md:text-4xl font-semibold mb-2 text-primary-dark">
                  {basicData.name}
                </h1>

                {/* Rating y SKU */}
                <div className="flex items-center gap-5 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                    <span className="text-sm text-gray-600">(4.8/5)</span>
                  </div>
                  <span className="text-gray-600 text-sm">
                    SKU: {basicData.sku}
                  </span>
                </div>

                {/* Precio */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-semibold text-primary-dark">
                    {formatPrice(getCurrentPrice.priceWithTax)}
                  </span>
                  <span className="text-lg text-[#D3D3D3] line-through font-bold">
                    {formatPrice(getCurrentPrice.priceWithTax * 1.5)}
                  </span>
                </div>

                {/* Opciones de personalización */}
                {variationsData.attributes &&
                variationsData.attributes.length > 0 ? (
                  <div className="flex flex-col gap-6 mb-6">
                    {variationsData.attributes.map((attr) => (
                      <div key={attr.type}>
                        <label className="block text-dark font-medium mb-3">
                          {attr.name || attr.type}:
                          {currentVariation && (
                            <span className="ml-2 text-primary-dark font-normal">
                              {
                                currentVariation.attributes.find(
                                  (a) => a.type === attr.type,
                                )?.value
                              }
                            </span>
                          )}
                        </label>
                        <div className="flex flex-wrap items-center gap-1 md:gap-3">
                          {attr.values?.map((val) => {
                            // Validar si esta opción debe mostrarse
                            const isAvailable =
                              attr.type === "color" ||
                              checkAttributeAvailability(attr.type, val.id);

                            if (!isAvailable) return null;

                            const isSelected =
                              selectedAttributes[attr.type] === val.id;

                            // Encontrar la variación que tendría este valor para el preview
                            const previewVariation =
                              variationsData.variations.find((v) =>
                                v.attributes?.some(
                                  (a) =>
                                    a.type === attr.type && a.id === val.id,
                                ),
                              );

                            return (
                              <div key={val.id} className="relative group">
                                <button
                                  title={val.value}
                                  onClick={() =>
                                    handleAttributeChange(attr.type, val.id)
                                  }
                                  className={
                                    attr.type === "color"
                                      ? `w-10 h-10 rounded-full border-2 transition relative ${
                                          isSelected
                                            ? "border-primary border-4 scale-110"
                                            : "border-gray-300 hover:scale-105"
                                        }`
                                      : `px-5 py-2 border rounded-md font-medium transition ${
                                          isSelected
                                            ? "bg-primary-dark text-white border-gray-900"
                                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                                        }`
                                  }
                                  style={
                                    attr.type === "color" && val.colorHex
                                      ? { backgroundColor: val.colorHex }
                                      : {}
                                  }
                                >
                                  {attr.type !== "color" && val.value}
                                </button>

                                {/* Preview de imagen al hacer hover (solo para colores) */}
                                {attr.type === "color" &&
                                  previewVariation &&
                                  !isSelected && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                      <div className="bg-white rounded-md shadow-xl border-2 border-gray-200 p-2">
                                        <div className="relative w-24 h-24">
                                          <Image
                                            src={
                                              previewVariation.images?.[0]
                                                ?.url ||
                                              variationsData.media?.coverImage
                                                ?.url ||
                                              "/images/placeholder-product.jpg"
                                            }
                                            alt={val.value}
                                            fill
                                            className="object-contain rounded"
                                            unoptimized
                                          />
                                        </div>
                                        <p className="text-[10px] text-center mt-1 text-gray-600 font-bold uppercase truncate max-w-[90px]">
                                          {val.value}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Fallback logic for flat variations (no attribute groups) */
                  variationsData.variations &&
                  variationsData.variations.length > 1 && (
                    <div className="flex flex-col gap-4 mb-6">
                      <label className="block text-gray-700 font-medium">
                        Opciones disponibles:
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {variationsData.variations.map((v) => {
                          const isSelected = currentVariation?.id === v.id;
                          return (
                            <button
                              key={v.id}
                              onClick={() => setCurrentVariation(v)}
                              className={`px-4 py-2 border rounded-md font-medium transition ${
                                isSelected
                                  ? "bg-primary-dark text-white border-gray-900"
                                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {v.name ||
                                v.reference ||
                                `Opción ${v.prestashopCombinationId}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}

                {/* Cantidad */}
                <div className="mb-6">
                  <label className="text-gray-700 font-medium pb-2 block">
                    Cantidad:
                  </label>
                  <div className="flex items-center border border-primary rounded-sm overflow-hidden w-fit">
                    <button
                      className="px-2 py-2 hover:bg-gray-100 transition text-lg disabled:opacity-50"
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                    >
                      <FaMinus className="w-3 h-3 text-primary transition" />
                    </button>
                    <span className="px-4 py-2 font-bold">{quantity}</span>
                    <button
                      className="px-2 py-2 hover:bg-gray-100 transition disabled:opacity-50"
                      onClick={handleIncrease}
                      disabled={quantity >= getAvailableQuantity}
                    >
                      <FaPlus className="w-3 h-3 text-primary transition" />
                    </button>
                  </div>
                  {/* <span className="text-sm text-gray-500 mt-2 block">
                    {getAvailableQuantity > 0
                      ? `${getAvailableQuantity} disponibles`
                      : "Sin stock"}
                  </span> */}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 md:gap-4">
                  <Button
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={getAvailableQuantity === 0}
                    onClick={handleAddToCart}
                  >
                    {getAvailableQuantity > 0
                      ? "Agregar al carrito"
                      : "Sin stock"}
                  </Button>
                  <button
                    onClick={handleToggleFavorite}
                    disabled={loadingFavorite}
                    className={`bg-white hover:bg-gray-50 border-2 border-primary font-semibold md:w-[56px] md:h-[56px] w-[46px] h-[46px] rounded-full transition flex items-center justify-center ${
                      isFavorite ? "text-primary" : "text-primary"
                    }`}
                  >
                    {loadingFavorite ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill={isFavorite ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Pestañas de información */}
      <div className="max-w-7xl mx-auto px-6 py-4 liwilu-tabs z-10 relative">
        <div className="flex border-b border-gray-200 overflow-x-auto overflow-y-hidden">
          {Object.keys(tabs).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabKey)}
              className={`px-5 py-2 -mb-[1px] font-medium border-b-2 transition-all h-15 min-w-[180px] whitespace-nowrap ${
                activeTab === tab
                  ? "border-gray-900 text-primary-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="mt-4">{tabs[activeTab]}</div>
      </div>
      {/* Productos relacionados */}
      <ProductosRelacionados productId={productId} />
      {/* Banner publicitario */}
      <BannerPublicidad />
      {/* Aptitudes */}
      <Aptitudes />
      {/* Modal de carrito */}
      {modalProduct && (
        <AddToCartModal
          isOpen={!!modalProduct}
          onClose={() => setModalProduct(null)}
          product={modalProduct}
        />
      )}
    </Layout>
  );
}
