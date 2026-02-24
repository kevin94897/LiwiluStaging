import { FaCheck, FaTimesCircle } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import dynamic from "next/dynamic";

const WarehouseMap = dynamic(() => import("@/components/WarehouseMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
      Cargando mapa...
    </div>
  ),
});

import { SavePickupStoreRequest } from "@/lib/cart";

interface StorePickupContentProps {
  metodoEnvio: "delivery" | "retiro" | null;
  distritoSeleccionado: string;
  onSelectDistrito: (distrito: string) => void;
  mostrarMapa: boolean;
  setMostrarMapa: (mostrar: boolean) => void;
  warehouseDistricts: any[];
  warehouseProvinces: any[];
  pickupTab: "lima" | "provincia";
  onTabChange: (tab: "lima" | "provincia") => void;
  mapWarehouses: any[];
  warehouseDetails?: any[];
  tiendaSeleccionada: string | null;
  setTiendaSeleccionada: (id: string) => void;
  onSelectStore?: (store: SavePickupStoreRequest) => void; // Added
  loadingStores: boolean;
  stockValidationResult: any;
}

export default function StorePickupContent({
  metodoEnvio,
  distritoSeleccionado,
  onSelectDistrito,
  mostrarMapa,
  setMostrarMapa,
  warehouseDistricts,
  warehouseProvinces,
  pickupTab,
  onTabChange,
  mapWarehouses,
  warehouseDetails = [],
  tiendaSeleccionada,
  setTiendaSeleccionada,
  onSelectStore, // Added
  loadingStores,
  stockValidationResult,
}: StorePickupContentProps) {
  if (metodoEnvio !== "retiro") return null;

  return (
    <>
      <div className="mt-4 animate-fade-in bg-white rounded-sm shadow-md overflow-hidden transition-all">
        {/* Tabs for Lima and Provincia */}
        <div className="flex border-b">
          <button
            onClick={() => onTabChange("lima")}
            className={`flex-1 py-4 text-center font-semibold transition ${pickupTab === "lima"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            Lima
          </button>
          <button
            onClick={() => onTabChange("provincia")}
            className={`flex-1 py-4 text-center font-semibold transition ${pickupTab === "provincia"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            Provincia
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Retiro en Tienda</h2>
          <p className="text-sm text-gray-700 mb-3">
            Selecciona el {pickupTab === "lima" ? "distrito" : "la provincia"}{" "}
            para consultar los puntos de retiro disponibles
          </p>
          <select
            value={distritoSeleccionado}
            onChange={(e) => {
              onSelectDistrito(e.target.value);
              if (e.target.value) setMostrarMapa(true);
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          >
            <option value="">
              Seleccionar {pickupTab === "lima" ? "distrito" : "provincia"}
            </option>
            {pickupTab === "lima"
              ? warehouseDistricts
                .filter(
                  (district) =>
                    district.desDistrito.toLowerCase() !== "la victoria" &&
                    district.desDistrito.toLowerCase() !== "lince"
                )
                .map((district) => (
                  <option
                    key={district.codUbigeoAlm}
                    value={district.desDistrito}
                  >
                    {district.desDistrito}
                  </option>
                ))
              : warehouseProvinces.map((province) => (
                <option
                  key={province.codUbigeoAlm}
                  value={province.desDistrito}
                >
                  {province.desDistrito}
                </option>
              ))}
          </select>
        </div>
      </div>

      {mostrarMapa && distritoSeleccionado && (
        <div className="bg-white rounded-sm shadow-md p-6 animate-fade-in-up mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Puntos de retiro más cercanos</h2>

          </div>
          <p className="text-sm text-gray-700 mb-3">
            Selecciona la tienda para confirmar el retiro
          </p>

          {/* Mapa Interactivo */}
          <div className="relative h-96 bg-gray-100 rounded-sm mb-6 overflow-hidden border">
            <WarehouseMap
              warehouses={mapWarehouses}
              center={
                mapWarehouses.find(
                  (w) => w.idAlmacen.toString() === tiendaSeleccionada,
                )
                  ? [
                    mapWarehouses.find(
                      (w) => w.idAlmacen.toString() === tiendaSeleccionada,
                    )!.latitud,
                    mapWarehouses.find(
                      (w) => w.idAlmacen.toString() === tiendaSeleccionada,
                    )!.longitud,
                  ]
                  : undefined
              }
            />
          </div>

          {/* Lista de tiendas */}
          {loadingStores ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Cargando tiendas disponibles...
              </p>
            </div>
          ) : mapWarehouses.length === 0 ? (
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
              {mapWarehouses.map((tienda) => {
                const warehouseResult =
                  stockValidationResult?.resultadosPorAlmacen.find(
                    (w: any) => w.idAlmacen === tienda.idAlmacen,
                  );
                const isAvailable = warehouseResult
                  ? warehouseResult.todosDisponibles
                  : true;
                const isSelected =
                  tiendaSeleccionada === tienda.idAlmacen.toString();

                // Find details for this store
                const details = warehouseDetails?.find(
                  (d: any) => d.idAlmacen === tienda.idAlmacen,
                );

                return (
                  <div
                    key={tienda.idAlmacen}
                    className={`p-4 rounded-sm border-2 transition-all cursor-pointer ${isSelected
                      ? isAvailable
                        ? "border-primary bg-primary/5"
                        : "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-primary/50"
                      }`}
                    onClick={() => {
                      setTiendaSeleccionada(tienda.idAlmacen.toString());
                      if (onSelectStore && details) {
                        onSelectStore({
                          idAlmacen: tienda.idAlmacen,
                          desAlmacen: tienda.desAlmacen,
                          direccion: details.direccion,
                          atencion: details.atencion,
                        });
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {tienda.desAlmacen}
                        </h3>
                        {details && (
                          <div className="mt-2 text-sm text-gray-600 space-y-3">
                            <p className="flex flex-col md:flex-row items-start gap-2">
                              <span className="font-medium text-gray-800 shrink-0">
                                Dirección:
                              </span>
                              <span>{details.direccion}</span>
                            </p>
                            <p className="flex flex-col md:flex-row items-start gap-2">
                              <span className="font-medium text-gray-800 shrink-0">
                                Horario:
                              </span>
                              <span>{details.atencion}</span>
                            </p>
                          </div>
                        )}
                        {!details && (
                          <p className="text-xs text-gray-500 mt-1">
                            Ubigeo: {tienda.codUbigeoAlm}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        {isSelected && (
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${isAvailable ? "bg-primary" : "bg-red-500"
                              }`}
                          >
                            <FaCheck className="text-white text-xs translate-x-[0.5px] translate-y-[0.5px]" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Disponibilidad de productos */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {isAvailable ? (
                        <p className="text-xs font-semibold text-green-700">
                          ✓ Disponible para recojo en tienda
                        </p>
                      ) : (
                        <p className="text-xs font-semibold text-red-600">
                          ✕ No hay stock suficiente en esta tienda
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
