// components/StoresModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import logger from "@/lib/logger";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { Outfit } from "next/font/google";
import {
  getWarehouseDistricts,
  getWarehouseProvinces,
  getWarehouseMap,
  getWarehouseDetails,
  WarehouseDistrict,
  WarehouseMapItem,
  WarehouseDetail,
} from "@/lib/cart";

const WarehouseMap = dynamic(() => import("@/components/WarehouseMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
      Cargando mapa...
    </div>
  ),
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

interface Store extends WarehouseMapItem {
  idAlmacen: number;
  direccion: string;
  atencion: string;
}

// Stores data will be fetched from API

interface StoresModalProps {
  buttonClassName?: string;
  buttonText?: string;
}

export default function StoresModal({
  buttonClassName = "text-white hover:text-green-400 transition mb-4 text-sm font-semibold",
  buttonText = "Tiendas campañas 2026",
}: StoresModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pickupTab, setPickupTab] = useState<"lima" | "provincia">("lima");
  const [districts, setDistricts] = useState<WarehouseDistrict[]>([]);
  const [provinces, setProvinces] = useState<WarehouseDistrict[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [mapWarehouses, setMapWarehouses] = useState<WarehouseMapItem[]>([]);
  const [warehouseDetails, setWarehouseDetails] = useState<WarehouseDetail[]>(
    [],
  );
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [mounted, setMounted] = useState(false);

  // Load locations on mount
  useEffect(() => {
    setMounted(true);
    const loadLocations = async () => {
      setLoadingLocations(true);
      try {
        const [distRes, provRes] = await Promise.all([
          getWarehouseDistricts(),
          getWarehouseProvinces(),
        ]);
        if (distRes.success) {
          const filteredDistricts = distRes.data.filter(
            (d) =>
              !d.desDistrito.toLowerCase().includes("lince") &&
              !d.desDistrito.toLowerCase().includes("la victoria") &&
              !d.desDistrito.toLowerCase().includes("comas") &&
              !d.desDistrito.toLowerCase().includes("los olivos") &&
              !d.desDistrito.toLowerCase().includes("chaclacayo") &&
              !d.desDistrito.toLowerCase().includes("el agustino") &&
              !d.desDistrito.toLowerCase().includes("san juan de lurigancho"),
          );
          setDistricts(filteredDistricts);
        }

        if (provRes.success) {
          const filteredDistricts = provRes.data.filter(
            (d) => !d.desDistrito.toLowerCase().includes("huaral"),
          );
          setProvinces(filteredDistricts);
        }
        // if (provRes.success) setProvinces(provRes.data);
      } catch (error) {
        logger.error("Error loading locations:", error);
      } finally {
        setLoadingLocations(false);
      }
    };
    loadLocations();
  }, []);

  // Load stores when location changes
  useEffect(() => {
    if (!selectedLocation) {
      setMapWarehouses([]);
      setWarehouseDetails([]);
      return;
    }

    const loadStores = async () => {
      setLoadingStores(true);
      try {
        // Find the ubigeo for the selected location name
        const currentLocations = pickupTab === "lima" ? districts : provinces;
        const location = currentLocations.find(
          (l) => l.desDistrito === selectedLocation,
        );

        if (location) {
          const [mapRes, detailsRes] = await Promise.all([
            getWarehouseMap(location.codUbigeoAlm),
            getWarehouseDetails(location.codUbigeoAlm),
          ]);

          if (mapRes.success) setMapWarehouses(mapRes.data);
          if (detailsRes.success) setWarehouseDetails(detailsRes.data);
        }
      } catch (error) {
        logger.error("Error loading stores:", error);
      } finally {
        setLoadingStores(false);
      }
    };
    loadStores();
  }, [selectedLocation, pickupTab, districts, provinces]);

  const currentLocations = useMemo(() => {
    const locations = pickupTab === "lima" ? districts : provinces;
    if (!searchQuery) return locations;
    return locations.filter((l) =>
      l.desDistrito.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [pickupTab, districts, provinces, searchQuery]);

  const handleLocationToggle = (locationName: string) => {
    setSelectedLocation((prev) => (prev === locationName ? "" : locationName));
  };

  const modalContent = isOpen && (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${outfit.variable} font-sans`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pb-4 pt-10 flex items-center justify-center flex-shrink-0">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary-dark">
              Nuestras Tiendas
            </h2>
            <p className="text-gray-500 mt-2">
              Encuentra tu punto de recojo más cercano
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 pt-0 md:p-12 md:pt-0 overflow-y-auto flex-1">
          {/* Tabs for Lima and Provincia */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => {
                setPickupTab("lima");
                setSelectedLocation("");
              }}
              className={`flex-1 py-4 text-center font-semibold transition ${
                pickupTab === "lima"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Lima
            </button>
            <button
              onClick={() => {
                setPickupTab("provincia");
                setSelectedLocation("");
              }}
              className={`flex-1 py-4 text-center font-semibold transition ${
                pickupTab === "provincia"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Provincia
            </button>
          </div>

          {/* Mapa */}
          <div className="relative h-64 md:h-80 bg-gray-100 rounded-lg mb-6 overflow-hidden border">
            <WarehouseMap warehouses={mapWarehouses} />
          </div>

          {/* Buscador */}
          <div className="mb-6">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Buscar ${pickupTab === "lima" ? "distrito" : "provincia"}...`}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-sm focus:border-green-500 focus:outline-none transition-colors text-primary-dark"
              />
            </div>
          </div>

          {/* Lista de ubicaciones con dropdown */}
          <div className="space-y-3">
            {loadingLocations ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500 text-sm">
                  Cargando ubicaciones...
                </p>
              </div>
            ) : currentLocations.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-sm">
                <p className="text-gray-500">No se encontraron ubicaciones</p>
              </div>
            ) : (
              currentLocations.map((location) => (
                <div
                  key={location.codUbigeoAlm}
                  className="border-2 border-gray-200 rounded-sm overflow-hidden"
                >
                  {/* Header del dropdown */}
                  <button
                    onClick={() => handleLocationToggle(location.desDistrito)}
                    className={`w-full px-4 md:px-6 py-2 md:py-4 flex items-center justify-between transition-colors ${
                      selectedLocation === location.desDistrito
                        ? "bg-green-50"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-4 h-4 md:w-6 md:h-6 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span className="font-semibold text-gray-900 text-left text-sm md:text-base">
                        {location.desDistrito}
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedLocation === location.desDistrito
                          ? "rotate-180"
                          : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Contenido del dropdown */}
                  {selectedLocation === location.desDistrito && (
                    <div className="bg-white border-t-2 border-gray-200">
                      {loadingStores ? (
                        <div className="px-6 py-8 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        </div>
                      ) : mapWarehouses.length === 0 ? (
                        <div className="px-6 py-4 text-center ">
                          <p className="text-gray-500 text-sm">
                            No hay tiendas disponibles
                          </p>
                        </div>
                      ) : (
                        mapWarehouses.map((store) => {
                          const details = warehouseDetails.find(
                            (d) => d.idAlmacen === store.idAlmacen,
                          );
                          return (
                            <div
                              key={store.idAlmacen}
                              className="px-6 py-4 hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-100"
                            >
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {store.desAlmacen}
                              </h3>
                              {details && (
                                <div className="space-y-1">
                                  <p className="text-gray-600 text-sm">
                                    <span className="font-medium">
                                      Dirección:
                                    </span>{" "}
                                    {details.direccion}
                                  </p>
                                  <p className="text-gray-600 text-xs">
                                    <span className="font-medium">
                                      Horario:
                                    </span>{" "}
                                    {details.atencion}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={buttonClassName}>
        {buttonText}
      </button>

      {mounted ? createPortal(modalContent, document.body) : null}
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
