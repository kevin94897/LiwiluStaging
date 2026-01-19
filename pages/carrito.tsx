// pages/carrito.tsx
"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProductImageUrl, formatPrice, getProductName } from "@/lib/utils";
import { Product } from "@/lib/catalog";
import {
  FaRegTrashAlt,
  FaMapMarkerAlt,
  FaTruck,
  FaStore,
  FaCheck,
  FaTimes,
  FaCheckCircle,
  FaRegClock,
  FaTimesCircle,
} from "react-icons/fa";
import router from "next/router";
import { showToast } from "@/lib/notifications";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, LoginSchemaType } from "@/lib/loginSchema";
import {
  carritoRegisterSchema,
  CarritoRegisterSchemaType,
} from "@/lib/carritoRegisterSchema";
import { loginUser } from "@/pages/api/auth/login";
import { registerUser } from "@/pages/api/auth/register";
import { guestDataSchema, GuestDataSchemaType } from "@/lib/guestDataSchema";
import { useLocations } from "@/hooks/useLocations";
import { z } from "zod";
import { PiWarningCircleFill } from "react-icons/pi";
import { FaPencil } from "react-icons/fa6";
import {
  getCarriers,
  CartCarrier,
  getWarehouseDistricts,
  WarehouseDistrict,
  getWarehouseMap,
  WarehouseMapItem,
  validateStock,
  StockValidationResponse,
} from "@/lib/cart";

const WarehouseMap = dynamic(() => import("@/components/WarehouseMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
      Cargando mapa...
    </div>
  ),
});

// Distritos disponibles

export default function Carrito() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [recordarme, setRecordarme] = useState(false);
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    updateCarrier,
    selectedCarrier: contextCarrier,
    totals,
    cartExpired,
  } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [metodoEnvio, setMetodoEnvio] = useState<"delivery" | "retiro">(
    "delivery",
  );
  const [carriers, setCarriers] = useState<CartCarrier[]>([]);
  const [warehouseDistricts, setWarehouseDistricts] = useState<
    WarehouseDistrict[]
  >([]);
  const [mapWarehouses, setMapWarehouses] = useState<WarehouseMapItem[]>([]);
  const [loadingCarriers, setLoadingCarriers] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<CartCarrier | null>(
    null,
  );
  const [distritoSeleccionado, setDistritoSeleccionado] = useState("");
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string | null>(
    null,
  );
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false);
  const [direccionEnvio, setDireccionEnvio] = useState({
    calle: "Calle continental 145",
    distrito: "Ate",
    ciudad: "Lima",
    departamento: "Lima",
  });
  const [editandoDireccion, setEditandoDireccion] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNewsletter, setAcceptNewsletter] = useState(false);

  // Estados para autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [mainAddressId, setMainAddressId] = useState<string | null>(null);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);

  const [isGuest, setIsGuest] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);

  // States for stock validation
  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const [stockValidationResult, setStockValidationResult] =
    useState<StockValidationResponse | null>(null);

  // Estados para formulario de invitado
  const [guestData, setGuestData] = useState<GuestDataSchemaType>({
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    celular: "",
    telefonoOpcional: "",
    departamento: "Lima",
    provincia: "Lima",
    distrito: "",
    direccion: "",
    numeroDpto: "",
    referencia: "",
  });
  const [guestErrors, setGuestErrors] = useState<
    Partial<Record<keyof GuestDataSchemaType, string>>
  >({});
  const [guestDataCompleted, setGuestDataCompleted] = useState(false);

  // Hooks de ubicación
  const guestLocations = useLocations("Lima", "Lima", "");
  const userLocations = useLocations(
    direccionEnvio.departamento || "Lima",
    direccionEnvio.ciudad || "Lima",
    direccionEnvio.distrito,
  );
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>(
    {},
  );

  // Sincronizar estado local con hook de auth
  useEffect(() => {
    if (!authLoading) {
      setIsLoggedIn(isAuthenticated);
    }
  }, [isAuthenticated, authLoading]);

  // Cargar direcciones si el usuario está logueado
  useEffect(() => {
    const fetchAddresses = async () => {
      // 🔹 Re-verificar autenticación al cargar componentes
      if (
        isAuthenticated &&
        ((user && "token" in user) || localStorage.getItem("accessToken"))
      ) {
        setIsLoggedIn(true); // Asegurar que UI refleje logueo
        try {
          const token = localStorage.getItem("accessToken");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/addresses`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const addresses = result.data;
              setUserAddresses(addresses);

              const mainAddress = addresses.find((addr: any) => addr.isMain);
              if (mainAddress) {
                setMainAddressId(mainAddress.id);
                setDireccionEnvio({
                  calle: mainAddress.address,
                  distrito: mainAddress.district,
                  ciudad: mainAddress.province,
                  departamento: mainAddress.department,
                });
                userLocations.setLocationValues(
                  mainAddress.department,
                  mainAddress.province,
                  mainAddress.district,
                );
              } else if (addresses.length > 0) {
                // If no main address, don't set a default yet, we'll show a dropdown
                setMainAddressId(null);
              }
            }
          }
        } catch (error) {
          console.error("Error al cargar direcciones:", error);
        }
      }
    };

    fetchAddresses();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (
      !authLoading &&
      items.length > 0 &&
      !isAuthenticated &&
      !isLoggedIn &&
      !guestDataCompleted
    ) {
      setShowLoginModal(true);
    }
  }, [
    items.length,
    isAuthenticated,
    isLoggedIn,
    guestDataCompleted,
    authLoading,
  ]);

  // Fetch carriers
  useEffect(() => {
    const fetchCarriers = async () => {
      setLoadingCarriers(true);
      try {
        const response = await getCarriers();
        if (response.success) {
          setCarriers(response.data);
          // Set primary carrier if available
          if (response.data.length > 0) {
            // Priority: context carrier > backend carrier 0
            const carrierToSelect = contextCarrier || response.data[0];
            setSelectedCarrier(carrierToSelect);

            if (carrierToSelect.name.toLowerCase().includes("retiro")) {
              setMetodoEnvio("retiro");
            } else {
              setMetodoEnvio("delivery");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching carriers:", error);
      } finally {
        setLoadingCarriers(false);
      }
    };

    fetchCarriers();
  }, []);

  // Fetch warehouse districts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await getWarehouseDistricts();
        if (response.success) {
          setWarehouseDistricts(response.data);
        }
      } catch (error) {
        console.error("Error fetching warehouse districts:", error);
      }
    };

    fetchDistricts();
  }, []);

  // Sync local selectedCarrier with contextCarrier
  useEffect(() => {
    if (contextCarrier) {
      setSelectedCarrier(contextCarrier);
      if (contextCarrier.name.toLowerCase().includes("retiro")) {
        setMetodoEnvio("retiro");
      } else {
        setMetodoEnvio("delivery");
      }
    }
  }, [contextCarrier]);

  // NUEVO: Estado para el tab activo (login o registro)
  const [activeTab, setActiveTab] = useState<"login" | "registro" | "guest">(
    "login",
  );

  // NUEVO: Estados para registro
  const [registroData, setRegistroData] = useState<CarritoRegisterSchemaType>({
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    celular: "",
    telefonoOpcional: "",
    departamento: "Lima",
    provincia: "Lima",
    distrito: "",
    direccion: "",
    numeroDpto: "",
    referencia: "",
    email: "",
    password: "",
    confirmarPassword: "",
    aceptoTerminos: false,
  });
  const [registroErrors, setRegistroErrors] = useState<
    Partial<Record<keyof CarritoRegisterSchemaType, string>>
  >({});

  // NUEVO: Errores de validación
  // const [errors, setErrors] = useState<Record<string, string>>({});

  const [loginData, setLoginData] = useState<LoginSchemaType>({
    email: "",
    password: "",
  });

  const resetLoginForm = () => {
    setLoginData({
      email: "",
      password: "",
    });
    setLoginErrors({});
  };

  const resetRegistroForm = () => {
    setRegistroData({
      nombre: "",
      apellido: "",
      tipoDocumento: "DNI",
      numeroDocumento: "",
      celular: "",
      telefonoOpcional: "",
      departamento: "Lima",
      provincia: "Lima",
      distrito: "",
      direccion: "",
      numeroDpto: "",
      referencia: "",
      email: "",
      password: "",
      confirmarPassword: "",
      aceptoTerminos: false,
    });
    setRegistroErrors({});
  };

  const [loginErrors, setLoginErrors] = useState<
    Partial<Record<keyof LoginSchemaType, string>>
  >({});

  // Automatic stock validation when dependencies change
  useEffect(() => {
    const triggerValidation = async () => {
      if (metodoEnvio === "retiro" && tiendaSeleccionada) {
        await performStockValidation([parseInt(tiendaSeleccionada)]);
      } else if (metodoEnvio === "delivery" && mapWarehouses.length > 0) {
        await performStockValidation(mapWarehouses.map((w) => w.idAlmacen));
      } else {
        setStockValidationResult(null);
      }
    };

    triggerValidation();
  }, [items, tiendaSeleccionada, metodoEnvio, mapWarehouses]);

  useEffect(() => {
    if (activeTab === "login") {
      resetLoginForm();
    } else {
      resetRegistroForm();
    }
  }, [activeTab]);

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    await updateQuantity(productId, newQuantity);
    // The useEffect will handle the re-validation when 'items' state updates
  };

  const handleCambiarARetiro = () => {
    setMetodoEnvio("retiro");
    setMostrarMapa(false);
    setTiendaSeleccionada(null);
    setDistritoSeleccionado("");
  };

  // Sync mapWarehouses with shipping district when in delivery mode
  useEffect(() => {
    const syncWarehouses = async () => {
      const currentDist =
        isLoggedIn || mainAddressId
          ? direccionEnvio.distrito
          : guestData.distrito;
      if (!currentDist || warehouseDistricts.length === 0) return;

      const district = warehouseDistricts.find(
        (d) => d.desDistrito.toLowerCase() === currentDist.toLowerCase(),
      );

      if (district) {
        try {
          const response = await getWarehouseMap(district.codUbigeoAlm);
          if (response.success) {
            setMapWarehouses(response.data);
          }
        } catch (error) {
          console.error("Error syncing delivery warehouses:", error);
        }
      }
    };

    if (metodoEnvio === "delivery") {
      syncWarehouses();
    }
  }, [
    metodoEnvio,
    direccionEnvio.distrito,
    guestData.distrito,
    warehouseDistricts,
    isLoggedIn,
    mainAddressId,
  ]);

  const handleSeleccionarDistrito = async (distrito: string) => {
    setDistritoSeleccionado(distrito);
    setMostrarMapa(true);
    setTiendaSeleccionada(null);
    setLoadingStores(true);

    try {
      // Find the codUbigeoAlm for the selected district
      const district = warehouseDistricts.find(
        (d) => d.desDistrito === distrito,
      );
      if (district) {
        console.log(
          `📍 Buscando almacenes para: ${distrito} (${district.codUbigeoAlm})`,
        );
        const response = await getWarehouseMap(district.codUbigeoAlm);
        if (response.success) {
          setMapWarehouses(response.data);
          // The useEffect will handle the re-validation when 'mapWarehouses' state updates
        }
      }
    } catch (error) {
      console.error("Error fetching map warehouses:", error);
    } finally {
      setLoadingStores(false);
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setLoginErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Manejador para Registro
  const handleRegistroChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    let { name, value, type } = e.target;

    // Manejo correcto de checkbox
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setRegistroData((prev) => ({ ...prev, [name]: checked }));
    } else {
      if (name === "numeroDocumento") {
        value = value.replace(/\D/g, "");
        const maxLength =
          registroData.tipoDocumento === "RUC"
            ? 11
            : registroData.tipoDocumento === "DNI"
              ? 8
              : 20;
        if (value.length > maxLength) value = value.slice(0, maxLength);
      }
      setRegistroData((prev) => ({ ...prev, [name]: value }));
    }

    setRegistroErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const showToastMessage = (message: string) => {
    showToast(
      message,
      message.toLowerCase().includes("error") ? "error" : "success",
    );
  };

  // NUEVO: Manejo de login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación con Zod
    const result = loginSchema.safeParse(loginData);

    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      const newErrors: Partial<Record<keyof LoginSchemaType, string>> = {};

      for (const key in formattedErrors) {
        const errorArray = formattedErrors[key as keyof typeof formattedErrors];
        if (errorArray && errorArray.length > 0) {
          newErrors[key as keyof LoginSchemaType] = errorArray[0];
        }
      }

      setLoginErrors(newErrors);
      return;
    }

    // Si es válido
    // Si es válido
    setLoginErrors({});

    // 🔹 Llamada REAL a la API
    const performLogin = async () => {
      setIsLoginLoading(true);
      try {
        await loginUser(loginData, { redirectTo: "/carrito" });

        // Login exitoso
        setIsLoggedIn(true);
        setShowLoginModal(false);
        // showToast("¡Bienvenido de vuelta!", "success"); // Toast eliminado por solicitud
      } catch (error: any) {
        console.error("Error en login:", error);
        setLoginErrors({
          password:
            error.message ||
            "Error al iniciar sesión. Verifica tus credenciales.",
        });
      } finally {
        setIsLoginLoading(false);
      }
    };

    performLogin();
  };

  // NUEVO: Manejo de registro
  const handleRegistro = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación con Zod
    const result = carritoRegisterSchema.safeParse(registroData);

    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      const newErrors: Partial<
        Record<keyof CarritoRegisterSchemaType, string>
      > = {};

      for (const key in formattedErrors) {
        const errorArray = formattedErrors[key as keyof typeof formattedErrors];
        if (errorArray && errorArray.length > 0) {
          newErrors[key as keyof CarritoRegisterSchemaType] = errorArray[0];
        }
      }

      setRegistroErrors(newErrors);
      console.log("Errores de validación:", newErrors);
      return;
    }

    // Si es válido
    // Si es válido
    setRegistroErrors({});
    console.log("Enviando registro...", registroData);

    const performRegister = async () => {
      try {
        await registerUser({
          firstName: registroData.nombre,
          lastName: registroData.apellido,
          email: registroData.email,
          confirmEmail: registroData.email, // Asumimos mismo email pues el form no tiene confirm
          password: registroData.password,
          confirmPassword: registroData.confirmarPassword,
          acceptTerms: registroData.aceptoTerminos,
          receiveOffers: false, // Default o agregar checkbox en UI
        });

        // Autologin after register or show success message
        setIsLoggedIn(true);
        setShowLoginModal(false);
        showToast("¡Cuenta creada exitosamente! Bienvenido.", "success");

        // Opcional: recargar para asegurar estado global limpio
        if (typeof window !== "undefined") window.location.reload();
      } catch (error: any) {
        console.error("Error en registro:", error);

        if (error.message?.includes("correo")) {
          setRegistroErrors({ email: error.message });
        } else {
          // Mostrar error general en algún campo o toast
          showToast(error.message || "Error al registrar usuario", "error");
        }
      }
    };

    performRegister();
  };

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    setShowGuestForm(true);
    setActiveTab("guest");
  };

  const handleGuestChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    let { name, value } = e.target;

    if (name === "numeroDocumento") {
      value = value.replace(/\D/g, "");
      const maxLength =
        guestData.tipoDocumento === "RUC"
          ? 11
          : guestData.tipoDocumento === "DNI"
            ? 8
            : 20;
      if (value.length > maxLength) value = value.slice(0, maxLength);
    }

    setGuestData((prev) => ({ ...prev, [name]: value }));
    setGuestErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación con Zod
    const result = guestDataSchema.safeParse(guestData);

    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      const newErrors: Partial<Record<keyof GuestDataSchemaType, string>> = {};

      for (const key in formattedErrors) {
        const errorArray = formattedErrors[key as keyof typeof formattedErrors];
        if (errorArray && errorArray.length > 0) {
          newErrors[key as keyof GuestDataSchemaType] = errorArray[0];
        }
      }

      setGuestErrors(newErrors);
      console.log("Errores de validación:", newErrors);
      return;
    }

    // Si es válido
    setGuestErrors({});
    console.log("Datos de invitado:", guestData);
    setIsGuest(true);
    setGuestDataCompleted(true);
    setShowLoginModal(false);
    setShowGuestForm(false);
    showToast("¡Datos guardados! Continúa con tu compra.", "success");
  };

  const performStockValidation = async (
    warehouses?: number[],
    products?: { reference: string; quantity: number }[],
  ) => {
    // Prepare products for validation using the literal reference field
    const productsToValidate =
      products ||
      items
        .filter((item) => item.product && item.product.reference)
        .map((item) => ({
          reference: item.product.reference as string,
          quantity: item.quantity,
        }));

    if (productsToValidate.length === 0) {
      return null;
    }

    // Determine warehouses to validate against
    let idAlmacenes = warehouses;
    if (!idAlmacenes) {
      if (metodoEnvio === "retiro") {
        if (!tiendaSeleccionada) return null;
        idAlmacenes = [parseInt(tiendaSeleccionada)];
      } else {
        if (mapWarehouses.length === 0) return null;
        idAlmacenes = mapWarehouses.map((w) => w.idAlmacen);
      }
    }

    setIsValidatingStock(true);
    setStockValidationResult(null);

    try {
      const result = await validateStock(idAlmacenes, productsToValidate);
      setStockValidationResult(result);
      return result;
    } catch (error: any) {
      console.error("Error validating stock:", error);
      showToast(error.message || "Error al validar stock", "error");
      return null;
    } finally {
      setIsValidatingStock(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (isGuest && !guestDataCompleted) {
      setShowLoginModal(true);
      return;
    }

    // If we already have a result and it's successful, we can just proceed
    // or we can re-validate once to be sure. The user said Finale is not the trigger.
    // However, we MUST ensure validation has passed.

    if (stockValidationResult?.success) {
      router.push("/checkout");
      return;
    }

    // If no result or failed result, try validating one last time
    const result = await performStockValidation();
    if (result?.success) {
      router.push("/checkout");
    } else if (result) {
      showToast("Algunos productos no tienen stock suficiente", "error");
    } else {
      showToast(
        "Por favor selecciona una ubicación de entrega válida",
        "error",
      );
    }
  };

  const subtotal = totals.subtotal;
  const envio = totals.shipping;
  const total = totals.total;

  // Calculate savings
  const totalSavings = items.reduce((acc, item) => {
    const price =
      typeof item.product.price === "number"
        ? item.product.price
        : parseFloat(item.product.price || "0");
    const originalPrice = item.product.originalPrice
      ? typeof item.product.originalPrice === "number"
        ? item.product.originalPrice
        : parseFloat(item.product.originalPrice)
      : price;

    if (originalPrice > price) {
      return acc + (originalPrice - price) * item.quantity;
    }
    return acc;
  }, 0);

  const infoTiendaSeleccionada = mapWarehouses.find(
    (w) => w.idAlmacen.toString() === tiendaSeleccionada,
  );

  if (items.length === 0) {
    return (
      <Layout
        title="Carrito - Liwilu"
        description="Tu carrito de compras"
        background={true}
      >
        <div className="max-w-7xl mx-auto px-6 py-16 my-32">
          <div className="text-center animate-fade-in">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-3xl font-semibold text-primary-dark mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-8">
              Agrega productos para comenzar tu compra
            </p>
            <Link
              href="/productos"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-full transition"
            >
              Ir a la tienda
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (cartExpired) {
    return (
      <Layout
        title="Sesión Expirada - Liwilu"
        description="Tu sesión de carrito ha expirado"
        background={true}
      >
        <div className="max-w-7xl mx-auto px-6 py-16 my-32">
          <div className="text-center animate-fade-in">
            <div className="mx-auto h-24 w-24 text-primary/40 mb-6 flex items-center justify-center">
              <FaRegClock size={80} />
            </div>
            <h2 className="text-3xl font-semibold text-primary-dark mb-4">
              Tu sesión ha expirado
            </h2>
            <p className="text-gray-600 mb-2 max-w-md mx-auto">
              Por tu seguridad, tu carrito de compras se ha limpiado
              automáticamente debido a inactividad.
            </p>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
              ¡No te preocupes! Puedes volver a agregar tus productos favoritos
              a la tienda.
            </p>
            <Link
              href="/productos"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-full transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSaveAddress = async () => {
    // Si no está autenticado o es invitado, solo actualiza el estado local
    if (!isAuthenticated || isGuest) {
      setEditandoDireccion(false);
      return;
    }

    // Si está autenticado, intentar actualizar/crear en el backend
    try {
      // Validar datos con Zod
      const addressSchema = z.object({
        calle: z.string().min(5, "La dirección es muy corta"),
        departamento: z.string().min(1, "Selecciona un departamento"),
        ciudad: z.string().min(1, "Selecciona una provincia"),
        distrito: z.string().min(1, "Selecciona un distrito"),
      });

      const validationResult = addressSchema.safeParse(direccionEnvio);

      if (!validationResult.success) {
        const fieldErrors = validationResult.error.flatten().fieldErrors;
        const errors: Record<string, string> = {};
        Object.keys(fieldErrors).forEach((key) => {
          const messages = fieldErrors[key as keyof typeof fieldErrors];
          if (messages && messages.length > 0) {
            errors[key] = messages[0];
          }
        });
        setAddressErrors(errors);
        return;
      }

      // Limpiar errores si pasa validación
      setAddressErrors({});

      const token = localStorage.getItem("accessToken");

      // Check if we're editing the main address
      const isEditingMainAddress =
        mainAddressId &&
        userAddresses.find((addr) => addr.id === mainAddressId)?.isMain;

      const addressData = {
        department: direccionEnvio.departamento,
        province: direccionEnvio.ciudad,
        district: direccionEnvio.distrito,
        address: direccionEnvio.calle,
        apartment: "Dirección Carrito", // Valor por defecto
        reference: "",
        isMain: isEditingMainAddress || false, // Preservar isMain si es la dirección principal
      };

      let response;

      if (mainAddressId) {
        // Actualizar existente
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/addresses/${mainAddressId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(addressData),
          },
        );
      } else {
        // Crear nueva
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/addresses`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(addressData),
          },
        );
      }

      if (response && response.ok) {
        const result = await response.json();
        console.log("Dirección guardada correctamente");

        // Refresh addresses
        const refreshedResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/addresses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (refreshedResponse.ok) {
          const refreshedResult = await refreshedResponse.json();
          if (refreshedResult.success) {
            setUserAddresses(refreshedResult.data);
            // Update mainAddressId to the saved/created address
            if (result.data?.id) {
              setMainAddressId(result.data.id);
            }
          }
        }

        setEditandoDireccion(false);
      } else {
        console.error("Error al guardar dirección en backend");
        showToast("Error al guardar la dirección", "error");
      }
    } catch (error) {
      console.error("Error al guardar dirección:", error);
    }
  };

  return (
    <Layout
      title="Carrito - Liwilu"
      description="Tu carrito de compras"
      background={true}
    >
      {/* MODAL MEJORADO DE LOGIN/REGISTRO */}
      {showLoginModal && items.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            {/* BOTÓN CERRAR */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute -top-2 -right-2 md:top-4 md:right-4 p-2 bg-white rounded-full shadow-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all z-10 border border-gray-100"
              aria-label="Cerrar modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="p-8">
              {/* TAB DE LOGIN */}
              {activeTab === "login" && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                    ¡Bienvenido de vuelta!
                  </h2>
                  <p className="text-gray-600 text-center mb-6">
                    Carrito:{" "}
                    <span className="font-semibold">
                      {items.length} productos
                    </span>
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        name="email" // ✅ Agregar name
                        value={loginData.email}
                        onChange={handleLoginChange} // ✅ Cambiar a handleLoginChange
                        placeholder="ejemplo@correo.com"
                        className={`w-full px-4 py-3 border-2 rounded-sm transition ${
                          loginErrors.email
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                      />
                      {loginErrors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <PiWarningCircleFill size={16} /> {loginErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        name="password" // ✅ Agregar name
                        value={loginData.password}
                        onChange={handleLoginChange} // ✅ Cambiar a handleLoginChange
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 border-2 rounded-sm transition ${
                          loginErrors.password
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                      />
                      {loginErrors.password && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <PiWarningCircleFill size={16} />{" "}
                          {loginErrors.password}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={recordarme}
                          onChange={(e) => setRecordarme(e.target.checked)}
                          className="mt-1 mr-2"
                        />
                        <span className="text-gray-600">Recordarme</span>
                      </label>
                      <Link
                        href="/recuperar-password"
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      className="w-full flex justify-center items-center gap-2"
                      onClick={handleLogin}
                      disabled={isLoginLoading}
                    >
                      {isLoginLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Iniciar Sesión"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full"
                      onClick={handleContinueAsGuest}
                    >
                      Continuar como invitado
                    </Button>

                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-600">
                        ¿Aún no tienes cuenta?{" "}
                        <button
                          onClick={() => setActiveTab("registro")}
                          className="text-primary hover:text-primary-dark font-semibold transition-all"
                        >
                          Regístrate aquí
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB DE REGISTRO */}
              {activeTab === "registro" && (
                <div className="animate-fade-in max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                    Crea tu cuenta
                  </h2>
                  <p className="text-gray-600 text-center mb-6">
                    Completa tus datos para continuar
                  </p>

                  <div className="space-y-4">
                    {/* Datos Personales */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          name="nombre" // ✅ Agregar
                          value={registroData.nombre}
                          onChange={handleRegistroChange} // ✅ Cambiar
                          placeholder="Gonzalo"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            registroErrors.nombre
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {registroErrors.nombre && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {registroErrors.nombre}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          name="apellido" // ✅ Agregar
                          value={registroData.apellido}
                          onChange={handleRegistroChange} // ✅ Cambiar
                          placeholder="Vera"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            registroErrors.apellido
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {registroErrors.apellido && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {registroErrors.apellido}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Documento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de documento *
                      </label>
                      <select
                        name="tipoDocumento" // ✅ Agregar name
                        value={registroData.tipoDocumento}
                        onChange={(e) =>
                          setRegistroData({
                            ...registroData,
                            tipoDocumento: e.target.value as
                              | "DNI"
                              | "RUC"
                              | "CE"
                              | "Pasaporte", // ✅ Type assertion
                          })
                        }
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                          registroErrors.tipoDocumento
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                      >
                        <option value="DNI">DNI</option>
                        <option value="RUC">RUC</option>
                        <option value="CE">Carnet de Extranjería</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </select>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de documento *
                        </label>
                        <input
                          type="text"
                          name="numeroDocumento"
                          value={registroData.numeroDocumento}
                          onChange={handleRegistroChange}
                          placeholder="12345678"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            registroErrors.numeroDocumento
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {registroErrors.numeroDocumento && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {registroErrors.numeroDocumento}
                          </p>
                        )}
                      </div>
                      {registroErrors.tipoDocumento && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <PiWarningCircleFill size={16} />{" "}
                          {registroErrors.tipoDocumento}
                        </p>
                      )}
                    </div>

                    {/* Teléfonos */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Celular *
                        </label>
                        <input
                          type="tel"
                          name="celular"
                          value={registroData.celular}
                          onChange={handleRegistroChange}
                          placeholder="973 820 088"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            registroErrors.celular
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {registroErrors.celular && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {registroErrors.celular}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono opcional
                        </label>
                        <input
                          type="tel"
                          name="telefonoOpcional"
                          value={registroData.telefonoOpcional}
                          onChange={handleRegistroChange}
                          placeholder="973 820 088"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            registroErrors.telefonoOpcional
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {registroErrors.telefonoOpcional && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {registroErrors.telefonoOpcional}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Ubicación */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Departamento *
                        </label>
                        <input
                          type="text"
                          value={registroData.departamento}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-sm bg-gray-50"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Provincia *
                        </label>
                        <input
                          type="text"
                          name="provincia"
                          value={registroData.provincia}
                          onChange={handleRegistroChange}
                          placeholder="Lima"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            registroErrors.provincia
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {registroErrors.provincia && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {registroErrors.provincia}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distrito *
                      </label>
                      <select
                        name="distrito"
                        value={registroData.distrito}
                        onChange={handleRegistroChange}
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                          registroErrors.distrito
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                      >
                        <option value="">Seleccionar distrito</option>
                        {warehouseDistricts.map((d) => (
                          <option key={d.codUbigeoAlm} value={d.desDistrito}>
                            {d.desDistrito}
                          </option>
                        ))}
                      </select>
                      {registroErrors.distrito && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <PiWarningCircleFill size={16} />{" "}
                          {registroErrors.distrito}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección *
                      </label>
                      <input
                        type="text"
                        name="direccion"
                        value={registroData.direccion}
                        onChange={handleRegistroChange}
                        placeholder="Calle rosales 432"
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                          registroErrors.direccion
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                      />
                      {registroErrors.direccion && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <PiWarningCircleFill size={16} />{" "}
                          {registroErrors.direccion}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nro. de dpto. / Piso
                        </label>
                        <input
                          type="text"
                          name="numeroDpto"
                          value={registroData.numeroDpto}
                          onChange={handleRegistroChange}
                          placeholder="201"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            registroErrors.numeroDpto
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {registroErrors.numeroDpto && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {registroErrors.numeroDpto}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Referencia
                        </label>
                        <input
                          type="text"
                          name="referencia"
                          value={registroData.referencia}
                          onChange={handleRegistroChange}
                          placeholder="Frente al parque"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            registroErrors.referencia
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {registroErrors.referencia && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {registroErrors.referencia}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Credenciales */}
                    <div className="pt-4 border-t">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correo electrónico *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={registroData.email}
                          onChange={handleRegistroChange}
                          placeholder="ejemplo@correo.com"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            registroErrors.email
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {registroErrors.email && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {registroErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña *
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={registroData.password}
                            onChange={handleRegistroChange}
                            placeholder="••••••••"
                            className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                              registroErrors.password
                                ? "border-red-500"
                                : "border-gray-200"
                            }`}
                          />
                          {registroErrors.password && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <PiWarningCircleFill size={16} />{" "}
                              {registroErrors.password}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar contraseña *
                          </label>
                          <input
                            type="password"
                            name="confirmarPassword"
                            value={registroData.confirmarPassword}
                            onChange={handleRegistroChange}
                            placeholder="••••••••"
                            className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                              registroErrors.confirmarPassword
                                ? "border-red-500"
                                : "border-gray-200"
                            }`}
                          />
                          {registroErrors.confirmarPassword && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <PiWarningCircleFill size={16} />{" "}
                              {registroErrors.confirmarPassword}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start pt-2">
                      <input
                        type="checkbox"
                        name="aceptoTerminos"
                        checked={registroData.aceptoTerminos}
                        onChange={handleRegistroChange}
                        className="mt-1 mr-2"
                      />
                      <label className="text-xs text-gray-600">
                        Acepto los{" "}
                        <Link
                          href="/terminos"
                          className="text-primary hover:underline"
                        >
                          términos y condiciones
                        </Link>{" "}
                        y las{" "}
                        <Link
                          href="/privacidad"
                          className="text-primary hover:underline"
                        >
                          políticas de privacidad
                        </Link>
                      </label>
                    </div>
                    {registroErrors.aceptoTerminos && (
                      <p className="text-red-500 text-xs mt-0 flex items-center gap-1">
                        <PiWarningCircleFill size={16} />{" "}
                        {registroErrors.aceptoTerminos}
                      </p>
                    )}

                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      onClick={handleRegistro}
                    >
                      Crear cuenta
                    </Button>

                    <Button
                      variant="outline"
                      size="md"
                      className="w-full"
                      onClick={handleContinueAsGuest}
                    >
                      Continuar como invitado
                    </Button>

                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-600">
                        ¿Ya tienes cuenta?{" "}
                        <button
                          onClick={() => setActiveTab("login")}
                          className="text-primary hover:text-primary-dark font-semibold transition-all"
                        >
                          Inicia sesión aquí
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB DE INVITADO */}
              {activeTab === "guest" && (
                <div className="animate-fade-in max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                    Ingresa tus datos
                  </h2>
                  <p className="text-gray-600 text-center mb-6">
                    Completa tus datos para continuar con tu compra
                  </p>

                  <form onSubmit={handleGuestSubmit} className="space-y-4">
                    {/* Datos Personales */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={guestData.nombre}
                          onChange={handleGuestChange}
                          placeholder="Gonzalo"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            guestErrors.nombre
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {guestErrors.nombre && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {guestErrors.nombre}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apellido
                        </label>
                        <input
                          type="text"
                          name="apellido"
                          value={guestData.apellido}
                          onChange={handleGuestChange}
                          placeholder="Vera"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            guestErrors.apellido
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {guestErrors.apellido && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {guestErrors.apellido}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Documento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de documento
                      </label>
                      <select
                        name="tipoDocumento"
                        value={guestData.tipoDocumento}
                        onChange={(e) =>
                          setGuestData({
                            ...guestData,
                            tipoDocumento: e.target.value as
                              | "DNI"
                              | "RUC"
                              | "CE"
                              | "Pasaporte",
                          })
                        }
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                          guestErrors.tipoDocumento
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                      >
                        <option value="DNI">DNI</option>
                        <option value="RUC">RUC</option>
                        <option value="CE">Carnet de Extranjería</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Documento
                      </label>
                      <input
                        type="text"
                        name="numeroDocumento"
                        value={guestData.numeroDocumento}
                        onChange={handleGuestChange}
                        placeholder="74218601"
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                          guestErrors.numeroDocumento
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                      />
                      {guestErrors.numeroDocumento && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <PiWarningCircleFill size={16} />{" "}
                          {guestErrors.numeroDocumento}
                        </p>
                      )}
                    </div>

                    {/* Teléfonos */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Celular
                        </label>
                        <input
                          type="tel"
                          name="celular"
                          value={guestData.celular}
                          onChange={handleGuestChange}
                          placeholder="973 820 088"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            guestErrors.celular
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {guestErrors.celular && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {guestErrors.celular}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono opcional
                        </label>
                        <input
                          type="tel"
                          name="telefonoOpcional"
                          value={guestData.telefonoOpcional}
                          onChange={handleGuestChange}
                          placeholder="973 820 088"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            guestErrors.telefonoOpcional
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Ubicación */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Departamento
                        </label>
                        <select
                          name="departamento"
                          value={guestData.departamento}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGuestData((prev) => ({
                              ...prev,
                              departamento: val,
                              provincia: "",
                              distrito: "",
                            }));
                            guestLocations.handleDeptChange(val);
                          }}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-sm bg-white"
                        >
                          <option value="">Seleccionar</option>
                          {guestLocations.departments.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Provincia
                        </label>
                        <select
                          name="provincia"
                          value={guestData.provincia}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGuestData((prev) => ({
                              ...prev,
                              provincia: val,
                              distrito: "",
                            }));
                            guestLocations.handleProvChange(val);
                          }}
                          className={`w-full px-4 py-2.5 border-2 rounded-sm bg-white transition ${
                            guestErrors.provincia
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                          disabled={!guestData.departamento}
                        >
                          <option value="">Seleccionar</option>
                          {guestLocations.provinces.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        {guestErrors.provincia && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <PiWarningCircleFill size={16} />{" "}
                            {guestErrors.provincia}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distrito
                      </label>
                      <select
                        name="distrito"
                        value={guestData.distrito}
                        onChange={(e) => {
                          handleGuestChange(e);
                          guestLocations.handleDistChange(e.target.value);
                        }}
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                          guestErrors.distrito
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                        disabled={!guestData.provincia}
                      >
                        <option value="">Seleccionar</option>
                        {guestLocations.districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      {guestErrors.distrito && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <PiWarningCircleFill size={16} />{" "}
                          {guestErrors.distrito}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                      </label>
                      <input
                        type="text"
                        name="direccion"
                        value={guestData.direccion}
                        onChange={handleGuestChange}
                        placeholder="Calle rosales 432"
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                          guestErrors.direccion
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                      />
                      {guestErrors.direccion && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <PiWarningCircleFill size={16} />{" "}
                          {guestErrors.direccion}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nro. de dpto. / Piso
                        </label>
                        <input
                          type="text"
                          name="numeroDpto"
                          value={guestData.numeroDpto}
                          onChange={handleGuestChange}
                          placeholder="Ate"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            guestErrors.numeroDpto
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Referencia
                        </label>
                        <input
                          type="text"
                          name="referencia"
                          value={guestData.referencia}
                          onChange={handleGuestChange}
                          placeholder="Ate"
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                            guestErrors.referencia
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      type="submit"
                    >
                      Siguiente
                    </Button>

                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-600">
                        ¿Ya tienes cuenta?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("login")}
                          className="text-primary hover:text-primary-dark font-semibold transition-all"
                        >
                          Inicia sesión aquí
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="md:text-3xl text-2xl font-semibold animate-fade-in">
              Carrito de compras{" "}
              <span className="text-gray-500 md:text-xl text-lg md:inline-block block">
                ({items.length} productos)
              </span>
            </h1>
            {(isLoggedIn || isGuest) && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                <span>Mi Cuenta</span>
              </div>
            )}
          </div>
          {/* <Link href="/productos" className="text-sm text-gray-600 hover:text-primary">← Seguir comprando</Link> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Método de envío */}
            <div className="bg-white rounded-sm shadow-md p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">
                Selecciona tu método de entrega
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingCarriers ? (
                  <div className="col-span-2 py-8 flex flex-col items-center justify-center bg-gray-50 rounded-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Cargando métodos de envío...
                    </p>
                  </div>
                ) : carriers.length > 0 ? (
                  carriers.map((carrier) => {
                    const isRetiro = carrier.name
                      .toLowerCase()
                      .includes("retiro");
                    const isSelected = selectedCarrier?.id === carrier.id;

                    return (
                      <button
                        key={carrier.id}
                        onClick={() => {
                          setSelectedCarrier(carrier);
                          updateCarrier(carrier.id);
                          if (isRetiro) {
                            handleCambiarARetiro();
                          } else {
                            setMetodoEnvio("delivery");
                          }
                        }}
                        className={`flex items-center gap-3 p-4 rounded-sm border-2 transition-all duration-300 transform hover:scale-105 ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                      >
                        {isRetiro ? (
                          <FaStore
                            className={`text-2xl ${
                              isSelected ? "text-primary" : "text-gray-400"
                            }`}
                          />
                        ) : (
                          <FaTruck
                            className={`text-2xl ${
                              isSelected ? "text-primary" : "text-gray-400"
                            }`}
                          />
                        )}
                        <div className="text-left">
                          <p className="font-semibold">{carrier.name}</p>
                          <p className="text-xs text-gray-500">
                            {carrier.shippingCost === 0
                              ? "Gratis"
                              : carrier.delay || "Disponible"}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-4 text-center text-gray-500 bg-gray-50 rounded-sm">
                    No hay métodos de envío disponibles.
                  </div>
                )}
              </div>

              {metodoEnvio === "delivery" && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <div className="p-4 bg-blue-50 rounded-sm">
                    <p className="text-sm text-gray-700">
                      📦{" "}
                      {selectedCarrier?.delay ||
                        "El envío se realizará en el transcurso de unos días hábiles."}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-2">
                      Costo:{" "}
                      {envio === 0 ? "Gratis" : formatPrice(envio.toString())}
                    </p>
                  </div>

                  {/* Dirección de envío */}
                  <div className="border-2 border-gray-200 rounded-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        Dirección de envío
                      </h3>
                      {!editandoDireccion &&
                        !(isLoggedIn && userAddresses.length === 0) &&
                        !(
                          isLoggedIn &&
                          !mainAddressId &&
                          userAddresses.length > 0
                        ) && (
                          <button
                            onClick={() =>
                              setEditandoDireccion(!editandoDireccion)
                            }
                            className="text-primary text-sm hover:text-primary-dark flex items-center gap-1"
                          >
                            <FaPencil className="text-sm" /> Editar
                          </button>
                        )}
                    </div>

                    {editandoDireccion ||
                    (isLoggedIn && userAddresses.length === 0) ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={direccionEnvio.calle}
                          onChange={(e) =>
                            setDireccionEnvio({
                              ...direccionEnvio,
                              calle: e.target.value,
                            })
                          }
                          placeholder="Calle y número"
                          className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={direccionEnvio.departamento}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDireccionEnvio({
                                ...direccionEnvio,
                                departamento: val,
                                ciudad: "",
                                distrito: "",
                              });
                              userLocations.handleDeptChange(val);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                          >
                            <option value="">Departamento</option>
                            {userLocations.departments.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>

                          <select
                            value={direccionEnvio.ciudad}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDireccionEnvio({
                                ...direccionEnvio,
                                ciudad: val,
                                distrito: "",
                              });
                              userLocations.handleProvChange(val);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                            disabled={!direccionEnvio.departamento}
                          >
                            <option value="">Provincia</option>
                            {userLocations.provinces.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        <select
                          value={direccionEnvio.distrito}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDireccionEnvio({
                              ...direccionEnvio,
                              distrito: val,
                            });
                            userLocations.handleDistChange(val);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                          disabled={!direccionEnvio.ciudad}
                        >
                          <option value="">Distrito</option>
                          {userLocations.districts.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleSaveAddress}
                          className="w-full bg-primary text-white py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition"
                        >
                          Guardar dirección
                        </button>
                      </div>
                    ) : isLoggedIn &&
                      !mainAddressId &&
                      userAddresses.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 mb-2">
                          Selecciona una de tus direcciones:
                        </p>
                        <select
                          onChange={async (e) => {
                            const addrId = e.target.value;
                            const selected = userAddresses.find(
                              (a) => a.id.toString() === addrId,
                            );
                            if (selected) {
                              setMainAddressId(selected.id);
                              setDireccionEnvio({
                                calle: selected.address,
                                distrito: selected.district,
                                ciudad: selected.province,
                                departamento: selected.department,
                              });
                              userLocations.setLocationValues(
                                selected.department,
                                selected.province,
                                selected.district,
                              );
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                          <option value="">Seleccionar dirección...</option>
                          {userAddresses.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                              {addr.address}, {addr.district}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setEditandoDireccion(true)}
                          className="text-primary text-xs font-medium hover:underline"
                        >
                          + Agregar nueva dirección
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-700">
                          <p className="font-medium">{direccionEnvio.calle}</p>
                          <p>
                            {direccionEnvio.distrito}, {direccionEnvio.ciudad},{" "}
                            {direccionEnvio.departamento}
                          </p>
                        </div>
                        {isLoggedIn && userAddresses.length > 1 && (
                          <button
                            onClick={() => setMainAddressId(null)}
                            className="text-primary text-xs font-medium hover:underline"
                          >
                            Elegir otra dirección
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {metodoEnvio === "retiro" && !distritoSeleccionado && (
                <div className="mt-4 animate-fade-in">
                  <p className="text-sm text-gray-700 mb-3">
                    Selecciona el distrito para consultar los puntos de retiro
                    disponibles
                  </p>
                  <select
                    value={distritoSeleccionado}
                    onChange={(e) => handleSeleccionarDistrito(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  >
                    <option value="">Seleccionar distrito</option>
                    {warehouseDistricts.map((district) => (
                      <option
                        key={district.codUbigeoAlm}
                        value={district.desDistrito}
                      >
                        {district.desDistrito}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Mapa y tiendas disponibles */}
            {metodoEnvio === "retiro" && mostrarMapa && (
              <div className="bg-white rounded-sm shadow-md p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">
                    Puntos de retiro más cercanos
                  </h2>
                  <button
                    onClick={() => {
                      setDistritoSeleccionado("");
                      setMostrarMapa(false);
                    }}
                    className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                  >
                    <FaPencil className="text-sm" /> Editar
                  </button>
                </div>

                <div className="mb-4 p-3 bg-gray-100 rounded-sm">
                  <p className="text-sm text-gray-700">
                    <strong>Distrito:</strong> {distritoSeleccionado}
                  </p>
                </div>

                {/* Mapa Interactivo */}
                <div className="relative h-96 bg-gray-100 rounded-sm mb-6 overflow-hidden border">
                  <WarehouseMap
                    warehouses={mapWarehouses}
                    center={
                      mapWarehouses.find(
                        (w) => w.idAlmacen.toString() === tiendaSeleccionada,
                      )
                        ? [
                            mapWarehouses.find(
                              (w) =>
                                w.idAlmacen.toString() === tiendaSeleccionada,
                            )!.latitud,
                            mapWarehouses.find(
                              (w) =>
                                w.idAlmacen.toString() === tiendaSeleccionada,
                            )!.longitud,
                          ]
                        : undefined
                    }
                  />
                </div>

                {/* Lista de tiendas */}
                {loadingStores ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Cargando tiendas disponibles...
                    </p>
                  </div>
                ) : mapWarehouses.length === 0 ? (
                  <div className="text-center py-8 bg-amber-50 rounded-sm">
                    <FaTimesCircle className="text-amber-500 text-4xl mx-auto mb-3" />
                    <p className="text-amber-800 font-semibold">
                      No hay tiendas disponibles en este distrito
                    </p>
                    <p className="text-sm text-amber-700 mt-2">
                      Intenta con otro distrito cercano
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mapWarehouses.map((tienda) => {
                      const warehouseResult =
                        stockValidationResult?.resultadosPorAlmacen.find(
                          (w) => w.idAlmacen === tienda.idAlmacen,
                        );
                      const isAvailable = warehouseResult
                        ? warehouseResult.todosDisponibles
                        : true;

                      return (
                        <div
                          key={tienda.idAlmacen}
                          className={`p-4 rounded-sm border-2 transition-all cursor-pointer ${
                            tiendaSeleccionada === tienda.idAlmacen.toString()
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-primary/50"
                          }`}
                          onClick={() =>
                            setTiendaSeleccionada(tienda.idAlmacen.toString())
                          }
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {tienda.desAlmacen}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Ubigeo: {tienda.codUbigeoAlm}
                              </p>
                            </div>
                            <div className="ml-4">
                              {tiendaSeleccionada ===
                                tienda.idAlmacen.toString() && (
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                  <FaCheck className="text-white text-xs" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Disponibilidad de productos */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            {isAvailable ? (
                              <p className="text-xs font-semibold text-green-700">
                                ✓ Disponible para recojo en tienda
                              </p>
                            ) : (
                              <p className="text-xs font-semibold text-red-600">
                                ✕ No hay stock suficiente en esta tienda
                              </p>
                            )}
                          </div>

                          {!isAvailable && warehouseResult && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-[10px] text-red-800">
                              <p className="font-bold mb-1">
                                Productos sin stock:
                              </p>
                              <ul className="list-disc pl-3">
                                {warehouseResult.productos
                                  .filter((p) => !p.disponible)
                                  .map((p, i) => (
                                    <li key={i}>
                                      {p.nomArticulo}: {p.mensaje}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Productos en el carrito */}
            <div className="space-y-4">
              {(() => {
                const validItems = items.filter(
                  (item) => item.product && item.product.id != null,
                );
                const invalidItems = items.filter(
                  (item) => !item.product || item.product.id == null,
                );

                return (
                  <>
                    {invalidItems.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-sm p-4 mb-4">
                        <h3 className="text-red-800 font-semibold mb-2">
                          Hay {invalidItems.length} producto(s) con datos
                          erróneos
                        </h3>
                        <p className="text-red-600 text-sm mb-3">
                          Estos productos no se pueden mostrar correctamente. Te
                          recomendamos vaciar el carrito para corregirlo.
                        </p>
                        <button
                          onClick={clearCart}
                          className="text-red-700 underline text-sm hover:text-red-900"
                        >
                          Vaciar carrito completo
                        </button>
                      </div>
                    )}

                    {validItems.map((item, index) => {
                      // Prioritize the direct coverImage property if available (new logic)
                      // Otherwise fall back to associations (legacy logic)
                      let imageUrl = item.product.coverImage;

                      if (!imageUrl) {
                        const imageId =
                          item.product.associations?.images?.[0]?.id;
                        if (imageId) {
                          imageUrl = getProductImageUrl(
                            item.product.id.toString(),
                            imageId,
                          );
                        } else {
                          imageUrl = "/images/placeholder-product.jpg"; // Use consistent placeholder
                        }
                      }

                      const precioUnitario =
                        typeof item.product.price === "number"
                          ? item.product.price
                          : parseFloat(item.product.price || "0");
                      const precioTotal = precioUnitario * item.quantity;

                      return (
                        <div
                          key={item.product.id}
                          className="bg-white rounded-sm shadow-md p-6 flex gap-4 animate-fade-in-up"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div>
                            <FaCheckCircle size={25} className="text-primary" />
                          </div>

                          <div className="w-full">
                            {metodoEnvio === "retiro" &&
                              tiendaSeleccionada &&
                              infoTiendaSeleccionada && (
                                <div className="w-full mb-5">
                                  <div className="flex items-center gap-4 mb-3">
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
                                        Ubigeo:{" "}
                                        {infoTiendaSeleccionada.codUbigeoAlm}
                                      </p>
                                      <div className="flex items-center gap-4">
                                        {(() => {
                                          const isAvailable =
                                            stockValidationResult?.resultadosPorAlmacen
                                              .find(
                                                (w) =>
                                                  w.idAlmacen.toString() ===
                                                  tiendaSeleccionada,
                                              )
                                              ?.productos.find(
                                                (p) =>
                                                  p.reference ===
                                                  item.product.reference,
                                              )?.disponible !== false;

                                          return isAvailable ? (
                                            <span className="text-primary inline-flex gap-1 items-center">
                                              <FaRegClock size={15} />{" "}
                                              Disponible para recojo
                                            </span>
                                          ) : (
                                            <span className="text-red-500 inline-flex gap-1 items-center font-semibold">
                                              <FaTimesCircle size={15} /> No hay
                                              stock
                                            </span>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                    <div className="font-semibold text-green-600">
                                      GRATIS
                                    </div>
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
                                    href={`/tienda/${
                                      item.product.id || item.product.productId
                                    }`}
                                  >
                                    <h3 className="font-semibold text-lg mb-1 hover:text-primary transition">
                                      {getProductName(item.product)}
                                    </h3>
                                  </Link>

                                  {/* Error de Stock Inline */}
                                  {(() => {
                                    if (!stockValidationResult) return null;

                                    let productIssue = null;
                                    if (metodoEnvio === "retiro") {
                                      const selectedWh =
                                        stockValidationResult.resultadosPorAlmacen.find(
                                          (w) =>
                                            w.idAlmacen.toString() ===
                                            tiendaSeleccionada,
                                        );
                                      productIssue = selectedWh?.productos.find(
                                        (p) =>
                                          p.reference ===
                                            item.product.reference &&
                                          !p.disponible,
                                      );
                                    } else {
                                      // Para delivery, si success es false, buscamos si este producto falla en TODOS los almacenes
                                      // o simplemente mostramos si hay algún problema con él
                                      const allFailed =
                                        stockValidationResult.resultadosPorAlmacen.every(
                                          (w) =>
                                            w.productos.find(
                                              (p) =>
                                                p.reference ===
                                                  item.product.reference &&
                                                !p.disponible,
                                            ),
                                        );
                                      if (allFailed) {
                                        productIssue =
                                          stockValidationResult.resultadosPorAlmacen[0]?.productos.find(
                                            (p) =>
                                              p.reference ===
                                              item.product.reference,
                                          );
                                      }
                                    }

                                    if (productIssue) {
                                      return (
                                        <div className="flex items-center gap-1.5 text-red-600 font-medium text-xs mb-2">
                                          <FaTimesCircle className="shrink-0" />
                                          <span>{productIssue.mensaje}</span>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                  <div className="space-y-1 mb-4">
                                    <p className="text-gray-600 text-xs font-mono">
                                      ID del artículo: {item.product.id}
                                    </p>
                                    <p className="text-gray-600 text-xs font-mono">
                                      Prestashop ID:{" "}
                                      {item.product.productId ||
                                        item.product.id ||
                                        "null"}
                                    </p>
                                    <p className="text-gray-600 text-xs font-mono">
                                      Reference:{" "}
                                      {item.product.reference || "null"}
                                    </p>
                                    <p className="text-gray-600 text-xs font-mono">
                                      SKU: {item.product.sku || "null"}
                                    </p>
                                    <p className="text-gray-600 text-xs font-mono">
                                      Combination ID:{" "}
                                      {item.product.prestashopCombinationId ??
                                        "null"}
                                    </p>
                                  </div>

                                  <button
                                    onClick={() =>
                                      removeFromCart(item.product.id.toString())
                                    }
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
                                        handleUpdateQuantity(
                                          item.product.id.toString(),
                                          item.quantity - 1,
                                        )
                                      }
                                      className="px-3 py-1 hover:bg-gray-100 transition"
                                    >
                                      -
                                    </button>

                                    <span className="px-4 py-1 border-x">
                                      {item.quantity}
                                    </span>

                                    <button
                                      onClick={() =>
                                        handleUpdateQuantity(
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
                                    {item.product.originalPrice &&
                                      parseFloat(
                                        item.product.originalPrice.toString(),
                                      ) > precioUnitario && (
                                        <p className="text-sm text-gray-400 line-through">
                                          {formatPrice(
                                            item.product.originalPrice.toString(),
                                          )}
                                        </p>
                                      )}

                                    <p className="text-2xl font-semibold text-primary-dark">
                                      {formatPrice(precioTotal.toString())}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                      {formatPrice(precioUnitario.toString())}{" "}
                                      c/u
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}

              <button
                onClick={() => {
                  if (window.confirm("¿Estás seguro de vaciar el carrito?")) {
                    clearCart();
                  }
                }}
                className="text-gray-600 hover:text-red-600 text-sm font-medium transition flex gap-2"
              >
                <FaRegTrashAlt size={18} /> Vaciar carrito
              </button>
            </div>
            <div className="bg-white rounded-sm shadow-md p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-2 text-primary-dark">
                Persona autorizada a retirar
              </h2>
              <div className="">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-dark text-sm space-y-1">
                    <p>Nombre: Gonzalo Vera </p>
                    <p>DNI: 70255456</p>
                  </div>
                  <button
                    onClick={() => router.push("/autorizacion")}
                    className="text-primary text-sm hover:text-primary-dark flex items-center gap-1"
                  >
                    <FaPencil className="text-sm" /> Editar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Checkout */}
          <div className="lg:col-span-1 z-10 space-y-6">
            {/* === SECCIÓN CUPÓN === */}
            <div className="bg-white rounded-sm shadow-lg p-6 animate-fade-in">
              <h3 className="text-lg font-semibold mb-4">Código de cupón</h3>

              <div className="flex flex-col sm:flex-row md:gap-0 gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Ingresa tu cupón"
                  className="w-full px-4 py-2 border border-gray-300 rounded-full md:rounded-r-none md:rounded-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />

                <button className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2 md:rounded-l-none rounded-full md:rounded-sm border border-primary transition-colors">
                  Aplicar
                </button>
              </div>
            </div>

            {/* === SECCIÓN RESUMEN === */}
            <div className="bg-white rounded-sm shadow-lg p-6 lg:sticky lg:top-32 animate-fade-in">
              <h2 className="text-xl font-semibold mb-6">Resumen del pedido</h2>

              {/* Detalle */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    {formatPrice(subtotal.toString())}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-600 animate-pulse">
                    <span>Ahorro total</span>
                    <span className="font-bold">
                      -{formatPrice(totalSavings.toString())}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Envío ({selectedCarrier?.name || "Pendiente"})</span>
                  <span className="font-semibold">
                    {envio === 0 ? (
                      <span className="text-green-600">Gratis ✓</span>
                    ) : (
                      formatPrice(envio.toString())
                    )}
                  </span>
                </div>

                {metodoEnvio === "delivery" && selectedCarrier?.isFree && (
                  <p className="text-xs text-green-600 font-medium">
                    ¡Este método de envío es gratuito!
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between text-2xl font-semibold mb-6">
                <span>Total</span>
                <span className="text-primary">
                  {formatPrice(total.toString())}
                </span>
              </div>

              {/* Términos */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Acepto los{" "}
                    <Link
                      href="/estaticas/terminos-y-condiciones"
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      Términos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link
                      href="/estaticas/politicas"
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      Política de Privacidad
                    </Link>
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="acceptNewsletter"
                    checked={acceptNewsletter}
                    onChange={(e) => setAcceptNewsletter(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <label
                    htmlFor="acceptNewsletter"
                    className="text-sm text-gray-500 cursor-pointer"
                  >
                    Quiero recibir ofertas y beneficios exclusivos
                  </label>
                </div>
              </div>

              {/* CTA */}
              <Button
                variant="primary"
                size="md"
                className="w-full mb-3 flex justify-center items-center gap-2"
                disabled={
                  (!isLoggedIn && !isGuest) ||
                  !acceptTerms ||
                  (metodoEnvio === "retiro" && !tiendaSeleccionada) ||
                  isValidatingStock
                }
                onClick={handleCheckoutSubmit}
              >
                {isValidatingStock ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Validando stock...
                  </>
                ) : !isLoggedIn && !isGuest ? (
                  "Inicia sesión para continuar"
                ) : isGuest && !guestDataCompleted ? (
                  "Completa tus datos para continuar"
                ) : (
                  "Finalizar compra"
                )}
              </Button>

              <Button
                href="/productos"
                variant="outline"
                size="md"
                className="w-full"
              >
                Seguir comprando
              </Button>
            </div>
          </div>
        </div>
      </div>

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
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </Layout>
  );
}
