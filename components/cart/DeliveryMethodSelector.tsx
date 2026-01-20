import { FaStore, FaTruck } from "react-icons/fa";
import { formatPrice } from "@/lib/utils";
import { CartCarrier, DeliveryZone } from "@/lib/cart";
import { PiWarningCircleFill } from "react-icons/pi";

interface DeliveryMethodSelectorProps {
  loadingCarriers: boolean;
  carriers: CartCarrier[];
  selectedCarrier: CartCarrier | null;
  deliveryZones: DeliveryZone[];
  direccionEnvio: { distrito: string };
  metodoEnvio: "delivery" | "retiro" | null;
  isGuest: boolean;
  envio: number;
  onSelectCarrier: (carrier: CartCarrier) => void;
  children?: React.ReactNode;
}

export default function DeliveryMethodSelector({
  loadingCarriers,
  carriers,
  selectedCarrier,
  deliveryZones,
  direccionEnvio,
  metodoEnvio,
  envio,
  onSelectCarrier,
  children,
}: DeliveryMethodSelectorProps) {
  // Validar si el distrito seleccionado está en la zona de cobertura
  const isDistrictValid =
    !direccionEnvio.distrito ||
    deliveryZones.length === 0 ||
    deliveryZones.some(
      (z) => z.zoneName.toLowerCase() === direccionEnvio.distrito.toLowerCase(),
    );

  return (
    <div className="bg-white rounded-sm shadow-md p-6 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4">
        Selecciona tu método de entrega
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loadingCarriers ? (
          <div className="col-span-2 py-8 flex flex-col items-center justify-center bg-gray-50 rounded-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-gray-500">
              Cargando métodos de envío...
            </p>
          </div>
        ) : carriers.length > 0 ? (
          carriers.map((carrier) => {
            const isRetiro = carrier.name.toLowerCase().includes("retiro");
            const isSelected = selectedCarrier?.id === carrier.id;

            return (
              <button
                key={carrier.id}
                onClick={() => onSelectCarrier(carrier)}
                className={`flex items-center gap-3 p-4 rounded-sm border-2 transition-all duration-300 transform hover:scale-105 ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                {isRetiro ? (
                  <FaStore
                    className={`text-2xl ${
                      isSelected ? "text-primary" : "text-gray-400"
                    }`}
                  />
                ) : (
                  <FaTruck
                    className={`text-2xl ${
                      isSelected ? "text-primary" : "text-gray-400"
                    }`}
                  />
                )}
                <div className="text-left">
                  <p className="font-semibold">{carrier.name}</p>
                  <p className="text-xs text-gray-500">
                    {carrier.id === 250 && deliveryZones.length > 0
                      ? (() => {
                          const zone = deliveryZones.find(
                            (z) =>
                              z.zoneName.toLowerCase() ===
                              direccionEnvio.distrito.toLowerCase(),
                          );
                          return zone
                            ? formatPrice(zone.price)
                            : carrier.shippingCost === 0
                              ? "Gratis"
                              : carrier.delay || "Disponible";
                        })()
                      : carrier.shippingCost === 0
                        ? "Gratis"
                        : carrier.delay || "Disponible"}
                  </p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-2 py-4 text-center text-gray-500 bg-gray-50 rounded-sm">
            No hay métodos de envío disponibles.
          </div>
        )}
      </div>

      {metodoEnvio === "delivery" && (
        <div className="mt-4 space-y-4 animate-fade-in">
          <div className="p-4 bg-blue-50 rounded-sm">
            <p className="text-sm text-gray-700">
              📦{" "}
              {selectedCarrier?.delay ||
                "El envío se realizará en el transcurso de unos días hábiles."}
            </p>
            {isDistrictValid ? (
              <p className="text-sm font-semibold text-primary mt-2">
                Costo: {envio === 0 ? "Gratis" : formatPrice(envio.toString())}
              </p>
            ) : (
              <p className="text-red-500 text-sm font-medium mt-2 flex items-center gap-1">
                <PiWarningCircleFill className="flex-shrink-0" /> Delivery no
                disponible, solo distritos de Lima Metropolitana
              </p>
            )}
          </div>

          {children}
        </div>
      )}
    </div>
  );
}
