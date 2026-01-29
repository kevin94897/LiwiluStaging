// pages/carrito.tsx
"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  getProductImageUrl,
  formatPrice,
  getProductName,
  getEffectivePrice,
  getRegularPrice,
} from "@/lib/utils";
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
  FaPlus,
} from "react-icons/fa";
import { PiWarningCircleFill } from "react-icons/pi";
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
import AutorizacionModal from "@/components/cart/AutorizacionModal";
import AuthorizedPersonInfo from "@/components/cart/AuthorizedPersonInfo";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import DeliveryAddressForm from "@/components/cart/DeliveryAddressForm";
import DeliveryMethodSelector from "@/components/cart/DeliveryMethodSelector";
import GuestDataSummary from "@/components/cart/GuestDataSummary";
import GuestDataForm from "@/components/cart/GuestDataForm";
import StockModals from "@/components/cart/StockModals";
import StorePickupContent from "@/components/cart/StorePickupContent";
import { AutorizacionSchemaType } from "@/lib/autorizacionSchema";
import {
  getCarriers,
  CartCarrier,
  getWarehouseDistricts,
  getWarehouseProvinces,
  WarehouseDistrict,
  getWarehouseMap,
  WarehouseMapItem,
  validateStock,
  StockValidationResponse,
  saveGuestPersonalData,
  getDeliveryZones,
  DeliveryZone,
  saveCartDeliveryAddress,
  validateSavarStock,
  saveCartDeliveryPrice,
  SavarStockValidationResult,
  savePickupPerson,
  getWarehouseDetails,
  WarehouseDetail,
  savePickupStore,
  SavePickupStoreRequest,
} from "@/lib/cart";

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
  const [warehouseProvinces, setWarehouseProvinces] = useState<
    WarehouseDistrict[]
  >([]);
  const [pickupTab, setPickupTab] = useState<"lima" | "provincia">("lima");
  const [mapWarehouses, setMapWarehouses] = useState<WarehouseMapItem[]>([]);
  const [warehouseDetails, setWarehouseDetails] = useState<WarehouseDetail[]>(
    [],
  );
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
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [direccionEnvio, setDireccionEnvio] = useState({
    calle: "",
    distrito: "",
    ciudad: "Lima",
    departamento: "Lima",
    numeroDptoPiso: "",
    referencia: "",
  });
  const [editandoDireccion, setEditandoDireccion] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNewsletter, setAcceptNewsletter] = useState(false);

  // Estados para autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [mainAddressId, setMainAddressId] = useState<number | null>(null);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);

  const [isGuest, setIsGuest] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);

  // States for stock validation
  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const [stockValidationResult, setStockValidationResult] =
    useState<StockValidationResponse | null>(null);
  const [isValidatingSavar, setIsValidatingSavar] = useState(false);
  const [savarStockResults, setSavarStockResults] = useState<
    SavarStockValidationResult[]
  >([]);
  const [showSavarStockModal, setShowSavarStockModal] = useState(false);
  const [showPickupStockModal, setShowPickupStockModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState("");
  const [selectedStoreData, setSelectedStoreData] =
    useState<SavePickupStoreRequest | null>(null);

  // Estados para formulario de invitado
  const [guestData, setGuestData] = useState<GuestDataSchemaType>({
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    celular: "",
    email: "", // Added email initial state
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

  const [addressErrors, setAddressErrors] = useState<Record<string, string>>(
    {},
  );

  // Estados para autorización de retiro
  const [showAutorizacionModal, setShowAutorizacionModal] = useState(false);
  const [autorizacionData, setAutorizacionData] =
    useState<AutorizacionSchemaType | null>(null);
  const [isSelfPickup, setIsSelfPickup] = useState(true);

  // Hooks de ubicación
  const guestLocations = useLocations("Lima", "Lima", "");
  const userLocations = useLocations("Lima", "Lima", direccionEnvio.distrito);

  // Sincronizar estado local con hook de auth
  useEffect(() => {
    if (!authLoading) {
      setIsLoggedIn(isAuthenticated);
    }
  }, [isAuthenticated, authLoading]);

  // Fetch delivery zones for the selected carrier
  useEffect(() => {
    const fetchZones = async () => {
      if (!selectedCarrier?.id) {
        setDeliveryZones([]);
        return;
      }

      // Skip for pickup methods (usually those with 0 shipping cost or "retiro" in name)
      if (metodoEnvio === "retiro") {
        setDeliveryZones([]);
        return;
      }

      try {
        const response = await getDeliveryZones(selectedCarrier.id);
        if (response.success) {
          setDeliveryZones(response.zones);
        } else {
          setDeliveryZones([]);
        }
      } catch (error) {
        console.error("Error fetching delivery zones:", error);
        setDeliveryZones([]);
      }
    };
    fetchZones();
  }, [selectedCarrier?.id, metodoEnvio]);

  // Trigger Savar stock validation when delivery is selected or district changes
  useEffect(() => {
    if (metodoEnvio === "delivery" && items.length > 0) {
      performSavarStockValidation();
    }
  }, [metodoEnvio, items.length, direccionEnvio.distrito, guestData.distrito]);
  // Sync delivery price with backend when district changes
  useEffect(() => {
    const syncDeliveryPrice = async () => {
      if (
        metodoEnvio === "delivery" &&
        selectedCarrier?.id &&
        direccionEnvio.distrito &&
        deliveryZones.length > 0 &&
        items.length > 0
      ) {
        const matchingZone = deliveryZones.find(
          (z) =>
            z.zoneName.toLowerCase() === direccionEnvio.distrito.toLowerCase(),
        );

        if (matchingZone) {
          try {
            await saveCartDeliveryPrice({
              carrierId: selectedCarrier.id,
              shippingCost: matchingZone.price,
              zoneId: matchingZone.zoneId,
              zoneName: matchingZone.zoneName,
            });
            console.log("Delivery price synced to API:", matchingZone.zoneName);
          } catch (error: any) {
            // Silenciar error "Carrito no encontrado" para evitar overlay en desarrollo
            // Esto ocurre si el frontend tiene items pero el backend perdió la sesión
            if (
              error.message?.includes("Carrito no encontrado") ||
              error.message?.includes("Cart not found")
            ) {
              console.warn(
                "Sync skipped: Backend cart session missing (expected in some guest states).",
              );
            } else {
              console.error("Error syncing delivery price:", error);
            }
          }
        }
      }
    };

    syncDeliveryPrice();
  }, [
    metodoEnvio,
    selectedCarrier?.id,
    direccionEnvio.distrito,
    deliveryZones,
    items.length,
  ]);

  // Real-time delivery coverage validation
  useEffect(() => {
    if (
      metodoEnvio === "delivery" &&
      selectedCarrier?.id &&
      deliveryZones.length > 0 &&
      direccionEnvio.distrito
    ) {
      const normalizeText = (text: string) =>
        text
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

      const districtExists = deliveryZones.some(
        (z) =>
          normalizeText(z.zoneName) === normalizeText(direccionEnvio.distrito),
      );

      if (!districtExists) {
        setAddressErrors((prev) => ({
          ...prev,
          distrito: "El distrito seleccionado no tiene cobertura de delivery.",
        }));
      } else {
        setAddressErrors((prev) => {
          const { distrito, ...rest } = prev;
          return rest;
        });
      }
    } else {
      setAddressErrors((prev) => {
        const { distrito, ...rest } = prev;
        return rest;
      });
    }
  }, [
    metodoEnvio,
    selectedCarrier?.id,
    deliveryZones,
    direccionEnvio.distrito,
  ]);

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
                  numeroDptoPiso: mainAddress.apartment || "",
                  referencia: mainAddress.reference || "",
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

  // Cargar datos de autorización
  useEffect(() => {
    const saved = localStorage.getItem("liwilu_autorizacion");
    if (saved) {
      try {
        setAutorizacionData(JSON.parse(saved));
      } catch (e) {
        console.error("Error al cargar autorización:", e);
      }
    }
  }, []);

  // Cargar preferencia de retiro
  useEffect(() => {
    const saved = localStorage.getItem("liwilu_isSelfPickup");
    if (saved !== null) {
      setIsSelfPickup(saved === "true");
    }
  }, []);


  // Cargar datos del invitado
  useEffect(() => {
    const saved = localStorage.getItem("liwilu_guestData");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setGuestData(data);
        setGuestDataCompleted(true);
        setIsGuest(true); // Marcar como invitado
      } catch (e) {
        console.error("Error al cargar datos del invitado:", e);
      }
    }
  }, []);

  // Cargar dirección de envío
  useEffect(() => {
    const saved = localStorage.getItem("liwilu_direccionEnvio");
    if (saved) {
      try {
        setDireccionEnvio(JSON.parse(saved));
      } catch (e) {
        console.error("Error al cargar dirección de envío:", e);
      }
    }
  }, []);

  const handleSaveAutorizacion = async (data: AutorizacionSchemaType) => {
    setAutorizacionData(data);
    // Keep localStorage as backup/cache
    localStorage.setItem("liwilu_autorizacion", JSON.stringify(data));
    showToast("Autorización guardada correctamente");
  };

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

  // Fetch warehouse locations (districts and provinces)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [districtsRes, provincesRes] = await Promise.all([
          getWarehouseDistricts(),
          getWarehouseProvinces(),
        ]);

        if (districtsRes.success) {
          setWarehouseDistricts(districtsRes.data);
        }
        if (provincesRes.success) {
          setWarehouseProvinces(provincesRes.data);
        }
      } catch (error) {
        console.error("Error fetching warehouse locations:", error);
      }
    };

    fetchLocations();
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
      } else if (
        metodoEnvio === "delivery" &&
        !isGuest &&
        mapWarehouses.length > 0
      ) {
        await performStockValidation(mapWarehouses.map((w) => w.idAlmacen));
      } else {
        setStockValidationResult(null);
      }
    };

    triggerValidation();
  }, [items, tiendaSeleccionada, metodoEnvio, mapWarehouses, isGuest]);

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
      // Find the codUbigeoAlm for the selected district/province
      const locationList = pickupTab === "lima" ? warehouseDistricts : warehouseProvinces;
      const location = locationList.find(
        (l) => l.desDistrito === distrito,
      );
      if (location) {
        console.log(
          `📍 Buscando almacenes para: ${distrito} (${location.codUbigeoAlm})`,
        );
        const response = await getWarehouseMap(location.codUbigeoAlm);
        if (response.success) {
          setMapWarehouses(response.data);

          // Also fetch details
          getWarehouseDetails(location.codUbigeoAlm).then((detailsRes) => {
            if (detailsRes.success) {
              setWarehouseDetails(detailsRes.data);
            }
          });

          // The useEffect will handle the re-validation when 'mapWarehouses' state updates
        }
      }
    } catch (error) {
      console.error("Error fetching map warehouses:", error);
    } finally {
      setLoadingStores(false);
    }
  };

  const handleSelectStore = async (store: SavePickupStoreRequest) => {
    setSelectedStoreData(store);
    console.log("🏪 Pickup store selected (local):", store.desAlmacen);
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
          confirmEmail: registroData.email,
          password: registroData.password,
          confirmPassword: registroData.confirmarPassword,
          acceptTerms: registroData.aceptoTerminos,
          receiveOffers: false,
          documentType: registroData.tipoDocumento,
          documentNumber: registroData.numeroDocumento,
          phone: registroData.celular,
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

    // Save to API
    const saveToApi = async () => {
      try {
        const payload = {
          nombre: guestData.nombre,
          apellido: guestData.apellido,
          tipoDocumento: guestData.tipoDocumento,
          numeroDocumento: guestData.numeroDocumento,
          celular: guestData.celular,
          telefono: guestData.telefonoOpcional || "",
          email: guestData.email,
          departamento: guestData.departamento,
          provincia: guestData.provincia,
          distrito: guestData.distrito,
          direccion: guestData.direccion,
          numeroDptoPiso: guestData.numeroDpto || "",
          referencia: guestData.referencia || "",
        };

        await saveGuestPersonalData(payload);

        console.log("Datos de invitado guardados:", guestData);

        // Guardar en localStorage
        localStorage.setItem("liwilu_guestData", JSON.stringify(guestData));

        setIsGuest(true);
        setGuestDataCompleted(true);
        setShowLoginModal(false);
        setShowGuestForm(false);
        showToast("¡Datos guardados! Continúa con tu compra.", "success");
      } catch (error: any) {
        console.error("Error saving guest data:", error);
        showToast(error.message || "Error al guardar datos", "error");
      }
    };

    saveToApi();
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
  const performSavarStockValidation = async () => {
    const productsToValidate = items
      .filter((item) => item.product && item.product.reference)
      .map((item) => ({
        reference: item.product.reference as string,
        quantity: item.quantity,
      }));

    if (productsToValidate.length === 0) {
      return null;
    }

    setIsValidatingSavar(true);
    setSavarStockResults([]);

    try {
      const results = await Promise.all(
        productsToValidate.map((p) =>
          validateSavarStock(p.reference, p.quantity),
        ),
      );
      setSavarStockResults(results);
      return results;
    } catch (error: any) {
      console.error("Error validating Savar stock:", error);
      showToast(error.message || "Error al validar stock de despacho", "error");
      return null;
    } finally {
      setIsValidatingSavar(false);
    }
  };

  const syncCheckoutData = async () => {
    try {
      // 1. Guardar Datos Personales
      let personalData = null;
      if (isLoggedIn && user) {
        personalData = {
          nombre: user.firstName,
          apellido: user.lastName,
          tipoDocumento: user.documentType || "DNI",
          numeroDocumento: user.documentNumber || "",
          celular: user.phone || "",
          telefono: "",
          email: user.email,
          departamento: direccionEnvio.departamento,
          provincia: direccionEnvio.ciudad,
          distrito: direccionEnvio.distrito,
          direccion: direccionEnvio.calle,
          numeroDptoPiso: direccionEnvio.numeroDptoPiso,
          referencia: direccionEnvio.referencia,
        };
      } else if (isGuest) {
        personalData = {
          nombre: guestData.nombre,
          apellido: guestData.apellido,
          tipoDocumento: guestData.tipoDocumento,
          numeroDocumento: guestData.numeroDocumento,
          celular: guestData.celular,
          telefono: guestData.telefonoOpcional,
          email: guestData.email,
          departamento: guestData.departamento,
          provincia: guestData.provincia,
          distrito: guestData.distrito,
          direccion: guestData.direccion,
          numeroDptoPiso: guestData.numeroDpto,
          referencia: guestData.referencia,
        };
      }

      if (personalData) {
        await saveGuestPersonalData(personalData);
      }

      // 2. Guardar Dirección de Envío o Datos de Retiro
      if (metodoEnvio === "delivery") {
        console.log("🚚 Sincronizando dirección de envío al finalizar:", {
          distritoSeleccionado: direccionEnvio.distrito,
          direccion: direccionEnvio.calle,
          numeroDptoPiso: direccionEnvio.numeroDptoPiso,
          referencia: direccionEnvio.referencia,
        });
        await saveCartDeliveryAddress({
          distritoSeleccionado: direccionEnvio.distrito,
          direccion: direccionEnvio.calle,
          numeroDptoPiso: direccionEnvio.numeroDptoPiso,
          referencia: direccionEnvio.referencia,
        });
      } else if (metodoEnvio === "retiro") {
        // Guardar Tienda de Retiro
        if (selectedStoreData) {
          console.log("🏪 Sincronizando tienda de retiro...");
          await savePickupStore(selectedStoreData);
        }

        // Guardar Persona Autorizada
        if (!isSelfPickup && autorizacionData) {
          console.log("👤 Sincronizando persona autorizada...");
          await savePickupPerson({
            tipoDocumento: autorizacionData.documentType,
            numeroDocumento: autorizacionData.documentNumber,
            nombreCompleto: autorizacionData.fullName,
          });
        } else {
          // Si es retiro propio, enviamos los datos del titular
          console.log("👤 Sincronizando retiro propio...");
          const titular = personalData;
          if (titular) {
            await savePickupPerson({
              tipoDocumento: titular.tipoDocumento,
              numeroDocumento: titular.numeroDocumento,
              nombreCompleto: `${titular.nombre} ${titular.apellido}`,
            });
          }
        }
      }

      return true;
    } catch (error: any) {
      console.error("Error syncing checkout data:", error);

      // Capturar errores de validación de datos personales (DNI, Celular, etc)
      if (
        error.message &&
        (error.message.toLowerCase().includes("documento") ||
          error.message.toLowerCase().includes("celular"))
      ) {
        setValidationErrorMessage(error.message);
        setShowValidationModal(true);
      } else {
        showToast("Error al procesar la información del carrito", "error");
      }

      return false;
    }
  };

  const handleCheckoutSubmit = async () => {
    if (!acceptTerms) {
      showToast(
        "Debes aceptar los términos y condiciones para continuar.",
        "error",
      );
      return;
    }

    if ((isGuest && !guestDataCompleted) || (!isLoggedIn && !isGuest)) {
      setShowLoginModal(true);
      return;
    }

    // Savar Stock Check for Delivery
    if (metodoEnvio === "delivery") {
      if (editandoDireccion) {
        showToast("Debes guardar tu dirección para continuar.", "error");
        return;
      }

      if (isLoggedIn && !direccionEnvio.calle) {
        showToast(
          "Debes elegir una dirección de envío o agregar una nueva.",
          "error",
        );
        return;
      }

      // 🔹 Validar cobertura de delivery
      if (selectedCarrier?.id && deliveryZones.length > 0) {
        const normalizeText = (text: string) =>
          text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        const districtExists = deliveryZones.some(
          (z) =>
            normalizeText(z.zoneName) ===
            normalizeText(direccionEnvio.distrito),
        );

        if (!districtExists) {
          showToast(
            "Tu dirección no tiene cobertura para delivery. Por favor cambia el distrito o método de envío.",
            "error",
          );
          setAddressErrors({
            distrito:
              "El distrito seleccionado no tiene cobertura de delivery.",
          });
          return;
        }
      }
      const itemsNoDisponibles = savarStockResults.filter((r) => !r.disponible);
      if (itemsNoDisponibles.length > 0) {
        setShowSavarStockModal(true);
        return;
      }
      // If Savar check passes and is guest, proceed directly
      if (isGuest) {
        const synced = await syncCheckoutData();
        if (synced) {
          router.push("/checkout");
        }
        return;
      }
    }

    // New: Pickup Stock Check for "Retiro en Tienda"
    if (metodoEnvio === "retiro") {
      const selectedWh = stockValidationResult?.resultadosPorAlmacen.find(
        (w) => w.idAlmacen.toString() === tiendaSeleccionada,
      );

      if (selectedWh) {
        const itemsNoDisponibles = selectedWh.productos.filter(
          (p) => !p.disponible,
        );
        if (itemsNoDisponibles.length > 0) {
          setShowPickupStockModal(true);
          return;
        }
      }
    }

    // If we already have a result and it's successful, we can just proceed
    // or we can re-validate once to be sure. The user said Finale is not the trigger.
    // However, we MUST ensure validation has passed.

    if (stockValidationResult?.success) {
      const synced = await syncCheckoutData();
      if (synced) {
        router.push("/checkout");
      }
      return;
    }

    // If no result or failed result, try validating one last time
    const result = await performStockValidation();
    if (result?.success) {
      const synced = await syncCheckoutData();
      if (synced) {
        router.push("/checkout");
      }
    } else if (result) {
      if (metodoEnvio === "retiro") {
        setShowPickupStockModal(true);
      } else {
        showToast("Algunos productos no tienen stock suficiente", "error");
      }
    } else {
      showToast(
        "Por favor selecciona una ubicación de entrega válida",
        "error",
      );
    }
  };



  // CALCULACIÓN DE TOTALES CON LÓGICA CENTRALIZADA (utils.ts)

  // 1. Subtotal Regular: Suma de precios regulares (sin descuento)
  const regularSubtotal = items.reduce((acc, item) => {
    return acc + getRegularPrice(item.product) * item.quantity;
  }, 0);

  // 2. Subtotal Efectivo (Neto): Suma de lo que realmente paga el cliente por los productos
  const effectiveSubtotal = items.reduce((acc, item) => {
    return acc + getEffectivePrice(item.product) * item.quantity;
  }, 0);

  // 3. Ahorro Total: Diferencia entre regular y efectivo
  const totalSavings = regularSubtotal - effectiveSubtotal;

  // Override shipping cost based on zone
  const getEnvioCost = () => {
    if (metodoEnvio === "retiro") return 0;

    if (selectedCarrier?.id && deliveryZones.length > 0) {
      const zone = deliveryZones.find(
        (z) =>
          z.zoneName.toLowerCase() === direccionEnvio.distrito.toLowerCase(),
      );
      if (zone) return zone.price;
    }
    return totals.shipping;
  };

  const envio = getEnvioCost();

  // 4. Total Final: Subtotal Efectivo + Envío
  // NOTA: Usamos effectiveSubtotal para el total a pagar, pero enviamos regularSubtotal
  // al componente CartSummary como "subtotal" para que la operación visual sea:
  // Subtotal (Regular) - Descuentos + Envío = Total
  const total = effectiveSubtotal + envio;

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
    // Validar datos con Zod ANTES de cualquier otra lógica
    const addressSchema = z.object({
      calle: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
      departamento: z.string().min(1, "Selecciona un departamento"),
      ciudad: z.string().min(1, "Selecciona una provincia"),
      distrito: z.string().min(1, "Selecciona un distrito"),
      numeroDptoPiso: z.string().min(1, "El Nro. de dpto. / Piso es obligatorio"),
      referencia: z.string().min(1, "La referencia es obligatoria"),
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

    // 🔹 MOVED: La validación de cobertura se movió al checkout (handleCheckoutSubmit)
    // Se permite guardar cualquier dirección, pero se valida antes de finalizar compra.

    // 🔹 IMPORTANTE: Sincronizar siempre con la sesión del carrito para actualizar costos de envío
    try {
      console.log("🚚 Sincronizando dirección con la sesión del carrito...");
      await saveCartDeliveryAddress({
        distritoSeleccionado: direccionEnvio.distrito,
        direccion: direccionEnvio.calle,
        numeroDptoPiso: direccionEnvio.numeroDptoPiso,
        referencia: direccionEnvio.referencia,
      });
    } catch (apiError) {
      console.error("Error saving address to cart API:", apiError);
    }

    // Guardar en localStorage siempre
    try {
      localStorage.setItem(
        "liwilu_direccionEnvio",
        JSON.stringify(direccionEnvio),
      );
    } catch (e) {
      console.error("Error saving address to localStorage:", e);
    }

    // Si no está autenticado o es invitado, solo actualiza el estado local para la UI
    if (!isAuthenticated || isGuest) {
      setEditandoDireccion(false);
      showToast("Dirección guardada correctamente");
      return;
    }

    // Si está autenticado, intentar actualizar/crear en el backend
    try {
      const token = localStorage.getItem("accessToken");
      // Si no tiene direcciones previas, esta será la principal automáticamente
      const hasNoAddresses = userAddresses.length === 0;

      // Check if we're editing the main address
      const isEditingMainAddress =
        mainAddressId &&
        userAddresses.find((addr) => addr.id === mainAddressId)?.isMain;

      const addressData = {
        department: direccionEnvio.departamento,
        province: direccionEnvio.ciudad,
        district: direccionEnvio.distrito,
        address: direccionEnvio.calle,
        apartment:
          direccionEnvio.numeroDptoPiso ||
          (mainAddressId ? "Mi Dirección" : "Nueva Dirección"),
        reference: direccionEnvio.referencia || "",
        isMain: isEditingMainAddress || hasNoAddresses || false,
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
        console.log("✅ Dirección persistida en el perfil del usuario");

        // Refresh addresses to update dropdown and main selection
        const refreshedResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/addresses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (refreshedResponse.ok) {
          const refreshedResult = await refreshedResponse.json();
          if (refreshedResult.success) {
            const addresses = refreshedResult.data;
            setUserAddresses(addresses);

            // Si es la primera o se marcó como principal, actualizar mainAddressId
            const savedAddressId =
              result.data?.id || (hasNoAddresses ? addresses[0]?.id : null);
            if (savedAddressId) {
              setMainAddressId(savedAddressId);
            }
          }
        }

        setEditandoDireccion(false);
        showToast("Dirección vinculada a tu cuenta correctamente");
      } else {
        console.error("Error al guardar dirección en backend");
        showToast("Error al vincular la dirección a tu cuenta", "error");
      }
    } catch (error) {
      console.error("Error al guardar dirección:", error);
      showToast("Ocurrió un error al procesar tu dirección", "error");
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
                          placeholder="Nombres"
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
                          placeholder="Apellidos"
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
                              | "RUC"
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

              <GuestDataForm
                activeTab={activeTab}
                guestData={guestData}
                guestErrors={guestErrors}
                onGuestChange={handleGuestChange}
                onGuestSubmit={handleGuestSubmit}
                guestLocations={guestLocations}
                onSetActiveTab={setActiveTab}
                onSetGuestData={setGuestData}
              />
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
            {/* Metodo de entrega */}
            <DeliveryMethodSelector
              loadingCarriers={loadingCarriers}
              carriers={carriers}
              selectedCarrier={selectedCarrier}
              deliveryZones={deliveryZones}
              direccionEnvio={direccionEnvio}
              metodoEnvio={metodoEnvio as any}
              isGuest={isGuest}
              envio={envio}
              onSelectCarrier={(carrier) => {
                setSelectedCarrier(carrier);
                updateCarrier(carrier.id);
                const isRetiro = carrier.name.toLowerCase().includes("retiro");
                if (isRetiro) {
                  handleCambiarARetiro();
                } else {
                  setMetodoEnvio("delivery");
                  if (isGuest) {
                    performSavarStockValidation();
                  }
                }
              }}
            >
              <DeliveryAddressForm
                isLoggedIn={isLoggedIn}
                userAddresses={userAddresses}
                mainAddressId={mainAddressId}
                setMainAddressId={setMainAddressId}
                direccionEnvio={direccionEnvio}
                setDireccionEnvio={setDireccionEnvio}
                editandoDireccion={editandoDireccion}
                setEditandoDireccion={setEditandoDireccion}
                userLocations={userLocations}
                onSaveAddress={handleSaveAddress}
                addressErrors={addressErrors}
                deliveryZones={deliveryZones}
              />
            </DeliveryMethodSelector>

            <GuestDataSummary
              isGuest={isGuest}
              isLoggedIn={isLoggedIn}
              guestDataCompleted={guestDataCompleted}
              guestData={guestData}
              userData={user}
              userAddress={userAddresses.find((a) => a.isMain)}
              onEdit={() => {
                setActiveTab("guest");
                setShowGuestForm(true);
                setShowLoginModal(true);
              }}
            />

            <StorePickupContent
              metodoEnvio={metodoEnvio as any}
              distritoSeleccionado={distritoSeleccionado}
              onSelectDistrito={handleSeleccionarDistrito}
              mostrarMapa={mostrarMapa}
              setMostrarMapa={setMostrarMapa}
              warehouseDistricts={warehouseDistricts}
              warehouseProvinces={warehouseProvinces}
              pickupTab={pickupTab}
              onTabChange={(tab) => {
                setPickupTab(tab);
                setDistritoSeleccionado("");
                setMostrarMapa(false);
              }}
              mapWarehouses={mapWarehouses}
              warehouseDetails={warehouseDetails}
              tiendaSeleccionada={tiendaSeleccionada}
              setTiendaSeleccionada={setTiendaSeleccionada}
              onSelectStore={handleSelectStore}
              loadingStores={loadingStores}
              stockValidationResult={stockValidationResult}
            />

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
                          Te recomendamos vaciar el carrito para corregirlo.
                        </p>
                        <button
                          onClick={clearCart}
                          className="text-red-700 underline text-sm hover:text-red-900"
                        >
                          Vaciar carrito completo
                        </button>
                      </div>
                    )}

                    {validItems.map((item, index) => (
                      <CartItem
                        key={item.product.id}
                        item={item}
                        index={index}
                        metodoEnvio={metodoEnvio as any}
                        savarStockResults={savarStockResults}
                        tiendaSeleccionada={tiendaSeleccionada}
                        stockValidationResult={stockValidationResult}
                        infoTiendaSeleccionada={infoTiendaSeleccionada}
                        isValidatingStock={isValidatingStock}
                        isValidatingSavar={isValidatingSavar}
                        onRemove={removeFromCart}
                        onUpdateQuantity={handleUpdateQuantity}
                      />
                    ))}
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

            <AuthorizedPersonInfo
              metodoEnvio={metodoEnvio as any}
              autorizacionData={autorizacionData}
              onEdit={() => setShowAutorizacionModal(true)}
              isLoggedIn={isLoggedIn}
              userData={user}
              guestData={guestData}
              isSelfPickup={isSelfPickup}
              onSetIsSelfPickup={(val) => {
                setIsSelfPickup(val);
                localStorage.setItem("liwilu_isSelfPickup", val.toString());
              }}
            />
          </div>

          <CartSummary
            couponCode={couponCode}
            onCouponCodeChange={setCouponCode}
            subtotal={regularSubtotal}
            total={total}
            envio={envio}
            totalSavings={totalSavings}
            selectedCarrier={selectedCarrier}
            metodoEnvio={metodoEnvio as any}
            acceptTerms={acceptTerms}
            onAcceptTermsChange={setAcceptTerms}
            acceptNewsletter={acceptNewsletter}
            onAcceptNewsletterChange={setAcceptNewsletter}
            isValidatingStock={isValidatingStock}
            tiendaSeleccionada={tiendaSeleccionada}
            onCheckout={handleCheckoutSubmit}
          />
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

      <AutorizacionModal
        isOpen={showAutorizacionModal}
        onClose={() => setShowAutorizacionModal(false)}
        onSave={handleSaveAutorizacion}
        initialData={autorizacionData}
      />

      <StockModals
        showSavarModal={showSavarStockModal}
        onCloseSavar={() => setShowSavarStockModal(false)}
        showPickupModal={showPickupStockModal}
        onClosePickup={() => setShowPickupStockModal(false)}
        showValidationModal={showValidationModal}
        onCloseValidation={() => setShowValidationModal(false)}
        validationMessage={validationErrorMessage}
      />
    </Layout>
  );
}
