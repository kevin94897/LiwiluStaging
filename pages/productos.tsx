"use client";

import Image from "next/image";
import Link from "next/link";
import { GetServerSideProps } from "next";
import Layout from "@/components/Layout";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { showToast } from "@/lib/notifications";
import Contacto from "@/components/Contacto";
import AddToCartModal from "@/components/AddToCartModal";

import { useCart } from "@/context/CartContext";
import { formatPrice, getProductName, getProductImageUrl } from "@/lib/utils";
import { Product, Category } from "@/lib/catalog";
import {
  searchProducts,
  getCatalogHierarchy,
  getLevelTwoCategories,
  toggleFavorite,
  getFavorites,
  checkMultipleFavorites,
  HierarchyResponse,
  CategoryLevelTwo,
} from "@/lib/catalog";
import { FaRegHeart, FaPlus, FaMinus, FaHeart } from "react-icons/fa";

interface TiendaProps {
  products: Product[];
  levelTwoCategories: CategoryLevelTwo[];
  hierarchy: HierarchyResponse | null;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Definimos una interfaz para los parámetros de filtro esperados en el query
interface QueryParams {
  categoryIds?: string;
  brandIds?: string;
  inStock?: string;
  sortBy?: string;
  page?: string;
  search?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { query } = context;
    const params: QueryParams = query;

    // Parsear parámetros
    const page = params.page ? parseInt(params.page) : 1;
    const categoryIds = params.categoryIds
      ? params.categoryIds.split(",").map(Number)
      : undefined;
    const brandIds = params.brandIds
      ? params.brandIds.split(",").map(Number)
      : undefined;
    const inStock = params.inStock === "true";

    const [searchResponse, levelTwoCategories, hierarchy] = await Promise.all([
      searchProducts({
        page,
        categoryIds,
        brandIds,
        inStock,
        sortBy: params.sortBy,
        search: params.search,
        limit: 20,
      }),
      getLevelTwoCategories(),
      getCatalogHierarchy(),
    ]);

    return {
      props: {
        products: searchResponse.data || [],
        levelTwoCategories,
        hierarchy,
        pagination: searchResponse.pagination || null,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return {
      props: {
        products: [],
        levelTwoCategories: [],
        hierarchy: null,
        error: message,
      },
    };
  }
};

export default function Tienda({
  products,
  levelTwoCategories = [],
  hierarchy,
  pagination,
}: TiendaProps & { pagination: any }) {
  const router = useRouter();
  const [openCategories, setOpenCategories] = useState<string[]>(["Categoria"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 3000, stopOnInteraction: false })
  ]);

  // Sync state with URL query
  useEffect(() => {
    if (router.query.categoryIds) {
      setSelectedCategory(router.query.categoryIds.toString());
    } else {
      setSelectedCategory("all");
    }
  }, [router.query.categoryIds]);

  const updateFilters = (newParams: Partial<QueryParams>) => {
    const currentQuery = router.query;
    const updatedQuery = { ...currentQuery, ...newParams } as Record<
      string,
      any
    >;

    // Remove keys with undefined/null/empty values
    Object.keys(updatedQuery).forEach((key) => {
      if (!updatedQuery[key] && updatedQuery[key] !== 0) {
        delete updatedQuery[key];
      }
    });

    // Reset page to 1 on filter change (unless page is explicitly passed)
    if (!newParams.page) {
      updatedQuery.page = "1";
    }

    router.push(
      {
        pathname: "/productos",
        query: updatedQuery,
      },
      undefined,
      { scroll: false }
    );
  };

  const [loadingCart, setLoadingCart] = useState<string | null>(null);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const productsPerPage = 20;

  const { addToCart } = useCart();

  // Animación de entrada
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch user favorites on mount
  useEffect(() => {
    async function loadFavorites() {
      try {
        const response = await getFavorites();
        if (response.success) {
          // Map favorite products to their IDs
          const favoriteIds = response.data.map((fav) => fav.id.toString());
          setFavoritos(favoriteIds);
        }
      } catch (error) {
        // Silently fail if user is not authenticated
        console.log("Could not load favorites:", error);
      }
    }

    loadFavorites();
  }, []);

  // Check favorites status when products change (filters/pagination)
  useEffect(() => {
    async function checkCurrentPageFavorites() {
      if (!products || products.length === 0) return;

      try {
        const productIds = products.map((p) =>
          typeof p.id === "string" ? parseInt(p.id) : p.id
        ); // Use database IDs
        const favoriteStatus = await checkMultipleFavorites(productIds);

        // Update favorites state with confirmed favorites from current page
        const confirmedFavorites = Object.entries(favoriteStatus)
          .filter(([_, isFav]) => isFav)
          .map(([id]) => id);

        // Merge with existing favorites to avoid losing state of other pages
        setFavoritos((prev) => {
          // Create set from previous favorites
          const newFavorites = new Set(prev);

          // Add confirmed favorites
          confirmedFavorites.forEach((id) => newFavorites.add(id));

          return Array.from(newFavorites);
        });
      } catch (error) {
        console.log("Error checking favorites:", error);
      }
    }

    checkCurrentPageFavorites();
  }, [products]);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleFavorito = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setTogglingFavorite(productId);

      // Call API to toggle favorite
      const result = await toggleFavorite(parseInt(productId));

      // Update local state based on API response
      if (result.isFavorite) {
        setFavoritos((prev) => [...prev, productId]);
        showToast("Producto agregado a favoritos");
      } else {
        setFavoritos((prev) => prev.filter((id) => id !== productId));
        showToast("Producto eliminado de favoritos");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);

      // Check if it's an authentication error
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
          { shallow: true }
        );
      } else {
        showToast("Error al actualizar favoritos. Por favor, intenta de nuevo.", "error");
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
      // Ensure prestashopCombinationId is null if not present (simple products)
      const cartProduct = {
        ...producto,
        prestashopCombinationId: producto.prestashopCombinationId ?? null
      };
      addToCart(cartProduct, 1);
      setModalProduct(cartProduct);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      showToast("Error al agregar el producto al carrito", "error");
    } finally {
      setLoadingCart(null);
    }
  };

  // Use products directly from props (server-side filtered)
  const currentProducts = products;

  // Use pagination from backend if available, otherwise calculate
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;

  return (
    <Layout title="Tienda - Liwilu" description="Productos al por mayor">
      {/* Banner Hero con animación */}
      <section className="relative text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/productos/liwilu_banner_productos.png"
            alt="Banner Productos"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-6 md:py-8 flex items-center justify-between relative">
          <div className="absolute -right-10 md:-right-20 -top-10 md:-top-28 w-32 md:w-56 floating">
            <Image
              src="/images/vectores/liwilu_banner_productos_vector_02.png"
              alt="MacBook Pro"
              width={295}
              height={218}
              quality={100}
              className="h-auto"
              priority
            />
          </div>
          <div
            className={`w-1/2 transition-all duration-1000 transform ${isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-10"
              }`}
          >
            <span className="text-[12px] md:text-sm font-light mb-2 block animate-fade-in">
              NUEVO
            </span>
            <h1 className="text-2xl md:text-5xl font-semibold mb-2 text-primary-light leading-tight animate-slide-up">
              MacBook Pro de 14 pulgadas M4
            </h1>
            <p className="text-[12px] md:text-sm font-light text-secondary animate-fade-in-delay">
              <span>SKU: MW2U3E/A</span>
              <span className="ml-2">Barcode: 195949704796</span>
            </p>
          </div>
          <div className="w-1/2 flex items-center justify-center">
            <div
              className={`absolute md:-bottom-10 floating-slow transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
            >
              <Image
                src="/images/productos/liwilu_productos_laptop_img.png"
                alt="MacBook Pro"
                width={305}
                height={246}
                quality={100}
                className="h-auto md:block hidden"
                priority
              />
              <Image
                src="/images/productos/liwilu_productos_laptop_img_mob.png"
                alt="MacBook Pro"
                width={148}
                height={121}
                quality={100}
                className="h-auto md:hidden"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb y categorías circulares */}
      <section className="py-6 relative overflow-hidden bg-gradient-to-r from-primary to-primary">
        <div className="absolute -left-10 md:-left-60 -bottom-18 md:-bottom-80 w-32 md:w-full z-0 pointer-events-none">
          <Image
            src="/images/vectores/liwilu_banner_productos_vector_03.png"
            alt="MacBook Pro"
            width={654}
            height={499}
            quality={100}
            className="h-auto"
            priority
          />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-white text-sm mb-3 animate-fade-in">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
            <span className="mx-2">|</span>
            <span>Tienda virtual</span>
          </div>

          {/* Slider Categorias */}
          <div className="max-w-6xl mx-auto px-4 md:px-0">
            <div className="embla" ref={emblaRef}>
              <div className="embla__container">
                {levelTwoCategories.map((cat, index) => {
                  let emoji = "🏷️";
                  const name = cat.name;
                  if (name.includes("Libro")) emoji = "📚";
                  else if (name.includes("Hogar") || name.includes("Limpieza"))
                    emoji = "🧹";
                  else if (name.includes("Uniforme")) emoji = "👕";
                  else if (name.includes("Útil")) emoji = "✏️";
                  else if (name.includes("Tecnolog")) emoji = "💻";

                  return (
                    <div key={cat.id} className="embla__slide flex-[0_0_50%] sm:flex-[0_0_33.33%] md:flex-[0_0_16.66%] lg:flex-[0_0_16.66%] xl:flex-[0_0_16.66%] px-2 py-3 focus:outline-none">
                      <div
                        onClick={() =>
                          updateFilters({ categoryIds: cat.id.toString() })
                        }
                        className="flex flex-col items-center cursor-pointer transition-transform duration-300"
                      >
                        <div
                          className={`bg-white relative w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden shadow-lg mb-2 mx-auto transition-all ${selectedCategory === cat.id.toString()
                            ? "ring-4 ring-white scale-105"
                            : "bg-white"
                            }`}
                        >
                          {cat.coverImage ? (
                            <Image
                              src={cat.coverImage}
                              alt={cat.name}
                              fill
                              sizes="(max-width: 768px) 80px, 128px"
                              className="object-cover"
                              priority={false}
                            />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-2xl md:text-5xl">
                              {emoji}
                            </span>
                          )}
                        </div>

                        <span className="text-white md:text-lg text-xs pt-1 text-center block w-full px-1 !leading-[1.2]">
                          {cat.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categorias */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-20">
          {/* Sidebar con animación */}
          <aside className="w-full md:w-64 flex-shrink-0 md:block hidden">
            <div className="bg-white rounded-2xl shadow-lg p-5 divide-y divide-gray-200">
              {hierarchy?.hierarchy.parentGroups
                .filter((group) =>
                  hierarchy.hierarchy.items.some(
                    (item) => item.nameParent === group.nameParent
                  )
                )
                .map((group) => {
                  const groupName = group.name;
                  const isOpen = openCategories.includes(groupName);
                  const items = hierarchy.hierarchy.items.filter(
                    (item) => item.nameParent === group.nameParent
                  );

                  return (
                    <div key={groupName} className="py-4">
                      <button
                        onClick={() => toggleCategory(groupName)}
                        className="w-full flex justify-between items-center font-semibold text-sm text-primary-dark"
                      >
                        <span>{groupName}</span>
                        <span className="text-2xl font-light text-primary-dark">
                          {isOpen ? (
                            <FaMinus className="w-3 h-3 transition" />
                          ) : (
                            <FaPlus className="w-3 h-3 transition" />
                          )}
                        </span>
                      </button>

                      {isOpen && (
                        <ul className="space-y-3 mt-4">
                          {/* Add "Ver todos" option for Categoria group */}
                          {groupName === "Categoria" && (
                            <li>
                              <button
                                onClick={() => {
                                  updateFilters({ categoryIds: undefined });
                                }}
                                className={`w-full text-left transition-colors flex items-center justify-between ${selectedCategory === "all"
                                  ? "text-primary"
                                  : "text-gray-500 hover:text-primary-dark"
                                  }`}
                              >
                                <span className="text-sm">Ver todos</span>
                                {selectedCategory === "all" && (
                                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                                )}
                              </button>
                            </li>
                          )}
                          {items.map((item) => (
                            <li key={item.id}>
                              <button
                                onClick={() => {
                                  updateFilters({
                                    categoryIds: item.id.toString(),
                                  });
                                }}
                                className={`w-full text-left transition-colors flex items-center justify-between ${selectedCategory === item.id.toString()
                                  ? "text-primary"
                                  : "text-gray-500 hover:text-primary-dark"
                                  }`}
                              >
                                <span className="text-sm">{item.name}</span>
                                {selectedCategory === item.id.toString() && (
                                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="hidden md:block mt-6 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop"
                  alt="Banner"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                  Nuevo
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de productos con animaciones */}
          <main className="flex-1">
            <div
              className={`bg-white rounded-sm shadow-md mb-14 overflow-hidden transition-all duration-700 transform hover:shadow-xl ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
            >
              <div className="relative h-32 md:h-40">
                <Image
                  src="/images/productos/liwilu_banner_productos_grid.png"
                  alt="Banner productos"
                  fill
                  className="object-cover [object-position:50%_20%] md:[object-position:50%_80%]"
                  priority
                />
              </div>
            </div>

            {/* Sort selector */}
            <div className="flex justify-between items-center mb-6 animate-fade-in">
              <p className="text-gray-600 text-sm md:block hidden">
                {pagination?.total || 0} productos encontrados
              </p>
              <div className="flex md:items-center items-start md:flex-row flex-col gap-3">
                <label
                  htmlFor="sort"
                  className="text-sm font-medium text-gray-700"
                >
                  Ordenar por:
                </label>
                <select
                  id="sort"
                  value={router.query.sortBy || "price"}
                  onChange={(e) => updateFilters({ sortBy: e.target.value })}
                  className="pr-4 pl-2 py-2 border border-gray-300 rounded-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 cursor-pointer"
                >
                  <option value="price">Precio: Menor a Mayor</option>
                  <option value="name">Nombre: A-Z</option>
                  <option value="newest">Más Recientes</option>
                  <option value="oldest">Más Antiguos</option>
                </select>
              </div>
            </div>

            {/* Empty state */}
            {currentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 animate-fade-in">
                <div className="w-32 h-32 mb-6 relative animate-bounce-slow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2 animate-slide-up text-center">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md animate-fade-in-delay">
                  No hay productos disponibles con los filtros seleccionados.
                  Intenta ajustar tus criterios de búsqueda.
                </p>
                <button
                  onClick={() => {
                    router.push("/productos");
                    setSelectedCategory("all");
                  }}
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Ver todos los productos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentProducts.map((product, index) => {
                  // Priority to coverImage from catalog, fallback to association logic
                  const imageUrl =
                    product.coverImage ||
                    (product.associations?.images?.[0]?.id
                      ? getProductImageUrl(
                        product.id.toString(),
                        product.associations.images[0].id
                      )
                      : "/no-image.png");

                  return (
                    <Link
                      key={product.id}
                      href={`/tienda/${product.id}`}
                      className="block animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="rounded-md shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform group">
                        <div className="relative overflow-hidden">
                          <button
                            className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 z-10 transition-transform hover:scale-110 disabled:opacity-50"
                            onClick={(e) =>
                              toggleFavorito(e, product.id.toString())
                            }
                            disabled={
                              togglingFavorite === product.id.toString()
                            }
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
                          <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                            {/* {(product.quantity ?? 0) <= 0 && (
                              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 pointer-events-none">
                                <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg transform -rotate-12 scale-110">
                                  AGOTADO
                                </span>
                              </div>
                            )} */}
                            <Image
                              src={imageUrl}
                              alt={getProductName(product)}
                              fill
                              unoptimized
                              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${(product.quantity ?? 0) <= 0 ? "grayscale opacity-70" : ""
                                }`}
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-primary">
                          <div className="mb-0">
                            <span className="text-white text-sm font-normal">
                              Liwilu
                            </span>
                          </div>

                          <h3 className="font-normal text-lg mb-2 line-clamp-2 h-10 text-white leading-5 transition-colors group-hover:text-gray-100">
                            {getProductName(product)}
                          </h3>

                          <div className="flex items-center gap-1 mb-0">
                            <div className="flex text-yellow-400 text-sm">
                              {"★".repeat(5)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-6">
                            <span className="text-white font-semibold text-xl">
                              {formatPrice(product.price || 0)}
                            </span>
                            <span className="text-white text-sm line-Categorías">
                              {formatPrice(
                                parseFloat((product.price || 0).toString()) *
                                1.5
                              )}
                            </span>
                          </div>

                          <button
                            className={`w-full bg-white text-primary font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform ${(product.quantity ?? 0) <= 0
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-100 hover:shadow-lg"
                              }`}
                            onClick={(e) => {
                              if ((product.quantity ?? 0) > 0) {
                                handleAddToCart(e, product);
                              } else {
                                e.preventDefault();
                                e.stopPropagation();
                              }
                            }}
                            disabled={loadingCart === product.id.toString() || (product.quantity ?? 0) <= 0}
                          >
                            {loadingCart === product.id.toString() ? (
                              <>
                                <svg
                                  className="animate-spin h-5 w-5"
                                  xmlns="http://www.w3.org/2000/svg"
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
                                <span>Agregando...</span>
                              </>
                            ) : (product.quantity ?? 0) <= 0 ? (
                              <span>Agotado</span>
                            ) : (
                              <>
                                {/* <FaShoppingCart className="w-4 h-4 transition-transform group-hover:scale-110" /> */}
                                <span>Agregar al carrito</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Paginación con animación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 animate-fade-in">
                <button
                  onClick={() =>
                    updateFilters({ page: (currentPage - 1).toString() })
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  ‹
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => updateFilters({ page: page.toString() })}
                        className={`px-4 py-2 rounded-sm transition-all duration-300 transform hover:scale-110 ${currentPage === page
                          ? "bg-primary text-white font-semibold shadow-lg"
                          : "border hover:bg-gray-100"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() =>
                    updateFilters({ page: (currentPage + 1).toString() })
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  ›
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Contacto />

      {modalProduct && (
        <AddToCartModal
          isOpen={!!modalProduct}
          onClose={() => setModalProduct(null)}
          product={modalProduct}
        />
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .floating {
          animation: floating 3s ease-in-out infinite;
        }

        .floating-slow {
          animation: floating 4s ease-in-out infinite;
        }

        @keyframes floating {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </Layout>
  );
}
