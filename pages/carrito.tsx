// pages/carrito.tsx
"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Image from "next/image";
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
import { guestDataSchema, GuestDataSchemaType } from "@/lib/guestDataSchema";
import { useLocations } from "@/hooks/useLocations";
import { z } from "zod";
import { PiWarningCircleFill } from "react-icons/pi";
import { FaPencil } from "react-icons/fa6";

// Interfaz de tienda
interface Tienda {
  id_store: string;
  name: string;
  district: string;
  address: string;
  phone?: string;
  schedule?: string;
  stock?: number;
}

// Distritos disponibles
const DISTRITOS_LIMA = [
  "Ate",
  "Barranco",
  "Breña",
  "Cercado de Lima",
  "Chorrillos",
  "Jesús María",
  "La Molina",
  "La Victoria",
  "Lince",
  "Los Olivos",
  "Magdalena",
  "Miraflores",
  "Pueblo Libre",
  "San Borja",
  "San Isidro",
  "San Juan de Lurigancho",
  "San Miguel",
  "Santiago de Surco",
  "Surquillo",
];





export default function Carrito() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [recordarme, setRecordarme] = useState(false);
  const { items, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCart();
  const [couponCode, setCouponCode] = useState("");
  const [metodoEnvio, setMetodoEnvio] = useState<"delivery" | "retiro">(
    "delivery"
  );
  const [distritoSeleccionado, setDistritoSeleccionado] = useState("");
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string | null>(
    null
  );
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [productosEnTiendas, setProductosEnTiendas] = useState<
    Record<string, Tienda[]>
  >({});
  const [loadingStores, setLoadingStores] = useState(false);
  const [direccionEnvio, setDireccionEnvio] = useState({
    calle: "Calle continental 145",
    distrito: "Ate",
    ciudad: "Lima",
    departamento: "Lima",
  });
  const [editandoDireccion, setEditandoDireccion] = useState(false);
  const [validandoStock, setValidandoStock] = useState(false);
  const [stockValidado, setStockValidado] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNewsletter, setAcceptNewsletter] = useState(false);

  // Estados para autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [mainAddressId, setMainAddressId] = useState<string | null>(null);

  const [isGuest, setIsGuest] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);

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
    direccionEnvio.distrito
  );
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // Sincronizar estado local con hook de auth
  useEffect(() => {
    if (!authLoading) {
      setIsLoggedIn(isAuthenticated);
    }
  }, [isAuthenticated, authLoading]);

  // Cargar dirección principal si el usuario está logueado
  useEffect(() => {
    const fetchMainAddress = async () => {
      if (isAuthenticated && ((user && 'token' in user) || localStorage.getItem('accessToken'))) {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/addresses`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const mainAddress = result.data.find((addr: any) => addr.isMain);
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
                  mainAddress.district
                );
              }
            }
          }
        } catch (error) {
          console.error("Error al cargar dirección principal:", error);
        }
      }
    };

    fetchMainAddress();
  }, [isAuthenticated, user]);

  // Mostrar modal solo cuando hay items Y no está autenticado Y no ha completado datos de invitado
  useEffect(() => {
    if (!authLoading && items.length > 0 && !isAuthenticated && !isLoggedIn && !guestDataCompleted) {
      setShowLoginModal(true);
    }
  }, [items.length, isAuthenticated, isLoggedIn, guestDataCompleted, authLoading]);

  // NUEVO: Estado para el tab activo (login o registro)
  const [activeTab, setActiveTab] = useState<"login" | "registro" | "guest">("login");

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

  // Cargar tiendas cuando cambia el carrito
  useEffect(() => {
    if (items.length > 0) {
      const productIds = items
        .filter((item) => item.product && item.product.id != null)
        .map((item) => item.product.id.toString());
      // fetchTiendasConStock(productIds);
    }
  }, [items]);

  useEffect(() => {
    if (activeTab === "login") {
      resetLoginForm();
    } else {
      resetRegistroForm();
    }
  }, [activeTab]);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleCambiarARetiro = () => {
    setMetodoEnvio("retiro");
    setMostrarMapa(false);
    setTiendaSeleccionada(null);
    setDistritoSeleccionado("");
  };

  const handleSeleccionarDistrito = (distrito: string) => {
    setDistritoSeleccionado(distrito);
    setMostrarMapa(true);
    setTiendaSeleccionada(null);
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setLoginErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Manejador para Registro
  const handleRegistroChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Manejo correcto de checkbox
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setRegistroData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setRegistroData((prev) => ({ ...prev, [name]: value }));
    }

    setRegistroErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validarStockProductos = async () => {
    setValidandoStock(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const todosConStock = items.every((item) => {
        return item.quantity > 0 && item.quantity <= 100;
      });
      setStockValidado(todosConStock);

      if (todosConStock) {
        showToastMessage("Stock disponible para todos los productos");
      } else {
        showToastMessage("Algunos productos no tienen stock suficiente");
      }
    } catch (error) {
      console.error("Error al validar stock:", error);
      showToastMessage("Error al validar stock");
    } finally {
      setValidandoStock(false);
    }
  };

  const showToastMessage = (message: string) => {
    showToast(message, message.toLowerCase().includes("error") ? "error" : "success");
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
    setLoginErrors({});
    // Aquí harías la validación real con tu API
    setIsLoggedIn(true);
    setShowLoginModal(false);
    showToast("¡Bienvenido de vuelta!", "success");
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
    setRegistroErrors({});
    console.log("Registro exitoso:", registroData);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    showToast("¡Cuenta creada exitosamente!", "success");
  };

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    setShowGuestForm(true);
    setActiveTab("guest");
  };

  const handleGuestChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
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

  // Obtener tiendas por distrito
  const getTiendasPorDistrito = (distrito: string): Tienda[] => {
    const tiendasDelDistrito: Tienda[] = [];
    Object.entries(productosEnTiendas).forEach(([_productId, tiendas]) => {
      tiendas.forEach((tienda) => {
        if (tienda.district === distrito) {
          const existe = tiendasDelDistrito.find(
            (t) => t.id_store === tienda.id_store
          );
          if (!existe) {
            tiendasDelDistrito.push(tienda);
          }
        }
      });
    });
    return tiendasDelDistrito;
  };

  // Verificar si un producto tiene stock en una tienda específica
  const checkStockEnTienda = (productId: string, tiendaId: string): boolean => {
    const tiendasDelProducto = productosEnTiendas[productId] || [];
    const tienda = tiendasDelProducto.find((t) => t.id_store === tiendaId);
    return tienda ? (tienda.stock || 0) > 0 : false;
  };

  // Obtener stock de un producto en una tienda
  const getStockEnTienda = (productId: string, tiendaId: string): number => {
    const tiendasDelProducto = productosEnTiendas[productId] || [];
    const tienda = tiendasDelProducto.find((t) => t.id_store === tiendaId);
    return tienda?.stock || 0;
  };

  const subtotal = getCartTotal();
  const envio = metodoEnvio === "delivery" ? (subtotal > 100 ? 0 : 15) : 0;
  const total = subtotal + envio;

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

  const tiendasDisponibles = distritoSeleccionado
    ? getTiendasPorDistrito(distritoSeleccionado)
    : [];
  const infoTiendaSeleccionada = tiendasDisponibles.find(
    (t) => t.id_store === tiendaSeleccionada
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
            <h2 className="text-3xl font-bold text-primary-dark mb-4">
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

      const token = localStorage.getItem('accessToken');
      const addressData = {
        department: direccionEnvio.departamento,
        province: direccionEnvio.ciudad,
        district: direccionEnvio.distrito,
        address: direccionEnvio.calle,
        apartment: "Dirección Carrito", // Valor por defecto
        reference: "",
        isMain: true
      };

      let response;

      if (mainAddressId) {
        // Actualizar existente
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/addresses/${mainAddressId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(addressData)
        });
      } else {
        // Crear nueva
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/addresses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(addressData)
        });
      }

      if (response && response.ok) {
        if (!mainAddressId) {
          const result = await response.json();
          if (result.success && result.data) {
            setMainAddressId(result.data.id);
          }
        }
        console.log("Dirección actualizada correctamente");
        setEditandoDireccion(false);
      } else {
        console.error("Error al guardar dirección en backend");
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
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
                        className={`w-full px-4 py-3 border-2 rounded-sm transition ${loginErrors.email
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
                        className={`w-full px-4 py-3 border-2 rounded-sm transition ${loginErrors.password
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
                      className="w-full"
                      onClick={handleLogin}
                    >
                      Iniciar Sesión
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.nombre
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.apellido
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
                              | "CE"
                              | "Pasaporte", // ✅ Type assertion
                          })
                        }
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.tipoDocumento
                          ? "border-red-500"
                          : "border-gray-200"
                          }`}
                      >
                        <option value="DNI">DNI</option>
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.numeroDocumento
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.celular
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.telefonoOpcional
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.provincia
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
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.distrito
                          ? "border-red-500"
                          : "border-gray-200"
                          }`}
                      >
                        <option value="">Seleccionar distrito</option>
                        {DISTRITOS_LIMA.map((d) => (
                          <option key={d} value={d}>
                            {d}
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
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.direccion
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.numeroDpto
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.referencia
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.email
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
                            className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.password
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
                            className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${registroErrors.confirmarPassword
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${guestErrors.nombre
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${guestErrors.apellido
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
                              | "CE"
                              | "Pasaporte",
                          })
                        }
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${guestErrors.tipoDocumento
                          ? "border-red-500"
                          : "border-gray-200"
                          }`}
                      >
                        <option value="DNI">DNI</option>
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
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${guestErrors.numeroDocumento
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${guestErrors.celular
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${guestErrors.telefonoOpcional
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
                            setGuestData(prev => ({ ...prev, departamento: val, provincia: "", distrito: "" }));
                            guestLocations.handleDeptChange(val);
                          }}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-sm bg-white"
                        >
                          <option value="">Seleccionar</option>
                          {guestLocations.departments.map((d) => (
                            <option key={d} value={d}>{d}</option>
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
                            setGuestData(prev => ({ ...prev, provincia: val, distrito: "" }));
                            guestLocations.handleProvChange(val);
                          }}
                          className={`w-full px-4 py-2.5 border-2 rounded-sm bg-white transition ${guestErrors.provincia
                            ? "border-red-500"
                            : "border-gray-200"
                            }`}
                          disabled={!guestData.departamento}
                        >
                          <option value="">Seleccionar</option>
                          {guestLocations.provinces.map((p) => (
                            <option key={p} value={p}>{p}</option>
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
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${guestErrors.distrito
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
                        className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${guestErrors.direccion
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${guestErrors.numeroDpto
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
                          className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${guestErrors.referencia
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
            <h1 className="text-3xl font-bold animate-fade-in">
              Carrito de compras{" "}
              <span className="text-gray-500 text-xl">
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
                <span>{isLoggedIn ? loginData.email : "Invitado"}</span>
              </div>
            )}
          </div>
          {/* <Link href="/productos" className="text-sm text-gray-600 hover:text-primary">← Seguir comprando</Link> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Método de envío */}
            <div className="bg-white rounded-sm shadow-md p-6 animate-fade-in">
              <h2 className="text-lg font-bold mb-4">
                Selecciona tu método de entrega
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMetodoEnvio("delivery")}
                  className={`flex items-center gap-3 p-4 rounded-sm border-2 transition-all duration-300 transform hover:scale-105 ${metodoEnvio === "delivery"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                    }`}
                >
                  <FaTruck
                    className={`text-2xl ${metodoEnvio === "delivery"
                      ? "text-primary"
                      : "text-gray-400"
                      }`}
                  />
                  <div className="text-left">
                    <p className="font-semibold">Delivery</p>
                    <p className="text-xs text-gray-500">10 días hábiles</p>
                  </div>
                </button>

                <button
                  onClick={handleCambiarARetiro}
                  className={`flex items-center gap-3 p-4 rounded-sm border-2 transition-all duration-300 transform hover:scale-105 ${metodoEnvio === "retiro"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                    }`}
                >
                  <FaStore
                    className={`text-2xl ${metodoEnvio === "retiro"
                      ? "text-primary"
                      : "text-gray-400"
                      }`}
                  />
                  <div className="text-left">
                    <p className="font-semibold">Retiro en tienda</p>
                    <p className="text-xs text-gray-500">Gratis</p>
                  </div>
                </button>
              </div>

              {metodoEnvio === "delivery" && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <div className="p-4 bg-blue-50 rounded-sm">
                    <p className="text-sm text-gray-700">
                      📦 El envío se realizará en el transcurso de 10 días
                      hábiles.
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
                      <button
                        onClick={() => setEditandoDireccion(!editandoDireccion)}
                        className="text-primary text-sm hover:text-primary-dark flex items-center gap-1"
                      >
                        <FaPencil className="text-sm" /> Editar
                      </button>
                    </div>

                    {editandoDireccion ? (
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
                              setDireccionEnvio({ ...direccionEnvio, departamento: val, ciudad: "", distrito: "" });
                              userLocations.handleDeptChange(val);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                          >
                            <option value="">Departamento</option>
                            {userLocations.departments.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>

                          <select
                            value={direccionEnvio.ciudad}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDireccionEnvio({ ...direccionEnvio, ciudad: val, distrito: "" });
                              userLocations.handleProvChange(val);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                            disabled={!direccionEnvio.departamento}
                          >
                            <option value="">Provincia</option>
                            {userLocations.provinces.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>

                        <select
                          value={direccionEnvio.distrito}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDireccionEnvio({ ...direccionEnvio, distrito: val });
                            userLocations.handleDistChange(val);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                          disabled={!direccionEnvio.ciudad}
                        >
                          <option value="">Distrito</option>
                          {userLocations.districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <button
                          onClick={handleSaveAddress}
                          className="w-full bg-primary text-white py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition"
                        >
                          Guardar dirección
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">{direccionEnvio.calle}</p>
                        <p>
                          {direccionEnvio.distrito}, {direccionEnvio.ciudad},{" "}
                          {direccionEnvio.departamento}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Validar Stock */}
                  <div className="border-2 border-primary/20 rounded-sm p-4 bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Verificar disponibilidad
                      </h3>
                      {stockValidado && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                          ✓ Verificado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Valida que todos los productos tengan stock disponible
                      antes de continuar
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={validarStockProductos}
                      disabled={validandoStock}
                    >
                      {validandoStock ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Validando...
                        </span>
                      ) : (
                        "Validar disponibilidad"
                      )}
                    </Button>
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
                    {DISTRITOS_LIMA.map((distrito) => (
                      <option key={distrito} value={distrito}>
                        {distrito}
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

                {/* Mapa simulado */}
                <div className="relative h-64 bg-gray-200 rounded-sm mb-6 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop"
                    alt="Mapa"
                    fill
                    className="object-cover opacity-70"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-red-500 text-4xl animate-bounce" />
                  </div>
                </div>

                {/* Lista de tiendas */}
                {loadingStores ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Cargando tiendas disponibles...
                    </p>
                  </div>
                ) : tiendasDisponibles.length === 0 ? (
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
                    {tiendasDisponibles.map((tienda) => {
                      const todosDisponibles = items.every((item) =>
                        checkStockEnTienda(
                          item.product.id.toString(),
                          tienda.id_store
                        )
                      );

                      return (
                        <div
                          key={tienda.id_store}
                          className={`p-4 rounded-sm border-2 transition-all cursor-pointer ${tiendaSeleccionada === tienda.id_store
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary/50"
                            }`}
                          onClick={() => setTiendaSeleccionada(tienda.id_store)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {tienda.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {tienda.address}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {tienda.schedule}
                              </p>
                            </div>
                            <div className="ml-4">
                              {tiendaSeleccionada === tienda.id_store && (
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                  <FaCheck className="text-white text-xs" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Disponibilidad de productos */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              Disponibilidad:
                            </p>
                            <div className="space-y-1">
                              {items.map((item) => {
                                const disponible = checkStockEnTienda(
                                  item.product.id.toString(),
                                  tienda.id_store
                                );
                                const stock = getStockEnTienda(
                                  item.product.id.toString(),
                                  tienda.id_store
                                );

                                return (
                                  <div
                                    key={item.product.id}
                                    className="flex items-center justify-between gap-2 text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      {disponible ? (
                                        <FaCheck className="text-green-500 flex-shrink-0" />
                                      ) : (
                                        <FaTimes className="text-red-500 flex-shrink-0" />
                                      )}
                                      <span
                                        className={
                                          disponible
                                            ? "text-gray-700"
                                            : "text-gray-500"
                                        }
                                      >
                                        {getProductName(item.product)}
                                      </span>
                                    </div>
                                    {disponible && (
                                      <span className="text-green-600 font-semibold">
                                        {stock} unid.
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {!todosDisponibles && (
                            <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-800">
                              ⚠️ Algunos productos no están disponibles en esta
                              tienda
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
                  (item) => item.product && item.product.id != null
                );
                const invalidItems = items.filter(
                  (item) => !item.product || item.product.id == null
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
                            imageId
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

                      const enTiendaSeleccionada =
                        tiendaSeleccionada &&
                        checkStockEnTienda(
                          item.product.id.toString(),
                          tiendaSeleccionada
                        );
                      const stockDisponible = tiendaSeleccionada
                        ? getStockEnTienda(
                          item.product.id.toString(),
                          tiendaSeleccionada
                        )
                        : 0;

                      return (
                        <div
                          key={item.product.id}
                          className="bg-white rounded-sm shadow-md p-6 flex gap-4 animate-fade-in-up"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div>
                            {metodoEnvio === "retiro" && tiendaSeleccionada ? (
                              enTiendaSeleccionada ? (
                                <FaCheckCircle
                                  size={25}
                                  className="text-primary"
                                />
                              ) : (
                                <FaTimesCircle
                                  size={25}
                                  className="text-red-500"
                                />
                              )
                            ) : (
                              <FaCheckCircle
                                size={25}
                                className="text-primary"
                              />
                            )}
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
                                      {infoTiendaSeleccionada.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="text-neutral-grayLighter text-sm">
                                      <p className="pb-1">
                                        {infoTiendaSeleccionada.address}
                                      </p>
                                      <div className="flex items-center gap-4">
                                        {enTiendaSeleccionada ? (
                                          <>
                                            <span className="text-primary inline-flex gap-1 items-center">
                                              <FaRegClock size={15} />{" "}
                                              Disponible
                                            </span>
                                            <span>
                                              {infoTiendaSeleccionada.schedule}
                                            </span>
                                            <span className="text-green-600 font-semibold">
                                              {stockDisponible} en stock
                                            </span>
                                          </>
                                        ) : (
                                          <span className="text-red-500 inline-flex gap-1 items-center">
                                            <FaTimes size={15} /> No disponible
                                            en esta tienda
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="font-bold text-green-600">
                                      GRATIS
                                    </div>
                                  </div>
                                </div>
                              )}

                            <div className="flex gap-6">
                              <div className="relative w-32 h-32 flex-shrink-0 bg-gray-50 rounded-sm overflow-hidden">
                                <Image
                                  src={imageUrl}
                                  alt={getProductName(item.product)}
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>

                              <div className="flex-1">
                                <Link
                                  href={`/tienda/${item.product.id || item.product.productId
                                    }`}
                                >
                                  <h3 className="font-semibold text-lg mb-2 hover:text-primary transition">
                                    {getProductName(item.product)}
                                  </h3>
                                </Link>
                                <p className="text-gray-600 text-sm mb-4">
                                  SKU: {item.product.reference || "N/A"}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center border border-gray-300 rounded-sm">
                                    <button
                                      onClick={() =>
                                        handleUpdateQuantity(
                                          item.product.id.toString(),
                                          item.quantity - 1
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
                                          item.quantity + 1
                                        )
                                      }
                                      className="px-3 py-1 hover:bg-gray-100 transition"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <div className="text-right">
                                    {/* Mostrar precio original tachado si hay descuento */}
                                    {item.product.originalPrice &&
                                      parseFloat(
                                        item.product.originalPrice.toString()
                                      ) > precioUnitario && (
                                        <p className="text-sm text-gray-400 line-through">
                                          {formatPrice(
                                            item.product.originalPrice.toString()
                                          )}
                                        </p>
                                      )}

                                    <p className="text-2xl font-bold text-primary-dark">
                                      {formatPrice(precioTotal.toString())}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatPrice(precioUnitario.toString())}{" "}
                                      c/u
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() =>
                                    removeFromCart(item.product.id.toString())
                                  }
                                  className="mt-4 text-red-500 hover:text-red-700 text-sm font-medium flex gap-2"
                                >
                                  <FaRegTrashAlt size={18} /> Eliminar
                                </button>
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
              <h2 className="text-lg font-bold mb-2 text-primary-dark">
                Persona autorizada a retirar
              </h2>
              <div className="">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-[#606060]">
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

          {/* Resumen del pedido */}
          <div className="lg:col-span-1 z-10">
            <div className="bg-white rounded-sm shadow-lg p-6 sticky top-32 animate-fade-in">
              <h2 className="text-xl font-bold mb-6">Resumen del pedido</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de cupón
                </label>
                <div className="flex w-full">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Ingresa tu cupón"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />

                  <button className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-r-sm border border-primary">
                    Aplicar
                  </button>
                </div>
              </div>

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
                  <span>Envío</span>
                  <span className="font-semibold">
                    {envio === 0 ? (
                      <span className="text-green-600">Gratis ✓</span>
                    ) : (
                      formatPrice(envio.toString())
                    )}
                  </span>
                </div>
                {metodoEnvio === "delivery" && envio > 0 && (
                  <p className="text-xs text-gray-500">
                    ¡Envío gratis en compras mayores a S/ 100!
                  </p>
                )}
              </div>

              <div className="flex justify-between text-2xl font-bold mb-6">
                <span>Total</span>
                <span className="text-primary">
                  {formatPrice(total.toString())}
                </span>
              </div>

              {/* Checkboxes de términos y condiciones */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                    Acepto los{" "}
                    <Link href="/estaticas/terminos-y-condiciones" className="text-primary hover:underline" target="_blank">
                      Términos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/estaticas/politicas" className="text-primary hover:underline" target="_blank">
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
                  <label htmlFor="acceptNewsletter" className="text-sm text-gray-500 cursor-pointer">
                    Quiero recibir ofertas y beneficios exclusivos
                  </label>
                </div>
              </div>

              <Button
                href={isGuest && !guestDataCompleted ? undefined : "/checkout"}
                variant="primary"
                size="md"
                className="w-full mb-3"
                disabled={
                  (!isLoggedIn && !isGuest) ||
                  (isGuest && !guestDataCompleted ? false : !acceptTerms || (metodoEnvio === "retiro" && !tiendaSeleccionada))
                }
                onClick={
                  isGuest && !guestDataCompleted
                    ? () => setShowLoginModal(true)
                    : undefined
                }
              >
                {!isLoggedIn && !isGuest
                  ? "Inicia sesión para continuar"
                  : isGuest && !guestDataCompleted
                    ? "Completa tus datos para continuar"
                    : !acceptTerms
                      ? "Acepta los términos para continuar"
                      : "Finalizar compra"}
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
