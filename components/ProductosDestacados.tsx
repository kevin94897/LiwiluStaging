"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useState, useEffect } from "react";
import logger from '@/lib/logger';
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import AddToCartModal from "@/components/AddToCartModal";

import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { Product } from "@/lib/catalog";
import {
  getProductImageUrl,
  formatPrice,
  getProductName,
  getRegularPrice,
  getSalePrice,
  hasDiscount,
  getEffectivePrice,
} from "@/lib/utils";
import { toggleFavorite, getFavorites } from "@/lib/catalog";
import { isAuthenticated } from "@/lib/auth/authUtils";
import Button from "./ui/Button";
import { useRouter } from "next/router";
import { showToast } from "@/lib/notifications";

interface ProductProps {
  featuredProducts: Product[];
  error?: string;
}

export default function ProductosDestacados({
  featuredProducts,
  error,
}: ProductProps) {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [loadingCart, setLoadingCart] = useState<string | null>(null);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const router = useRouter();

  const activeProducts = featuredProducts.filter((p) => (p.quantity ?? 0) > 0);

  // Configuración del carousel mejorada
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: false,
      containScroll: "trimSnaps",
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })],
  );

  const toggleFavorito = async (
    e: React.MouseEvent<HTMLButtonElement>,
    productId: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setTogglingFavorite(productId);

      const result = await toggleFavorite(parseInt(productId));

      if (result.isFavorite) {
        setFavoritos((prev) => [...prev, productId]);
        showToast("Producto agregado a favoritos", "success");
      } else {
        setFavoritos((prev) => prev.filter((id) => id !== productId));
        showToast("Producto eliminado de favoritos", "success");
      }
    } catch (error) {
      logger.error("Error toggling favorite:", error);

      if (
        error instanceof Error &&
        error.message.includes("No hay sesión activa")
      ) {
        showToast("Debes iniciar sesión para agregar favoritos", "error");
        router.push(
          {
            pathname: router.pathname,
            query: { ...router.query, login: "true" },
          },
          undefined,
          { shallow: true },
        );
      } else {
        showToast(
          "Error al actualizar favoritos. Por favor, intenta de nuevo.",
          "error",
        );
      }
    } finally {
      setTogglingFavorite(null);
    }
  };

  useEffect(() => {
    async function loadFavorites() {
      if (!isAuthenticated()) return;

      try {
        const response = await getFavorites();
        if (response.success) {
          const favoriteIds = response.data.map((fav) => fav.id.toString());
          setFavoritos(favoriteIds);
        }
      } catch (error) {
        logger.log("Could not load favorites:", error);
      }
    }

    loadFavorites();
  }, []);

  const handleAddToCart = async (
    e: React.MouseEvent<HTMLButtonElement>,
    producto: Product,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoadingCart(producto.id.toString());

      // Check if product has default variation
      let combinationId = producto.prestashopCombinationId ?? null;
      if (producto.hasVariations && producto.defaultVariation) {
        combinationId = producto.defaultVariation.prestashopCombinationId;
      }

      const cartProduct = {
        ...producto,
        prestashopCombinationId: combinationId,
      };
      addToCart(cartProduct, 1);
      setModalProduct(producto);
    } catch (error) {
      logger.error("Error al agregar al carrito:", error);
      showToast("Error al agregar el producto al carrito", "error");
    } finally {
      setLoadingCart(null);
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const imageUrl =
      product.coverImage ||
      (product.associations?.images?.[0]?.id
        ? getProductImageUrl(
          product.id.toString(),
          product.associations.images[0].id,
        )
        : "/images/productos/placeholder_liwilu.png");

    return (
      <Link href={`/tienda/${product.linkRewrite || product.id}`}>
        <div className="bg-white rounded-md shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
          <div className="relative">
            <span className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
              OFERTA
            </span>
            <div className="relative w-full h-48">
              <Image
                src={imageUrl}
                alt={getProductName(product)}
                fill
                sizes="(max-width: 640px) 200px, (max-width: 1024px) 300px, 400px"
                className="object-cover"
                quality={75}
              />
            </div>
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 z-10 transition-transform hover:scale-110 disabled:opacity-50"
              onClick={(e) => toggleFavorito(e, product.id.toString())}
              disabled={togglingFavorite === product.id.toString()}
            >
              {togglingFavorite === product.id.toString() ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
              ) : (
                <FaHeart
                  className={`w-5 h-5 transition ${favoritos.includes(product.id.toString())
                      ? "text-red-500 fill-current"
                      : "text-gray-400 hover:text-red-500"
                    }`}
                />
              )}
            </button>
          </div>

          <div className="p-4 flex flex-col justify-between h-44 bg-primary">
            <h3 className="font-semibold leading-tight text-lg mb-2 line-clamp-2 h-12 text-white">
              {getProductName(product)}
            </h3>
            <div className="flex justify-between items-center mb-2">
              {hasDiscount(product) && (
                <span className="text-white text-sm line-through">
                  {formatPrice(getRegularPrice(product))}
                </span>
              )}
              <span className="text-white font-semibold text-lg">
                {formatPrice(getEffectivePrice(product))}
              </span>
            </div>
            <Button
              size="sm"
              className="w-full"
              variant="secondary"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleAddToCart(e, product)
              }
              disabled={loadingCart === product.id.toString()}
            >
              {loadingCart === product.id.toString() ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <FaShoppingCart className="w-4 h-4" />
                  <span>Agregar al carrito</span>
                </span>
              )}
            </Button>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-6 sm:mb-8 md:mb-12 text-primary-dark">
        Productos destacados
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {featuredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-xl">
          <p className="text-xl text-gray-600 mb-4">
            No se pudieron cargar los productos de PrestaShop
          </p>
        </div>
      ) : (
        <>
          {activeProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-100 rounded-xl">
              <p className="text-xl text-gray-600 mb-4">
                No hay productos disponibles con stock actualmente.
              </p>
            </div>
          ) : (
            /* Carousel para todos los dispositivos */
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex touch-pan-y touch-pinch-zoom -ml-3 sm:-ml-4 lg:-ml-6">
                {activeProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex-[0_0_85%] min-w-0 pl-3 sm:flex-[0_0_50%] sm:pl-4 lg:flex-[0_0_25%] lg:pl-6"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {modalProduct && (
        <AddToCartModal
          isOpen={!!modalProduct}
          onClose={() => setModalProduct(null)}
          product={modalProduct}
        />
      )}
    </section>
  );
}
