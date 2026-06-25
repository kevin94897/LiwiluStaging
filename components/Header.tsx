"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import logger from "@/lib/logger";
import { useMayorista } from "@/context/MayoristaContext";
import MayoristaBanner from "@/components/MayoristaBanner";
import { IoMenu } from "react-icons/io5";
import { HiChevronRight } from "react-icons/hi";
import { useCart } from "@/context/CartContext";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { showToast } from "@/lib/notifications";
import StoresModal from "@/components/StoresModal";
import { TrimegistoDNIModal, TrimegistoRegisterModal } from "@/components/TrimegistoDNIModal";

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
  FaTimes,
  FaHistory,
} from "react-icons/fa";
import logo from "../public/images/liwilu_logo.png";
import Button from "./ui/Button";
import { fetchHeaderAcf, HeaderAcfData } from "@/lib/acf-home";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
function resolveImgUrl(url?: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  acfLogoUrl?: string;
}

function Logo({ className = "", width = 120, height = 48, acfLogoUrl }: LogoProps) {
  const src = acfLogoUrl ? resolveImgUrl(acfLogoUrl) : logo;
  return (
    <Link
      href="/"
      className={`flex items-center max-w-[90px] md:max-w-[120px] ${className}`}
    >
      <Image
        src={src}
        alt="Liwilu Logo"
        width={width}
        height={height}
        priority
        sizes="(max-width: 640px) 96px, 120px"
        className="h-auto"
        style={{ height: "auto", maxWidth: width }}
        unoptimized={!!acfLogoUrl}
      />
    </Link>
  );
}

const SEARCH_HISTORY_KEY = 'liwilu_search_history';
const MAX_HISTORY = 8;

function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')       // quitar tildes: á→a, é→e
    .replace(/[Nº°#ª\.\,;:!\?¡¿\(\)\[\]\{\}'"@&\*\+=\$\\\/\|~`^<>]/g, ' ') // puntuación → espacio
    .replace(/\s+/g, ' ')
    .trim();
}

function getSearchHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]'); } catch { return []; }
}

function saveSearchHistory(term: string, current: string[]): string[] {
  const next = [term, ...current.filter(h => h !== term)].slice(0, MAX_HISTORY);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
  return next;
}

function SearchBar({ isMobile = false }) {
  const router = useRouter();
  const { isMayorista } = useMayorista();
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipDebounce = useRef(false);

  // Sync field with URL
  useEffect(() => {
    if (router.isReady) {
      skipDebounce.current = true;
      setSearchQuery((router.query.search as string) || "");
    }
  }, [router.isReady, router.query.search]);

  // Debounced live search — only fires on /productos
  useEffect(() => {
    if (skipDebounce.current) { skipDebounce.current = false; return; }
    const q = normalizeSearch(searchQuery);
    if (!q || router.pathname !== '/productos') return;
    const timer = setTimeout(() => {
      const qs = isMayorista ? `&mayorista=true` : '';
      router.push(`/productos?search=${encodeURIComponent(q)}${qs}`, undefined, { scroll: false });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = normalizeSearch(searchQuery);
    if (!q) return;
    setHistory(prev => saveSearchHistory(q, prev));
    setShowHistory(false);
    const qs = isMayorista ? `&mayorista=true` : '';
    router.push(`/productos?search=${encodeURIComponent(q)}${qs}`);
  };

  const handleHistoryClick = (term: string) => {
    const q = normalizeSearch(term);
    setSearchQuery(q);
    setHistory(prev => saveSearchHistory(q, prev));
    setShowHistory(false);
    const qs = isMayorista ? `&mayorista=true` : '';
    router.push(`/productos?search=${encodeURIComponent(q)}${qs}`);
  };

  const handleFocus = () => {
    setHistory(getSearchHistory());
    setShowHistory(true);
  };

  const visibleHistory = history.filter(h =>
    !searchQuery.trim() || h.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      className={`relative ${isMobile ? '' : 'w-full max-w-md xl:min-w-[300px] lg:max-w-[250px]'}`}
    >
      <form
        onSubmit={handleSearch}
        className={`flex items-center bg-white rounded-full ${isMobile ? "px-4 py-2" : "px-3 py-1 w-full"}`}
      >
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder="¿Qué estás buscando?"
          className={`flex-grow px-2 outline-none bg-transparent ${isMobile
            ? "text-[15px] placeholder-gray-400 text-gray-800"
            : "py-1 text-sm text-gray-700"
            }`}
        />
        <button
          type="submit"
          className={`${isMobile ? "ml-2 hover:text-primary-light" : ""} text-gray-700 transition-colors`}
        >
          <FaSearch size={18} />
        </button>
      </form>

      {showHistory && visibleHistory.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="px-3 py-2 flex items-center justify-between border-b border-gray-50">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Búsquedas recientes</span>
            <button
              onClick={() => {
                localStorage.removeItem(SEARCH_HISTORY_KEY);
                setHistory([]);
                setShowHistory(false);
              }}
              className="text-[11px] text-gray-400 hover:text-red-500 transition"
            >
              Limpiar
            </button>
          </div>
          <ul>
            {visibleHistory.map((term) => (
              <li key={term} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer group">
                <FaHistory size={11} className="text-gray-300 shrink-0" />
                <button
                  className="flex-1 text-left text-sm text-gray-700 truncate"
                  onClick={() => handleHistoryClick(term)}
                >
                  {term}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = history.filter(h => h !== term);
                    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
                    setHistory(next);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition p-0.5"
                >
                  <FaTimes size={10} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface QuickActionsProps {
  isMobile?: boolean;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  acfMain?: { mayorista?: boolean; mayoristaTitulo?: string; enlace?: { url: string; text?: string } };
}

function QuickActions({
  isMobile = false,
  onOpenLogin,
  onOpenRegister,
  acfMain,
}: QuickActionsProps) {
  const { getCartCount, clearCart } = useCart();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const cartCount = getCartCount();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const loginRef = useRef<HTMLDivElement | null>(null);

  const { isMayorista, enableMayorista, disableMayorista } = useMayorista();
  const router = useRouter();
  const [mayoristaMenuOpen, setMayoristaMenuOpen] = useState(false);
  const mayoristaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mayoristaRef.current &&
        !mayoristaRef.current.contains(event.target as Node)
      ) {
        setMayoristaMenuOpen(false);
      }
    }
    if (mayoristaMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mayoristaMenuOpen]);

  // 🔹 DEBUG: Log para verificar el estado
  // useEffect(() => {
  //   logger.log("QuickActions render:", {
  //     isLoading,
  //     isAuthenticated,
  //     user,
  //     userName: user?.firstName,
  //   });
  // }, [isLoading, isAuthenticated, user]);

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
      logger.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
      if (error instanceof Error) showToast(error.message, "error");
      else showToast("Error desconocido al cerrar sesión", "error");
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

  const handleMayoristaClick = () => {
    if (isMayorista) {
      setMayoristaMenuOpen(!mayoristaMenuOpen);
    } else {
      clearCart();
      enableMayorista();
      router.push('/productos?mayorista=true');
    }
  };

  if (isMobile) {
    return (
      <div className="flex items-center gap-4">
        <div className="relative" ref={mayoristaRef}>
          <button onClick={handleMayoristaClick} className={`relative flex items-center justify-center ${isMayorista ? 'text-primary' : ''}`}>
            <div className="relative">
              <FaBoxes size={20} />
              <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isMayorista ? 'bg-red-500' : 'bg-primary'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isMayorista ? 'bg-red-500' : 'bg-primary'}`}></span>
              </span>
            </div>
          </button>
          {isMayorista && mayoristaMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-50">
              <button
                onClick={() => {
                  clearCart();
                  disableMayorista();
                  setMayoristaMenuOpen(false);
                  const { mayorista, ...rest } = router.query;
                  router.replace({ pathname: router.pathname, query: rest }, undefined, { scroll: false });
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg transition-colors"
              >
                <FaTimes /> Salir
              </button>
            </div>
          )}
        </div>
        <Link href={acfMain?.enlace?.url || '/rastreo'} className="relative">
          <FaTruck size={20} />
        </Link>
        {isAuthenticated ? (
          <Link href="/mi-cuenta" className="relative">
            <FaUser size={18} />
          </Link>
        ) : (
          <button onClick={onOpenLogin}>
            <FaUser size={18} />
          </button>
        )}
        <Link href="/carrito" className="relative">
          <FaShoppingCart size={18} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-[#0b2d2d] font-semibold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
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
      <div className="relative" ref={mayoristaRef}>
        {acfMain?.mayorista !== false && (
          <button
            onClick={handleMayoristaClick}
            className={`relative flex items-center gap-2 transition font-medium ${isMayorista ? 'text-primary' : 'hover:text-green-400'}`}
          >
            <div className="relative flex items-center justify-center">
              <FaBoxes size={18} />
              <span className="absolute -top-1.5 -right-2 flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isMayorista ? 'bg-red-500' : 'bg-primary'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isMayorista ? 'bg-red-500' : 'bg-primary'}`}></span>
              </span>
            </div>
            <span>{isMayorista ? `${acfMain?.mayoristaTitulo || 'Mayorista'} ✓` : (acfMain?.mayoristaTitulo || 'Compra Mayorista')}</span>
          </button>
        )}
        {isMayorista && mayoristaMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-50 transition-all duration-200">
            <button
              onClick={() => {
                clearCart();
                disableMayorista();
                setMayoristaMenuOpen(false);
                const { mayorista, ...rest } = router.query;
                router.replace({ pathname: router.pathname, query: rest }, undefined, { scroll: false });
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg transition-colors"
            >
              <FaTimes /> Salir
            </button>
          </div>
        )}
      </div>
      {acfMain?.enlace ? (
        <Link href={acfMain.enlace.url} className="flex items-center gap-2 hover:text-green-400 transition">
          <FaTruck /> {acfMain.enlace.text || acfMain.enlace.url}
        </Link>
      ) : (
        <Link href="/rastreo" className="flex items-center gap-2 hover:text-green-400 transition">
          <FaTruck /> Sigue tu pedido
        </Link>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 transition text-sm font-medium hover:text-green-400"
      >
        <FaUser />
        <span>
          {isAuthenticated
            ? user?.firstName || user?.email?.split("@")[0] || "Mi cuenta"
            : "Mi cuenta"}
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
              <div className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName || user?.email?.split("@")[0] || "Usuario"}{" "}
                  {user?.lastName || ""}
                </p>
                {user?.email && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {user.email}
                  </p>
                )}
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

interface MenuCategory {
  href: string;
  label: string;
  isModal: boolean;
  highlight: boolean;
  highlightBottom?: boolean;
  linkRewrite?: string;
  isTrimegistoGate?: boolean;
  children?: MenuCategory[];
}

// Aplana el árbol de categorías del menú a una lista plana con la profundidad
// de cada nodo, para renderizar las subcategorías con sangría.
function flattenMenu(
  cats: MenuCategory[],
  depth = 0,
): { cat: MenuCategory; depth: number }[] {
  return cats.flatMap((cat) => [
    { cat, depth },
    ...flattenMenu(cat.children ?? [], depth + 1),
  ]);
}

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const { isMayorista } = useMayorista();
  const isTrimegistoUser = isAuthenticated && (
    (user?.role || "").toUpperCase() === "TRIMEGISTO" ||
    (user?.role || "").toUpperCase() === "TRISMEGISMO"
  );
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [acf, setAcf] = useState<HeaderAcfData>({});

  useEffect(() => {
    fetchHeaderAcf().then(setAcf).catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { getLevelTwoCategories, sortByLeadingNumber } = await import("@/lib/catalog");
        const cats = await getLevelTwoCategories(isMayorista);

        const mayoristaQs = isMayorista ? '&mayorista=true' : '';
        const mapCat = (c: (typeof cats)[number]): MenuCategory => ({
          href: `/productos?categoryIds=${c.id}${mayoristaQs}`,
          label: c.name,
          isModal: false,
          highlight: false,
          linkRewrite: c.linkRewrite,
          // Subcategorías ordenadas por su número inicial ("1ro", "2do", …).
          children: sortByLeadingNumber(
            (c.children ?? []).map(mapCat),
            (x) => x.label,
          ),
        });
        const formattedCats: MenuCategory[] = cats.map(mapCat);

        // Botón manual que abre el modal DNI — solo visible para usuarios NO Trimegisto
        const trimegistoGateItem: MenuCategory = {
          href: "/#trimegisto",
          label: "Trimegisto",
          isModal: true,
          highlight: true,
          isTrimegistoGate: true,
        };

        setMenuCategories([...formattedCats, trimegistoGateItem]);
      } catch (error) {
        logger.error("Failed to load header categories", error);
        // Fallback or keep empty
      }
    }
    fetchCategories();
  }, [isMayorista]);

  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [trimegistoModalOpen, setTrimegistoModalOpen] = useState(false);
  const [trimegistoRegisterModalOpen, setTrimegistoRegisterModalOpen] = useState(false);
  const [trimegistoUserData, setTrimegistoUserData] = useState<any>(null);
  const router = useRouter();

  const desktopMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null);

  const closeTrimegistoModal = () => {
    setTrimegistoModalOpen(false);
    if (router.query.trimegisto === "true") {
      const { trimegisto, ...rest } = router.query;
      router.replace(
        {
          pathname: router.pathname,
          query: rest,
        },
        undefined,
        { shallow: true },
      );
    }
  };

  // ✅ Efecto para abrir login desde URL
  useEffect(() => {
    if (router.isReady && router.query.login === "true") {
      setLoginModalOpen(true);
    }
  }, [router.isReady, router.query]);

  // ✅ Efecto para abrir trimegisto desde URL
  useEffect(() => {
    if (router.isReady && router.query.trimegisto === "true") {
      setTrimegistoModalOpen(true);
    }
  }, [router.isReady, router.query]);

  // ... (keeping scroll effect)
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ... (keeping click outside effects)
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
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileToggleRef.current &&
        !mobileToggleRef.current.contains(event.target as Node)
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

  // Categorías visibles aplanadas con su profundidad (incluye subcategorías
  // anidadas). El filtro Trimegisto se aplica a nivel raíz; al aplanar después,
  // las subcategorías de una raíz oculta se omiten también.
  const topLevelMenu = menuCategories.filter((c) => {
    if (c.isTrimegistoGate) return !isTrimegistoUser;
    if (c.linkRewrite === "trimegisto") return isTrimegistoUser;
    return true;
  });
  // Versión aplanada (con sangría) para el acordeón móvil, donde no hay hover.
  const visibleMenu = flattenMenu(topLevelMenu);

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
              {/* Enlace 1 */}
              {acf.topHeader?.enlace && (
                <Link href={acf.topHeader.enlace.url} className="flex items-center gap-1 hover:underline shrink-0 text-primary-dark">
                  {acf.topHeader.enlace.text || acf.topHeader.enlace.url}
                </Link>
              )}
              {/* Tiendas modal */}
              {acf.topHeader?.tiendas && (
                <StoresModal buttonClassName="flex items-center gap-1 hover:underline shrink-0 text-primary-dark" />
              )}
              {/* Regístrate */}
              {!isAuthenticated && acf.topHeader?.boton1 && (
                <button onClick={() => setRegisterModalOpen(true)} className="flex items-center gap-1 hover:underline shrink-0 text-primary-dark">
                  Regístrate
                </button>
              )}
              {/* Mis favoritos */}
              {acf.topHeader?.boton2 && (
                <Link
                  href="/mi-cuenta/mis-favoritos"
                  className="flex items-center gap-1 hover:underline shrink-0 text-primary-dark"
                  onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); setLoginModalOpen(true); } }}
                >
                  <FaRegHeart size={12} /> Mis favoritos
                </Link>
              )}
              {/* Enlace 3 */}
              {acf.topHeader?.enlace3 && (
                <Link href={acf.topHeader.enlace3.url} className="flex items-center gap-1 hover:underline shrink-0 text-primary-dark">
                  {acf.topHeader.enlace3.text || acf.topHeader.enlace3.url}
                </Link>
              )}
            </div>
            {acf.topHeader?.texto && (
              <span className="hidden lg:block text-primary-dark">{acf.topHeader.texto}</span>
            )}
          </div>
        </div>

        <div
          className={`py-3 transition-all duration-300 ${isSticky ? "bg-[#0b2d2d]/95 shadow-xl" : "bg-[#0b2d2d]"} ${isMayorista ? "border-b-2 border-primary" : ""}`}
        >
          <div className="max-w-7xl mx-auto px-4">
            {/* ===== MOBILE ===== */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-end md:items-center justify-between">
                <Logo width={120} height={36} className="mr-5" acfLogoUrl={acf.main?.logo} />
                <QuickActions
                  isMobile
                  onOpenLogin={() => setLoginModalOpen(true)}
                  onOpenRegister={() => setRegisterModalOpen(true)}
                  acfMain={acf.main}
                />
              </div>
              <div className="flex items-center gap-1 md:gap-3">
                <button
                  type="button"
                  ref={mobileToggleRef}
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
                      {visibleMenu.map(({ cat: c, depth }) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            style={depth > 0 ? { paddingLeft: `${16 + depth * 16}px` } : undefined}
                            className={`block px-4 py-3 transition-colors ${c.highlight
                              ? "bg-primary hover:bg-primary-light rounded-xl font-medium text-[#0b2d2d]"
                              : c.highlightBottom
                                ? "text-white hover:bg-white/10 rounded-xl font-semibold"
                                : depth > 0
                                  ? "text-white/70 hover:bg-white/10 rounded-lg text-sm"
                                  : "text-white/90 hover:bg-white/10 rounded-lg"
                              }`}
                            onClick={(e) => {
                              setMobileCatsOpen(false);
                              if (c.isModal) {
                                e.preventDefault();
                                if (c.label === "Trimegisto") {
                                  setTrimegistoModalOpen(true);
                                }
                              }
                            }}
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
                    <div className="absolute left-0 top-full mt-3 w-72 z-50 rounded-2xl bg-white text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                      <ul className="divide-y divide-gray-200">
                        {topLevelMenu.map((c) => {
                          const hasChildren = !!c.children && c.children.length > 0;
                          return (
                            <li key={c.href} className="relative group/cat first:rounded-t-2xl last:rounded-b-2xl">
                              <Link
                                href={c.href}
                                className={`group flex items-center justify-between px-4 py-3 text-sm transition ${c.highlight
                                  ? "bg-primary text-white font-medium hover:bg-primary-light"
                                  : c.highlightBottom
                                    ? "bg-gray-100 font-semibold hover:bg-primary hover:text-white"
                                    : "hover:bg-primary hover:text-white"
                                  }`}
                                onClick={(e) => {
                                  setMobileCatsOpen(false);
                                  if (c.isModal) {
                                    e.preventDefault();
                                    if (c.label === "Trimegisto") {
                                      setTrimegistoModalOpen(true);
                                    }
                                  }
                                }}
                              >
                                <span className="truncate">{c.label}</span>
                                {hasChildren && (
                                  <HiChevronRight className="text-gray-400 transition-colors group-hover:text-white" />
                                )}
                              </Link>

                              {hasChildren && (
                                <div className="invisible opacity-0 group-hover/cat:visible group-hover/cat:opacity-100 transition-opacity duration-150 absolute left-full top-0 pl-1 z-50">
                                  <ul className="w-64 rounded-2xl bg-white text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)] divide-y divide-gray-200 overflow-hidden">
                                    {c.children!.map((sub) => (
                                      <li key={sub.href}>
                                        <Link
                                          href={sub.href}
                                          className="block px-4 py-3 text-sm transition hover:bg-primary hover:text-white"
                                          onClick={() => setMobileCatsOpen(false)}
                                        >
                                          <span className="truncate">{sub.label}</span>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                <SearchBar />
              </div>
              <Logo width={100} height={40} className="justify-center" acfLogoUrl={acf.main?.logo} />
              <QuickActions
                onOpenLogin={() => setLoginModalOpen(true)}
                onOpenRegister={() => setRegisterModalOpen(true)}
                acfMain={acf.main}
              />
            </div>
          </div>
        </div>

        <MayoristaBanner marquesina={acf.main?.mayoristaMarquesina} />

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
          if (router.query.login === "true") {
            const { login, ...rest } = router.query;
            router.replace(
              {
                pathname: router.pathname,
                query: rest,
              },
              undefined,
              { shallow: true },
            );
          }
        }}
        onSwitchToRegister={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
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
        isOpen={trimegistoModalOpen}
        onClose={closeTrimegistoModal}
        onValidated={closeTrimegistoModal}
        onLoginRequired={() => {
          closeTrimegistoModal();
          setLoginModalOpen(true);
        }}
        onNewUser={(data) => {
          setTrimegistoUserData(data);
          closeTrimegistoModal();
          setTrimegistoRegisterModalOpen(true);
        }}
      />

      <TrimegistoRegisterModal
        isOpen={trimegistoRegisterModalOpen}
        onClose={() => setTrimegistoRegisterModalOpen(false)}
        onSuccess={() => {
          setTrimegistoRegisterModalOpen(false);
          // Opcional: acción tras registro exitoso
        }}
        initialData={trimegistoUserData}
      />
    </>
  );
}
