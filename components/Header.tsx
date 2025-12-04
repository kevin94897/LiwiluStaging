"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { IoMenu } from "react-icons/io5";
import { HiChevronRight } from "react-icons/hi";
import { useCart } from "@/context/CartContext";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import { useAuth } from "@/hooks/useAuth";

import {
  FaRegHeart,
  FaUser,
  FaShoppingCart,
  FaTruck,
  FaBoxes,
  FaSearch,
  FaSignOutAlt,
  FaShoppingBag,
  FaHeart,
  FaUserCircle,
} from "react-icons/fa";
import logo from "../public/images/liwilu_logo.png";
import {
  TrimegistoDNIModal,
  TrimegistoRegisterModal,
} from "./TrimegistoDNIModal";
import Button from "./ui/Button";

const topLinks = [
  { href: "/nosotros", label: "Nosotros" },
  { href: "/campanas", label: "Tiendas campañas 2026" },
  { href: "/registro", label: "Regístrate" },
  {
    href: "/mi-cuenta/mis-favoritos",
    label: "Mis favoritos",
    icon: <FaRegHeart size={12} />,
  },
  { href: "/politicas", label: "Políticas de compra" },
];

const categories = [
  { href: "/c/libros", label: "Libros", highlight: true, isModal: false },
  {
    href: "/c/hogar-limpieza",
    label: "Productos para el hogar y limpieza",
    isModal: false,
  },
  { href: "/c/tecnologia", label: "Tecnología", isModal: false },
  { href: "/c/uniformes", label: "Uniformes", isModal: false },
  { href: "/c/utiles", label: "Útiles escolares y de oficina", isModal: false },
  { href: "/c/ofertas", label: "Ofertas", isModal: false },
  { href: "#", label: "Trimegisto", highlightBottom: true, isModal: true },
];

function Logo({ width = 100, height = 40, className = "" }) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src={logo}
        alt="Liwilu Logo"
        width={width}
        height={height}
        priority
      />
    </Link>
  );
}

function SearchBar({ isMobile = false }) {
  return (
    <div
      className={`flex items-center bg-white rounded-full ${isMobile
          ? "px-4 py-2"
          : "px-3 py-1 w-full max-w-md xl:min-w-[300px] lg:max-w-[250px]"
        }`}
    >
      <input
        type="search"
        placeholder="¿Qué estás buscando?"
        className={`flex-grow px-2 outline-none bg-transparent ${isMobile
            ? "text-[15px] placeholder-gray-400 text-gray-800"
            : "py-1 text-sm text-gray-700"
          }`}
      />
      <button
        className={`${isMobile ? "ml-2 hover:text-primary-light" : ""
          } text-gray-700 transition-colors`}
      >
        <FaSearch size={18} />
      </button>
    </div>
  );
}

interface QuickActionsProps {
  isMobile?: boolean;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

function QuickActions({
  isMobile = false,
  onOpenLogin,
  onOpenRegister,
}: QuickActionsProps) {
  const { getCartCount } = useCart();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const cartCount = getCartCount();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const loginRef = useRef<HTMLDivElement | null>(null);

  // 🔹 DEBUG: Log para verificar el estado
  useEffect(() => {
    console.log("QuickActions render:", {
      isLoading,
      isAuthenticated,
      user,
      userName: user?.firstName
    });
  }, [isLoading, isAuthenticated, user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        loginRef.current &&
        !loginRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    if (!confirm("¿Estás seguro que deseas cerrar sesión?")) return;

    setIsLoggingOut(true);
    try {
      await logout();
      setIsOpen(false);
    } catch (error: unknown) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
      if (error instanceof Error) alert(error.message);
      else alert("Error desconocido al cerrar sesión");
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center gap-6 text-sm">
        <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex items-center gap-4">
        <FaBoxes size={20} />
        <FaTruck size={20} />
        {isAuthenticated ? (
          <button onClick={() => setIsOpen(!isOpen)} className="relative">
            <FaUser size={18} />
          </button>
        ) : (
          <button onClick={onOpenLogin}>
            <FaUser size={18} />
          </button>
        )}
        <Link href="/carrito" className="relative">
          <FaShoppingCart size={18} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-[#0b2d2d] font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Menu mobile del usuario autenticado */}
        {isOpen && isAuthenticated && (
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="absolute right-4 top-16 w-64 bg-white rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <p className="font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="py-2">
                <Link
                  href="/mi-cuenta"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUserCircle /> Mi cuenta
                </Link>
                <Link
                  href="/mis-pedidos"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaShoppingBag /> Mis pedidos
                </Link>
                <Link
                  href="/mis-favoritos"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaHeart /> Favoritos
                </Link>
              </div>
              <div className="border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <FaSignOutAlt />
                  {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 text-sm relative" ref={loginRef}>
      <Link
        href="/rastreo"
        className="flex items-center gap-2 hover:text-green-400 transition"
      >
        <FaTruck /> Sigue tu pedido
      </Link>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 transition text-sm font-medium hover:text-green-400"
      >
        <FaUser />
        <span>
          {isAuthenticated && user?.firstName ? user.firstName : "Mi cuenta"}
        </span>
      </button>

      {isOpen && (
        <>
          {!isAuthenticated ? (
            // Menu para usuarios NO autenticados
            <div className="absolute top-5 right-0 mt-3 w-[420px] rounded-2xl bg-white text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)] p-6 z-50">
              <div className="flex divide-x divide-gray-200">
                <div className="flex-1 pr-4 text-left flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-primary-dark">
                      Bienvenidos
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 leading-none">
                      Inicia sesión y podrás consultar el estado de tus pedidos
                      y todo lo que necesites.
                    </p>
                  </div>

                  <Button
                    size="sm"
                    className="w-full"
                    variant="primary"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenLogin();
                    }}
                  >
                    Iniciar sesión
                  </Button>
                </div>

                <div className="flex-1 pl-4 text-left leading-none">
                  <h3 className="font-semibold text-primary-dark">
                    Regístrate para una experiencia completa
                  </h3>
                  <p className="text-xs text-gray-500 mt-2">
                    Recibirás notificaciones de ofertas y promociones.
                  </p>
                  <Button
                    size="sm"
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenRegister();
                    }}
                  >
                    Crear cuenta
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Menu para usuarios AUTENTICADOS
            <div className="absolute top-5 right-0 mt-3 w-64 rounded-2xl bg-white text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
              {/* Header del menú */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              {/* Opciones del menú */}
              <div className="py-2">
                <Link
                  href="/mi-cuenta"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <FaUserCircle size={18} />
                  Mi cuenta
                </Link>

                <Link
                  href="/mi-cuenta/mis-pedidos"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <FaShoppingBag size={18} />
                  Mis pedidos
                </Link>

                <Link
                  href="/mi-cuenta/direcciones"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <FaUser size={18} />
                  Mis direcciones
                </Link>

                <Link
                  href="/mi-cuenta/mis-favoritos"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <FaHeart size={18} />
                  Favoritos
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSignOutAlt size={18} />
                  {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <Link
        href="/carrito"
        className="relative hover:text-green-400 transition"
      >
        <FaShoppingCart size={18} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}

export default function Header() {
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [trimegistoDNIModalOpen, setTrimegistoDNIModalOpen] = useState(false);
  const [trimegistoRegisterModalOpen, setTrimegistoRegisterModalOpen] =
    useState(false);
  const [isFromTrimegisto, setIsFromTrimegisto] = useState(false);

  const desktopMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(event.target as Node)
      ) {
        setMobileCatsOpen(false);
      }
    }

    if (mobileCatsOpen && window.innerWidth >= 1024) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileCatsOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileCatsOpen(false);
      }
    }

    if (mobileCatsOpen && window.innerWidth < 1024) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileCatsOpen]);

  return (
    <>
      <header
        className={`w-full text-white fixed top-0 left-0 z-50 transition-all duration-300 ${isSticky
            ? "backdrop-blur-md bg-[#0b2d2d]/90 shadow-lg"
            : "bg-transparent"
          }`}
      >
        <div
          className={`bg-primary-light text-[12px] lg:text-xs py-1 px-4 transition-all duration-300 ${isSticky ? "hidden lg:block" : ""
            }`}
        >
          <div className="max-w-3xl mx-auto flex justify-between items-center flex-wrap">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
              {topLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="flex items-center gap-1 hover:underline shrink-0 text-primary-dark"
                >
                  {link.icon && link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
            <span className="hidden lg:block text-primary-dark">
              Contáctanos: (01) 7020868 - Anexo 2
            </span>
          </div>
        </div>

        <div
          className={`py-3 transition-all duration-300 ${isSticky ? "bg-[#0b2d2d]/95 shadow-xl" : "bg-[#0b2d2d]"
            }`}
        >
          <div className="max-w-7xl mx-auto px-4">
            {/* ===== MOBILE ===== */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-end md:items-center justify-between">
                <Logo width={120} height={36} className="mr-5" />
                <QuickActions
                  isMobile
                  onOpenLogin={() => setLoginModalOpen(true)}
                  onOpenRegister={() => setRegisterModalOpen(true)}
                />
              </div>
              <div className="flex items-center gap-1 md:gap-3">
                <button
                  type="button"
                  onClick={() => setMobileCatsOpen(!mobileCatsOpen)}
                  className="flex items-center gap-2 p-2 transition"
                >
                  <IoMenu className="text-[22px]" />
                  <span className="text-sm font-medium md:block hidden">
                    Categorías
                  </span>
                </button>
                <div className="flex-1">
                  <SearchBar isMobile />
                </div>
              </div>

              {mobileCatsOpen && (
                <div
                  ref={mobileMenuRef}
                  className="overflow-hidden max-h-[70vh] overflow-y-auto mt-3"
                >
                  <nav className="px-2 py-3">
                    <ul className="space-y-1">
                      {categories.map((c) => (
                        <li key={c.label}>
                          <Link
                            href={c.isModal ? "#" : c.href}
                            onClick={
                              c.isModal
                                ? (e) => {
                                  e.preventDefault();
                                  setTrimegistoDNIModalOpen(true);
                                  setMobileCatsOpen(false);
                                }
                                : () => setMobileCatsOpen(false)
                            }
                            className={`block px-4 py-3 text-white transition-colors ${c.highlight
                                ? "bg-primary hover:bg-primary-light rounded-xl font-medium text-[#0b2d2d]"
                                : c.highlightBottom
                                  ? "text-white hover:bg-white/10 rounded-xl font-bold"
                                  : "text-white/90 hover:bg-white/10 rounded-lg"
                              }`}
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}
            </div>

            {/* ===== DESKTOP ===== */}
            <div className="hidden lg:flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="relative" ref={desktopMenuRef}>
                  <button
                    type="button"
                    onClick={() => setMobileCatsOpen(!mobileCatsOpen)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md transition"
                  >
                    <IoMenu className="text-lg" />
                    <span className="text-sm font-medium">Categorías</span>
                  </button>

                  {mobileCatsOpen && (
                    <div className="absolute left-0 top-full mt-3 w-72 z-50 rounded-2xl bg-white text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)] overflow-hidden">
                      <ul className="divide-y divide-gray-200">
                        {categories.map((c) => (
                          <li key={c.label}>
                            <Link
                              href={c.isModal ? "#" : c.href}
                              onClick={
                                c.isModal
                                  ? (e) => {
                                    e.preventDefault();
                                    setTrimegistoDNIModalOpen(true);
                                    setMobileCatsOpen(false);
                                  }
                                  : () => setMobileCatsOpen(false)
                              }
                              className={`flex items-center justify-between px-4 py-3 text-sm transition ${c.highlight
                                  ? "bg-primary text-white hover:bg-primary-light"
                                  : c.highlightBottom
                                    ? "bg-gray-100 font-bold hover:bg-gray-200"
                                    : "hover:bg-gray-50"
                                }`}
                            >
                              <span className="truncate">{c.label}</span>
                              <HiChevronRight
                                className={
                                  c.highlight ? "text-white" : "text-gray-400"
                                }
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <SearchBar />
              </div>
              <Logo width={100} height={40} className="justify-center" />
              <QuickActions
                onOpenLogin={() => setLoginModalOpen(true)}
                onOpenRegister={() => setRegisterModalOpen(true)}
              />
            </div>
          </div>
        </div>

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </header>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          setIsFromTrimegisto(false);
        }}
        onSwitchToRegister={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
          setIsFromTrimegisto(false);
        }}
        fromTrimegisto={isFromTrimegisto}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
      />

      <TrimegistoDNIModal
        isOpen={trimegistoDNIModalOpen}
        onClose={() => setTrimegistoDNIModalOpen(false)}
        onValidated={() => {
          setTrimegistoDNIModalOpen(false);
          setIsFromTrimegisto(true);
          setLoginModalOpen(true);
        }}
        onNewUser={() => {
          setTrimegistoDNIModalOpen(false);
          setTrimegistoRegisterModalOpen(true);
        }}
      />

      <TrimegistoRegisterModal
        isOpen={trimegistoRegisterModalOpen}
        onClose={() => setTrimegistoRegisterModalOpen(false)}
        onSuccess={() => {
          setTrimegistoRegisterModalOpen(false);
          setIsFromTrimegisto(true);
          setLoginModalOpen(true);
        }}
      />
    </>
  );
}