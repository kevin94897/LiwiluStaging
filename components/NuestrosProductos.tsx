"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
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
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/router";
import { fadeInUp, transitions, viewportConfig } from "@/lib/motionVariants";
import Button from "./ui/Button";
import AddToCartModal from "@/components/AddToCartModal";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { showToast } from "@/lib/notifications";

interface NuestrosProductosProps {
  productos?: Product[];
}

export default function NuestrosProductos({
  productos = [],
}: NuestrosProductosProps) {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [loadingCart, setLoadingCart] = useState<string | null>(null);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const router = useRouter();

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

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Cargar favoritos del API
  useEffect(() => {
    async function loadFavorites() {
      try {
        const response = await getFavorites();
        if (response.success) {
          const favoriteIds = response.data.map((fav) => fav.id.toString());
          setFavoritos(favoriteIds);
        }
      } catch (error) {
        console.log("Could not load favorites:", error);
      }
    }
    loadFavorites();
  }, []);

  const productosAMostrar = productos.length > 0 ? productos.slice(0, 8) : [];

  const toggleFavorito = async (id: string) => {
    try {
      setTogglingFavorite(id);

      const result = await toggleFavorite(parseInt(id));

      if (result.isFavorite) {
        setFavoritos((prev) => [...prev, id]);
        showToast("Producto agregado a favoritos", "success");
      } else {
        setFavoritos((prev) => prev.filter((fav) => fav !== id));
        showToast("Producto eliminado de favoritos", "success");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);

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
        showToast("Error al actualizar favoritos", "error");
      }
    } finally {
      setTogglingFavorite(null);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, producto: Product) => {
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
      console.error("Error al agregar al carrito:", error);
      showToast("Error al agregar el producto al carrito", "error");
    } finally {
      setLoadingCart(null);
    }
  };

  const ProductCard = ({ producto }: { producto: Product }) => {
    const imageUrl =
      producto.coverImage ||
      (producto.associations?.images?.[0]?.id
        ? getProductImageUrl(
            producto.id.toString(),
            producto.associations.images[0].id,
          )
        : "/images/productos/placeholder_liwilu.png");

    return (
      <Link href={`/tienda/${producto.linkRewrite || producto.id}`}>
        <div className="bg-white rounded-md shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
          <div className="relative">
            <span className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
              OFERTA
            </span>
            {(producto.quantity ?? 0) <= 0 && (
              <span className="absolute top-2 right-2 md:right-auto md:left-2 md:top-10 bg-red-400 text-white px-3 py-1 rounded-full text-xs font-semibold z-20 shadow-md">
                AGOTADO
              </span>
            )}
            <div className="relative w-full h-48">
              <Image
                src={imageUrl}
                alt={getProductName(producto)}
                fill
                sizes="(max-width: 640px) 200px, (max-width: 1024px) 300px, 400px"
                quality={75}
                className={`object-cover ${
                  (producto.quantity ?? 0) <= 0 ? "grayscale opacity-60" : ""
                }`}
              />
            </div>
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 z-10 transition-transform hover:scale-110 disabled:opacity-50"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorito(producto.id.toString());
              }}
              disabled={togglingFavorite === producto.id.toString()}
            >
              {togglingFavorite === producto.id.toString() ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
              ) : (
                <FaHeart
                  className={`w-5 h-5 transition ${
                    favoritos.includes(producto.id.toString())
                      ? "text-red-500 fill-current"
                      : "text-gray-400 hover:text-red-500"
                  }`}
                />
              )}
            </button>
          </div>

          <div className="p-4 flex flex-col justify-between h-44 bg-primary">
            <h3 className="font-semibold leading-tight text-lg mb-2 line-clamp-2 h-12 text-white">
              {getProductName(producto)}
            </h3>
            <div className="flex justify-between items-center mb-2">
              {hasDiscount(producto) && (
                <span className="text-white text-sm line-through">
                  {formatPrice(getRegularPrice(producto))}
                </span>
              )}
              <span className="text-white font-semibold text-lg">
                {formatPrice(getEffectivePrice(producto))}
              </span>
            </div>
            <Button
              size="sm"
              className={`w-full ${(producto.quantity ?? 0) <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              variant="secondary"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                if ((producto.quantity ?? 0) > 0) {
                  handleAddToCart(e, producto);
                } else {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              disabled={
                loadingCart === producto.id.toString() ||
                (producto.quantity ?? 0) <= 0
              }
            >
              {loadingCart === producto.id.toString() ? (
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
              ) : (producto.quantity ?? 0) <= 0 ? (
                <span className="flex items-center gap-2">
                  <span>Agotado</span>
                </span>
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

  if (productosAMostrar.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-8 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-6 sm:mb-8 md:mb-12 text-primary-dark"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeInUp}
          transition={transitions.smooth}
        >
          Nuestros Productos
        </motion.h2>

        {/* Slider para Mobile */}
        {isMobile ? (
          <motion.div
            className="mb-6 sm:mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={fadeInUp}
            transition={transitions.smooth}
          >
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex touch-pan-y touch-pinch-zoom -ml-3 sm:-ml-4">
                {productosAMostrar.map((producto) => (
                  <div
                    key={producto.id}
                    className="flex-[0_0_85%] min-w-0 pl-3 sm:flex-[0_0_50%] sm:pl-4"
                  >
                    <ProductCard producto={producto} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Grid para Desktop */
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {productosAMostrar.map((producto) => (
              <div key={producto.id}>
                <ProductCard producto={producto} />
              </div>
            ))}
          </div>
        )}

        {/* Botón Ir a la Tienda */}
        <motion.div
          className="flex justify-center px-4 sm:px-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeInUp}
          transition={{ delay: 0.3, ...transitions.smooth }}
        >
          <Button
            href="/productos"
            size="lg"
            variant="primary"
            className="w-full md:w-auto"
          >
            Ir a la Tienda
          </Button>
        </motion.div>
      </div>

      {/* Modal de confirmación */}
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
