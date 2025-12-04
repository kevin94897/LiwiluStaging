// components/StoresModal.tsx
'use client';

import { useState } from 'react';
// import { X } from 'lucide-react';

interface Store {
    name: string;
    address: string;
}

interface StoresByLocation {
    [key: string]: Store[];
}

const storesData: StoresByLocation = {
    'Santa Anita': [
        {
            name: 'Tienda Santa Anita',
            address: 'Urb. Cultura Paruana Moderna, Calle Las Vegas, Mz. A 25, Lt. 10'
        }
    ],
    'San Luis': [
        {
            name: 'Tienda Ingenieros',
            address: 'Av. Los Ingenieros 417'
        }
    ],
    'Santa Rosa': [
        {
            name: 'Tienda Cocalenos',
            address: 'Av. Los Cocalenos 805 (a la altura de la cuadra 8 de la av. Santa Rosa)'
        }
    ],
    'Ate': [
        {
            name: 'Tienda Ate',
            address: 'Calle Santa Lucía, N° 359 - Urb. Aurora, Etapa II, Mz. E, Lt. 6, Ate'
        }
    ]
};

export default function StoresModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    return (
        <>
            {/* Link para abrir el modal */}
            <button
                onClick={() => setIsOpen(true)}
                className="font-semibold mb-4 text-white hover:text-green-300 transition-colors text-left block"
            >
                Tiendas campañas 2026
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="px-6 pb-4 pt-10 flex items-center justify-center">
                            <div className="flex items-center gap-3">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <h2 className="md:text-3xl text-xl font-bold text-black">Lista de tiendas 2026</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                {/* <X className="w-6 h-6" /> */}
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 pt-0 md:p-12 md:pt-0 overflow-y-auto max-h-[calc(90vh-80px)]">
                            {/* Mapa placeholder */}
                            <div className="bg-gray-100 rounded-lg h-64 mb-6 flex items-center justify-center">
                                <p className="text-gray-500">Mapa de ubicaciones</p>
                            </div>

                            {/* Buscador */}
                            <div className="mb-6">
                                <div className="relative">
                                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Buscar ubicación..."
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-sm focus:border-green-500 focus:outline-none transition-colors text-primary-dark"
                                    />
                                </div>
                            </div>

                            {/* Lista de ubicaciones con dropdown */}
                            <div className="space-y-3">
                                {Object.entries(storesData).map(([location, stores]) => (
                                    <div key={location} className="border-2 border-gray-200 rounded-sm overflow-hidden">
                                        {/* Header del dropdown */}
                                        <button
                                            onClick={() => setSelectedLocation(selectedLocation === location ? null : location)}
                                            className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${selectedLocation === location
                                                ? 'bg-green-50'
                                                : 'bg-white hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span className="font-semibold text-gray-900 text-left">{location}</span>
                                            </div>
                                            <svg
                                                className={`w-5 h-5 text-gray-400 transition-transform ${selectedLocation === location ? 'rotate-180' : ''
                                                    }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Contenido del dropdown */}
                                        {selectedLocation === location && (
                                            <div className="bg-white border-t-2 border-gray-200">
                                                {stores.map((store, index) => (
                                                    <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                                        <h3 className="font-semibold text-gray-900 mb-2">{store.name}</h3>
                                                        <p className="text-gray-600 text-sm">{store.address}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ============================================
// ACTUALIZACIÓN DEL FOOTER
// ============================================

/*
Para usar el modal en el Footer, importa el componente y reemplaza el h3 de "Tiendas campañas 2026":

// components/Footer.tsx
import StoresModal from '@/components/StoresModal';

// ...

// En la Columna 2, reemplaza:
<h3 className="font-semibold mb-4 text-white">
  Tiendas campañas 2026
</h3>

// Por:
<StoresModal />

*/