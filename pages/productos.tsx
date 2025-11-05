// ===== pages/productos.tsx =====
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Productos() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <Head>
        <title>Productos - Liwilu</title>
        <meta name="description" content="Catálogo de productos Liwilu" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-900 to-teal-700 text-white py-3 px-6 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/">
              <div className="text-2xl font-bold cursor-pointer">Liwilu</div>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="hover:text-green-300">Inicio</Link>
              <Link href="/productos" className="text-green-300 font-semibold">Productos</Link>
            </nav>
            <div className="flex items-center gap-4">
              <input 
                type="search" 
                placeholder="Buscar productos..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-full text-black w-64"
              />
              <div className="relative cursor-pointer">
                <span className="text-xl">🛒</span>
                <span className="absolute -top-2 -right-2 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">0</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-3xl font-bold mb-8 text-teal-900">Catálogo de Productos</h2>
          
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold mb-4">Próximamente</h3>
            <p className="text-gray-600 mb-6">
              Estamos conectando con PrestaShop para mostrarte todos nuestros productos
            </p>
            <Link href="/">
              <button className="bg-teal-800 hover:bg-teal-900 text-white px-8 py-3 rounded-lg font-semibold">
                ← Volver al inicio
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-teal-900 text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p>© 2025 Liwilu. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
