// context/CartContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "@/lib/catalog";
import {
  addToCart as apiAddToCart,
  getCart as apiGetCart,
  CartData,
  CartProduct,
  CartCarrier
} from "@/lib/cart";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  syncCart: () => Promise<void>;
  updateCarrier: (carrierId: number) => Promise<void>;
  selectedCarrier: CartCarrier | null;
  totals: { subtotal: number; shipping: number; total: number };
  isLoading: boolean;
  cartExpired: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState({ subtotal: 0, shipping: 0, total: 0 });
  const [selectedCarrier, setSelectedCarrier] = useState<CartCarrier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cartExpired, setCartExpired] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Cargar carrito y sesión desde localStorage al iniciar
  useEffect(() => {
    // 1. Cargar items locales
    const savedCart = localStorage.getItem("liwilu_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error al cargar el carrito local:", error);
      }
    }

    // 2. Cargar sessionId existente
    const currentSessionId = localStorage.getItem("liwilu_session_id");
    if (currentSessionId) {
      console.log("📄 Loaded Existing Session ID:", currentSessionId);
      setSessionId(currentSessionId);
    }

    // 3. Sincronizar con el backend
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken || currentSessionId) {
      syncCart();
    }
  }, []);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("liwilu_cart", JSON.stringify(items));
    } else {
      localStorage.removeItem("liwilu_cart");
    }
  }, [items]);

  /**
   * Actualiza el Session ID si el backend retorna uno nuevo
   */
  const updateSessionId = (newSessionId?: string) => {
    if (newSessionId && newSessionId !== sessionId) {
      console.log("♻️ Backend returned new Session ID:", newSessionId);
      localStorage.setItem("liwilu_session_id", newSessionId);
      setSessionId(newSessionId);
    }
  };

  /**
   * Convert backend CartProduct to frontend Product format
   */
  const convertCartProductToProduct = (cartProduct: CartProduct): Product => {
    return {
      id: cartProduct.id,
      productId: cartProduct.prestashopId,
      name: cartProduct.name,
      price: cartProduct.variationPriceWithTax || cartProduct.discountPrice || cartProduct.priceWithTax,
      originalPrice: cartProduct.priceWithTax,
      quantity: cartProduct.quantity,
      coverImage: cartProduct.variationImage || cartProduct.coverImage,
      reference: cartProduct.variationReference || cartProduct.reference || null,
      sku: cartProduct.codArticle || null,
      prestashopCombinationId: cartProduct.prestashopCombinationId ?? cartProduct.idArticle,
    };
  };

  /**
   * Sync cart with backend
   */
  const syncCart = async () => {
    try {
      const response = await apiGetCart();

      if (response.success) {
        setCartExpired(false);
        // Actualizar Session ID si viene en la respuesta
        updateSessionId(response.data.sessionId);

        if (response.data.products.length > 0) {
          // Convert backend products to frontend format
          const backendItems: CartItem[] = response.data.products.map(product => ({
            product: convertCartProductToProduct(product),
            quantity: product.quantity
          }));

          setItems(backendItems);
        } else {
          setItems([]);
        }

        setTotals(response.data.totals);
        setSelectedCarrier(response.data.carrier);
      } else if (response.isExpired) {
        console.warn("⚠️ Local cart expired, clearing...");
        import("@/lib/notifications").then(({ showToast }) => {
          showToast("El carrito ha expirado. Por favor, vuelve a agregar los productos.", "error");
        });
        setCartExpired(true);
        setItems([]);
        setTotals({ subtotal: 0, shipping: 0, total: 0 });
        setSelectedCarrier(null);
        localStorage.removeItem("liwilu_cart");
        localStorage.removeItem("liwilu_session_id");
        setSessionId(null);
      }
    } catch (error: any) {
      // If not authenticated or error, keep local cart
      console.log("Could not sync cart with backend:", error.message);
    }
  };

  /**
   * Add product to cart (with backend sync)
   */
  const addToCart = async (product: Product, quantity: number = 1) => {
    setIsLoading(true);

    try {
      // Extract the actual product ID (prestashopId)
      // We prioritize productId if available, otherwise fallback to id
      let productId = typeof product.productId === 'number'
        ? product.productId
        : parseInt(String(product.productId || product.id));

      const cleanQuantity = Math.max(1, Math.floor(quantity));

      if (isNaN(productId)) {
        console.error("Invalid Product ID:", product);
        throw new Error("ID de producto no válido");
      }

      console.log(`🛒 Adding to cart: ID ${productId}, Combination ID ${product.prestashopCombinationId ?? null}, Quantity ${cleanQuantity}`);

      // Call backend API
      const response = await apiAddToCart(productId, cleanQuantity, product.prestashopCombinationId ?? null);

      if (response.success) {
        // Actualizar Session ID si el backend retorna uno nuevo
        updateSessionId(response.data.sessionId);

        // Update local state with backend response
        const backendItems: CartItem[] = response.data.products.map(p => ({
          product: convertCartProductToProduct(p),
          quantity: p.quantity
        }));

        setItems(backendItems);
        setTotals(response.data.totals);
        setSelectedCarrier(response.data.carrier);
      }
    } catch (error: any) {
      console.error("Error adding to cart via API:", error);

      // Fallback to local cart if API fails
      setItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) => String(item.product.id) === String(product.id)
        );

        if (existingItem) {
          // Si el producto ya existe, aumentar la cantidad
          return prevItems.map((item) =>
            String(item.product.id) === String(product.id)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Si es nuevo, agregarlo
          return [...prevItems, { product, quantity }];
        }
      });

      // Don't re-throw error - allow fallback to work silently
      console.log("Using local cart fallback");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    setIsLoading(true);
    try {
      const numericId = parseInt(productId);
      if (isNaN(numericId)) {
        console.error("Invalid Product ID for removal:", productId);
        return;
      }

      // Call backend API
      const { removeFromCart: apiRemoveFromCart } = await import("@/lib/cart");
      const response = await apiRemoveFromCart(numericId);

      if (response.success) {
        // Update session ID if returned
        updateSessionId(response.data.sessionId);

        // Update local state with backend response
        const backendItems: CartItem[] = response.data.products.map(p => ({
          product: convertCartProductToProduct(p),
          quantity: p.quantity
        }));

        setItems(backendItems);
        setTotals(response.data.totals);
        setSelectedCarrier(response.data.carrier);
      }
    } catch (error: any) {
      console.error("Error removing from cart via API:", error);

      // Fallback to local removal
      setItems((prevItems) =>
        prevItems.filter((item) => String(item.product.id) !== String(productId))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setIsLoading(true);
    try {
      const numericId = parseInt(productId);
      if (isNaN(numericId)) {
        console.error("Invalid Product ID for update:", productId);
        return;
      }

      // Call backend API
      const { updateCartQuantity } = await import("@/lib/cart");
      const response = await updateCartQuantity(numericId, quantity);

      if (response.success) {
        // Update session ID if returned
        updateSessionId(response.data.sessionId);

        // Update local state with backend response
        const backendItems: CartItem[] = response.data.products.map(p => ({
          product: convertCartProductToProduct(p),
          quantity: p.quantity
        }));

        setItems(backendItems);
        setTotals(response.data.totals);
        setSelectedCarrier(response.data.carrier);
      }
    } catch (error: any) {
      console.error("Error updating quantity via API:", error);

      // Fallback to local update
      setItems((prevItems) =>
        prevItems.map((item) =>
          String(item.product.id) === String(productId)
            ? { ...item, quantity }
            : item
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      // Call backend API
      const { clearCart: apiClearCart } = await import("@/lib/cart");
      const response = await apiClearCart();

      if (response.success) {
        // Update session ID if returned
        updateSessionId(response?.data?.sessionId);

        // Clear local state
        setItems([]);
        localStorage.removeItem("liwilu_cart");
      }
    } catch (error: any) {
      console.error("Error clearing cart via API:", error);

      // Fallback to local clear
      setItems([]);
      localStorage.removeItem("liwilu_cart");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCarrier = async (carrierId: number) => {
    setIsLoading(true);
    try {
      const { updateCartCarrier } = await import("@/lib/cart");
      const response = await updateCartCarrier(carrierId);

      if (response.success) {
        // Actualizar Session ID si el backend retorna uno nuevo
        updateSessionId(response.data.sessionId);

        // Convert backend products to frontend format
        const backendItems: CartItem[] = response.data.products.map(p => ({
          product: convertCartProductToProduct(p),
          quantity: p.quantity
        }));

        setItems(backendItems);
        setTotals(response.data.totals);
        setSelectedCarrier(response.data.carrier);
      }
    } catch (error: any) {
      console.error("Error updating carrier via API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCartCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const price =
        typeof item.product.price === "number"
          ? item.product.price
          : parseFloat(item.product.price || "0");
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        syncCart,
        updateCarrier,
        selectedCarrier,
        totals,
        isLoading,
        cartExpired,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}

