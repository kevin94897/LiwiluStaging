// ===== pages/productos.tsx =====
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';

export const revalidate = 0;

export default function Productos() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <>
            <Layout title="Liwilu - Compra por MAYOR" description="Liwilu - Tienda por mayor">
                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <h2 className="text-3xl font-bold mb-8 text-teal-900">Catálogo de Productos</h2>

                    <div className="bg-white rounded-xl p-12 text-center shadow-lg">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-2xl font-bold mb-4">Próximamente</h3>
                        <p className="text-gray-600 mb-6">
                            Estamos conectando con PrestaShop para mostrarte todos nuestros productos
                        </p>

                        <div className="card card-xl">
                            {/* contenido */}
                        </div>
                        <Link href="/">
                            <button className="btn btn-primary">
                                ← Volver al inicio
                            </button>
                        </Link>
                    </div>
                </div>
            </Layout>
        </>
    );
}
