import Link from 'next/link';
import Image from 'next/image';
import logo from '../public/images/liwilu_logo.png';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-teal-900 to-teal-700 text-white py-3 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        {logo ? (
            <Image src={logo} alt="Liwilu Logo" width={120} height={50} />
          ) : (
            <span className="text-2xl font-bold">Liwilu</span>
          )}

        {/* Navegación */}
        <nav className="hidden md:flex gap-6">
          <Link href="/">Inicio</Link>
          <Link href="/productos">Productos</Link>
          <Link href="/contacto">Contacto</Link>
        </nav>

        {/* Buscador + carrito */}
        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Buscar productos..."
            className="px-4 py-2 rounded-full text-black w-64"
          />
          <div className="relative">
            <span className="text-xl">🛒</span>
            <span className="absolute -top-2 -right-2 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">0</span>
          </div>
        </div>
      </div>
    </header>
  );
}
