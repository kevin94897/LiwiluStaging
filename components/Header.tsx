'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { IoMenu } from 'react-icons/io5';
import { HiChevronRight } from 'react-icons/hi';
import { useCart } from '@/context/CartContext';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';

import {
  FaRegHeart,
  FaUser,
  FaShoppingCart,
  FaTruck,
  FaBoxes,
  FaSearch,
} from 'react-icons/fa';
import logo from '../public/images/liwilu_logo.png';

const topLinks = [
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/campanas', label: 'Tiendas campañas 2026' },
  { href: '/registro', label: 'Regístrate' },
  {
    href: '/favoritos',
    label: 'Mis favoritos',
    icon: <FaRegHeart size={12} />,
  },
  { href: '/politicas', label: 'Políticas de compra' },
];

const categories = [
  { href: '/c/libros', label: 'Libros', highlight: true },
  { href: '/c/hogar-limpieza', label: 'Productos para el hogar y limpieza' },
  { href: '/c/tecnologia', label: 'Tecnología' },
  { href: '/c/uniformes', label: 'Uniformes' },
  { href: '/c/utiles', label: 'Útiles escolares y de oficina' },
  { href: '/c/ofertas', label: 'Ofertas' },
  { href: '/c/trimegisto', label: 'Trimegisto', highlightBottom: true },
];

function Logo({ width = 100, height = 40, className = '' }) {
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
          ? 'px-4 py-2'
          : 'px-3 py-1 w-full max-w-md xl:min-w-[300px] lg:max-w-[250px]'
        }`}
    >
      <input
        type="search"
        placeholder="¿Qué estás buscando?"
        className={`flex-grow px-2 outline-none bg-transparent ${isMobile
            ? 'text-[15px] placeholder-gray-400 text-gray-800'
            : 'py-1 text-sm text-gray-700'
          }`}
      />
      <button
        className={`${isMobile ? 'ml-2 hover:text-primary-light' : ''
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

function QuickActions({ isMobile = false, onOpenLogin, onOpenRegister }: QuickActionsProps) {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const [isOpen, setIsOpen] = useState(false);
  const loginRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (loginRef.current && !loginRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (isMobile) {
    return (
      <div className="flex items-center gap-4">
        <FaBoxes size={20} />
        <FaTruck size={20} />
        <button onClick={onOpenLogin}>
          <FaUser size={18} />
        </button>
        <Link href="/carrito" className="relative">
          <FaShoppingCart size={18} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-[#0b2d2d] font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 text-sm relative" ref={loginRef}>
      <Link
        href="/mayorista"
        className="flex items-center gap-2 hover:text-green-400 transition"
      >
        <FaBoxes /> Compra mayorista
      </Link>
      <Link
        href="/pedido"
        className="flex items-center gap-2 hover:text-green-400 transition"
      >
        <FaTruck /> Sigue tu pedido
      </Link>
      
      {/* Botón de apertura */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 transition text-sm font-medium"
      >
        <FaUser /> Mi cuenta
      </button>
      
      {/* Caja desplegable */}
      {isOpen && (
        <div className="absolute top-5 right-0 mt-3 w-[420px] rounded-2xl bg-white text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)] p-6 z-50">
          <div className="flex divide-x divide-gray-200">
            {/* 🔹 Columna izquierda */}
            <div className="flex-1 pr-4 text-left flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-primary-dark">Bienvenidos</h3>
                <p className="text-xs text-gray-500 mt-2 leading-none">
                  Inicia sesión y podrás consultar el estado de tus pedidos y todo
                  lo que necesites.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenLogin();
                }}
                className="inline-block w-full bg-primary font-medium text-sm py-2 rounded-full hover:bg-primary-light transition text-center text-white mt-4"
              >
                Iniciar sesión
              </button>
            </div>

            {/* 🔹 Columna derecha */}
            <div className="flex-1 pl-4 text-left leading-none">
              <h3 className="font-semibold text-primary-dark">
                Regístrate para una experiencia completa
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Recibirás notificaciones de ofertas y promociones.
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenRegister();
                }}
                className="mt-4 inline-block w-full border border-primary text-primary font-medium text-sm py-2 rounded-full hover:bg-primary/10 transition text-center"
              >
                Crear cuenta
              </button>
            </div>
          </div>
        </div>
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

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Detectar scroll para activar efecto sticky
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔹 Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileCatsOpen(false);
      }
    }

    if (mobileCatsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileCatsOpen]);

  return (
    <>
      <header
        className={`w-full text-white fixed top-0 left-0 z-50 transition-all duration-300 ${isSticky
            ? 'backdrop-blur-md bg-[#0b2d2d]/90 shadow-lg'
            : 'bg-transparent'
          }`}
      >
        {/* 🔹 TOP BAR */}
        <div
          className={`bg-primary-light text-[12px] lg:text-xs py-1 px-4 transition-all duration-300 ${isSticky ? 'hidden lg:block' : ''
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

        {/* 🔹 MAIN HEADER */}
        <div
          className={`py-3 transition-all duration-300 ${isSticky ? 'bg-[#0b2d2d]/95 shadow-xl' : 'bg-[#0b2d2d]'
            }`}
        >
          <div className="max-w-7xl mx-auto px-4">
            {/* ===== MOBILE ===== */}
            <div className="lg:hidden space-y-3" ref={menuRef}>
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

              {/* MENU CATEGORIAS */}
              {mobileCatsOpen && (
                <div className="overflow-hidden max-h-[70vh] overflow-y-auto mt-3">
                  <nav className="px-2 py-3">
                    <ul className="space-y-1">
                      {categories.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            onClick={() => setMobileCatsOpen(false)}
                            className={`block px-4 py-3 text-white transition-colors ${c.highlight
                                ? 'bg-primary hover:bg-primary rounded-xl font-medium text-[#0b2d2d]'
                                : c.highlightBottom
                                  ? 'text-white hover:bg-white/10 rounded-xl font-bold'
                                  : 'text-white/90 hover:bg-white/10 rounded-lg'
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
                <div className="relative">
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
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              onClick={() => setMobileCatsOpen(false)}
                              className={`flex items-center justify-between px-4 py-3 text-sm transition ${c.highlight
                                  ? 'bg-primary text-white hover:bg-primary-light'
                                  : c.highlightBottom
                                    ? 'bg-gray-100 font-bold hover:bg-gray-200'
                                    : 'hover:bg-gray-50'
                                }`}
                            >
                              <span className="truncate">{c.label}</span>
                              <HiChevronRight
                                className={
                                  c.highlight ? 'text-white' : 'text-gray-400'
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

      {/* Modales */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
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
    </>
  );
}