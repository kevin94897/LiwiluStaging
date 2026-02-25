import { useState } from "react";
import logger from "@/lib/logger";
import { FaPencil, FaPlus } from "react-icons/fa6";
import { formatPrice } from "@/lib/utils";
import { PiWarningCircleFill } from "react-icons/pi";
import { DeliveryZone } from "@/lib/cart";
import { showToast } from "@/lib/notifications";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

interface DeliveryAddressFormProps {
  isLoggedIn: boolean;
  userAddresses: any[];
  mainAddressId: number | null;
  setMainAddressId: (id: number | null) => void;
  direccionEnvio: {
    calle: string;
    departamento: string;
    ciudad: string;
    distrito: string;
    numeroDptoPiso: string;
    referencia: string;
  };
  setDireccionEnvio: (dir: any) => void;
  editandoDireccion: boolean;
  setEditandoDireccion: (val: boolean) => void;
  userLocations: {
    departments: string[];
    provinces: string[];
    districts: string[];
    handleDeptChange: (dept: string) => void;
    handleProvChange: (prov: string) => void;
    handleDistChange: (dist: string) => void;
    setLocationValues: (dept: string, prov: string, dist: string) => void;
  };
  onSaveAddress: () => void;
  addressErrors?: Record<string, string>;
  deliveryZones: DeliveryZone[];
  saveToProfile: boolean;
  setSaveToProfile: (val: boolean) => void;
  showPreview?: boolean;
  setShowPreview?: (val: boolean) => void;
}

export default function DeliveryAddressForm({
  isLoggedIn,
  userAddresses,
  mainAddressId,
  setMainAddressId,
  direccionEnvio,
  setDireccionEnvio,
  editandoDireccion,
  setEditandoDireccion,
  userLocations,
  onSaveAddress,
  addressErrors = {},
  deliveryZones,
  saveToProfile,
  setSaveToProfile,
  showPreview: showPreviewProp,
  setShowPreview: setShowPreviewProp,
}: DeliveryAddressFormProps) {
  const [activeTab, setActiveTab] = useState<"saved" | "new">("saved");
  const [showPreviewLocal, setShowPreviewLocal] = useState(false);

  // Use prop if provided, otherwise use local state
  const showPreview =
    showPreviewProp !== undefined ? showPreviewProp : showPreviewLocal;
  const setShowPreview = setShowPreviewProp || setShowPreviewLocal;

  // Determinar si mostrar tabs (solo para usuarios autenticados con direcciones)
  const showTabs = isLoggedIn && userAddresses.length > 0;

  return (
    <div className="border-2 border-gray-200 rounded-sm p-4 mt-4">
      <h3 className="font-semibold text-gray-900 mb-4">Dirección de envío</h3>

      {/* Tabs - Solo para usuarios autenticados con direcciones */}
      {showTabs && (
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => {
              setActiveTab("saved");
              setShowPreview(false); // Reset preview when switching tabs
            }}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "saved"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mis direcciones
          </button>
          <button
            onClick={() => {
              setActiveTab("new");
              setMainAddressId(null); // Ensure we are in "new address" mode

              // Restore from localStorage or reset
              const saved = localStorage.getItem("liwilu_direccionEnvio");
              if (saved) {
                try {
                  const data = JSON.parse(saved);
                  // Check if it has at least some data to be worth showing preview
                  if (data.calle) {
                    setDireccionEnvio(data);
                    setShowPreview(true); // Show preview immediately if we have data

                    // Update location dropdowns to match
                    if (data.departamento && data.ciudad && data.distrito) {
                      userLocations.setLocationValues(
                        data.departamento,
                        data.ciudad,
                        data.distrito,
                      );
                    } else {
                      // Partial fallback
                      userLocations.setLocationValues(
                        data.departamento || "Lima",
                        data.ciudad || "Lima",
                        data.distrito || "",
                      );
                    }
                  } else {
                    // Saved but empty/invalid for preview
                    throw new Error("Empty address data");
                  }
                } catch (e) {
                  logger.error("Error parsing saved address:", e);
                  // Fallback reset
                  setShowPreview(false);
                  setDireccionEnvio({
                    calle: "",
                    distrito: "",
                    ciudad: "Lima",
                    departamento: "Lima",
                    numeroDptoPiso: "",
                    referencia: "",
                  });
                  userLocations.setLocationValues("Lima", "Lima", "");
                }
              } else {
                // Reset address form to defaults if nothing saved
                setShowPreview(false);
                setDireccionEnvio({
                  calle: "",
                  distrito: "",
                  ciudad: "Lima",
                  departamento: "Lima",
                  numeroDptoPiso: "",
                  referencia: "",
                });
                userLocations.setLocationValues("Lima", "Lima", "");
              }
            }}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "new"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Nueva dirección
          </button>
        </div>
      )}

      {/* Contenido según el tab activo */}
      {showTabs && activeTab === "saved" ? (
        /* Tab: Mis direcciones guardadas - Solo muestra direcciones del perfil */
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-2">
            Selecciona una de tus direcciones guardadas:
            {addressErrors.general && (
              <span className="block text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                <PiWarningCircleFill /> {addressErrors.general}
              </span>
            )}
          </p>
          <select
            value={mainAddressId || ""}
            onChange={async (e) => {
              const addrId = e.target.value;
              const selected = userAddresses.find(
                (a) => a.id.toString() === addrId,
              );
              if (selected) {
                setMainAddressId(selected.id);
                // Actualizar direccionEnvio solo para sincronizar con el carrito
                setDireccionEnvio({
                  calle: selected.address,
                  distrito: selected.district,
                  ciudad: selected.province,
                  departamento: selected.department,
                  numeroDptoPiso: selected.apartment || "",
                  referencia: selected.reference || "",
                });
                userLocations.setLocationValues(
                  selected.department,
                  selected.province,
                  selected.district,
                );
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">Seleccionar dirección...</option>
            {userAddresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.address}, {addr.district}
              </option>
            ))}
          </select>

          {/* Mostrar dirección seleccionada */}
          {mainAddressId && direccionEnvio.calle && (
            <div className="space-y-2 mt-3 p-3 bg-gray-50 rounded-sm">
              <div className="text-sm text-gray-700">
                <p className="font-medium">{direccionEnvio.calle}</p>
                <p>
                  {direccionEnvio.distrito}, {direccionEnvio.ciudad},{" "}
                  {direccionEnvio.departamento}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : showTabs && activeTab === "new" ? (
        /* Tab: Nueva dirección - Independiente de direcciones guardadas */
        !mainAddressId && showPreview && direccionEnvio.calle ? (
          /* Preview de dirección temporal guardada */
          <div className="space-y-3 mt-3">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-sm">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  Dirección de envío
                </h4>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-primary text-sm hover:text-primary-dark flex items-center gap-1 font-medium"
                >
                  <FaPencil className="text-sm" /> Editar
                </button>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{direccionEnvio.calle}</p>
                <p>
                  {direccionEnvio.distrito}, {direccionEnvio.ciudad},{" "}
                  {direccionEnvio.departamento}
                </p>
                {direccionEnvio.numeroDptoPiso && (
                  <p>Dpto/Piso: {direccionEnvio.numeroDptoPiso}</p>
                )}
                {direccionEnvio.referencia && (
                  <p>Referencia: {direccionEnvio.referencia}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Formulario de nueva dirección (tab Nueva dirección) */
          <div className="space-y-3 mt-3">
            <div>
              <Input
                value={direccionEnvio.calle}
                onChange={(e) =>
                  setDireccionEnvio({
                    ...direccionEnvio,
                    calle: e.target.value,
                  })
                }
                placeholder="Calle y número"
                className={`w-full px-3 py-2 border rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary ${
                  addressErrors.calle ? "border-red-500" : "border-gray-300"
                }`}
              />
              {addressErrors.calle && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <PiWarningCircleFill size={16} /> {addressErrors.calle}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={direccionEnvio.departamento}
                onChange={(e) => {
                  const val = e.target.value;
                  setDireccionEnvio({
                    ...direccionEnvio,
                    departamento: val,
                    ciudad: "",
                    distrito: "",
                  });
                  userLocations.handleDeptChange(val);
                }}
                // Removed manual border classes as Select handles them, but might need adjustments if style differs.
                // Select default has w-full and border-2.
              >
                <option value="">Departamento</option>
                {userLocations.departments
                  .filter((d) => d === "Lima" || d === "Callao")
                  .map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </Select>

              <Select
                value={direccionEnvio.ciudad}
                onChange={(e) => {
                  const val = e.target.value;
                  setDireccionEnvio({
                    ...direccionEnvio,
                    ciudad: val,
                    distrito: "",
                  });
                  userLocations.handleProvChange(val);
                }}
              >
                <option value="">Provincia</option>
                {userLocations.provinces
                  .filter((p) => p === "Lima" || p === "Callao")
                  .map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
              </Select>
            </div>

            <Select
              value={direccionEnvio.distrito}
              onChange={(e) => {
                const val = e.target.value;
                setDireccionEnvio({
                  ...direccionEnvio,
                  distrito: val,
                });
                userLocations.handleDistChange(val);
              }}
              disabled={!direccionEnvio.ciudad}
              error={addressErrors.distrito}
            >
              <option value="">Distrito</option>
              {deliveryZones && deliveryZones.length > 0
                ? deliveryZones.map((z) => (
                    <option key={z.zoneId} value={z.zoneName}>
                      {z.zoneName}
                    </option>
                  ))
                : userLocations.districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
            </Select>

            <Input
              value={direccionEnvio.numeroDptoPiso}
              onChange={(e) =>
                setDireccionEnvio({
                  ...direccionEnvio,
                  numeroDptoPiso: e.target.value,
                })
              }
              placeholder="Nro. de dpto. / Piso"
              className={`w-full px-3 py-2 border rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary ${addressErrors.numeroDptoPiso ? "border-red-500" : "border-gray-300"}`}
            />
            {addressErrors.numeroDptoPiso && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <PiWarningCircleFill size={16} /> {addressErrors.numeroDptoPiso}
              </p>
            )}

            <Input
              value={direccionEnvio.referencia}
              onChange={(e) =>
                setDireccionEnvio({
                  ...direccionEnvio,
                  referencia: e.target.value,
                })
              }
              placeholder="Referencia"
              className={`w-full px-3 py-2 border rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary ${addressErrors.referencia ? "border-red-500" : "border-gray-300"}`}
            />
            {addressErrors.referencia && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <PiWarningCircleFill size={16} /> {addressErrors.referencia}
              </p>
            )}

            {isLoggedIn && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-primary/5 rounded-sm border border-primary/10">
                <input
                  type="checkbox"
                  id="saveToProfileNew"
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor="saveToProfileNew"
                  className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                >
                  Guardar esta dirección en mi perfil (Recomendado)
                </label>
              </div>
            )}

            <div className="flex gap-2 md:flex-row flex-col justify-center">
              <Button onClick={onSaveAddress} variant="primary" size="sm">
                Guardar dirección
              </Button>
              {!(isLoggedIn && userAddresses.length === 0) && (
                <Button
                  onClick={() => {
                    setEditandoDireccion(false);
                    // If in tabs mode, switch back to saved addresses tab
                    if (showTabs) {
                      setActiveTab("saved");
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        )
      ) : !showTabs ? (
        /* Usuarios sin tabs (invitados o sin direcciones guardadas) */
        !mainAddressId && showPreview && direccionEnvio.calle ? (
          /* Preview de dirección temporal guardada - INVITADOS */
          <div className="space-y-3 mt-3">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-sm">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  Dirección de envío
                </h4>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-primary text-sm hover:text-primary-dark flex items-center gap-1 font-medium"
                >
                  <FaPencil className="text-sm" /> Editar
                </button>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{direccionEnvio.calle}</p>
                <p>
                  {direccionEnvio.distrito}, {direccionEnvio.ciudad},{" "}
                  {direccionEnvio.departamento}
                </p>
                {direccionEnvio.numeroDptoPiso && (
                  <p>Dpto/Piso: {direccionEnvio.numeroDptoPiso}</p>
                )}
                {direccionEnvio.referencia && (
                  <p>Referencia: {direccionEnvio.referencia}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            <div>
              <Input
                value={direccionEnvio.calle}
                onChange={(e) =>
                  setDireccionEnvio({
                    ...direccionEnvio,
                    calle: e.target.value,
                  })
                }
                placeholder="Calle y número"
                className={`w-full px-3 py-2 border rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary ${
                  addressErrors.calle ? "border-red-500" : "border-gray-300"
                }`}
              />
              {addressErrors.calle && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <PiWarningCircleFill size={16} /> {addressErrors.calle}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={direccionEnvio.departamento}
                onChange={(e) => {
                  const val = e.target.value;
                  setDireccionEnvio({
                    ...direccionEnvio,
                    departamento: val,
                    ciudad: "",
                    distrito: "",
                  });
                  userLocations.handleDeptChange(val);
                }}
              >
                <option value="">Departamento</option>
                {userLocations.departments
                  .filter((d) => d === "Lima" || d === "Callao")
                  .map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </Select>

              <Select
                value={direccionEnvio.ciudad}
                onChange={(e) => {
                  const val = e.target.value;
                  setDireccionEnvio({
                    ...direccionEnvio,
                    ciudad: val,
                    distrito: "",
                  });
                  userLocations.handleProvChange(val);
                }}
              >
                <option value="">Provincia</option>
                {userLocations.provinces
                  .filter((p) => p === "Lima" || p === "Callao")
                  .map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
              </Select>
            </div>

            <Select
              value={direccionEnvio.distrito}
              onChange={(e) => {
                const val = e.target.value;
                setDireccionEnvio({
                  ...direccionEnvio,
                  distrito: val,
                });
                userLocations.handleDistChange(val);
              }}
              disabled={!direccionEnvio.ciudad}
              error={addressErrors.distrito}
            >
              <option value="">Distrito</option>
              {deliveryZones && deliveryZones.length > 0
                ? deliveryZones.map((z) => (
                    <option key={z.zoneId} value={z.zoneName}>
                      {z.zoneName}
                    </option>
                  ))
                : userLocations.districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
            </Select>

            <Input
              value={direccionEnvio.numeroDptoPiso}
              onChange={(e) =>
                setDireccionEnvio({
                  ...direccionEnvio,
                  numeroDptoPiso: e.target.value,
                })
              }
              placeholder="Nro. de dpto. / Piso"
              className={`w-full px-3 py-2 border rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary ${addressErrors.numeroDptoPiso ? "border-red-500" : "border-gray-300"}`}
            />
            {addressErrors.numeroDptoPiso && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <PiWarningCircleFill size={16} /> {addressErrors.numeroDptoPiso}
              </p>
            )}

            <Input
              value={direccionEnvio.referencia}
              onChange={(e) =>
                setDireccionEnvio({
                  ...direccionEnvio,
                  referencia: e.target.value,
                })
              }
              placeholder="Referencia"
              className={`w-full px-3 py-2 border rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary ${addressErrors.referencia ? "border-red-500" : "border-gray-300"}`}
            />
            {addressErrors.referencia && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <PiWarningCircleFill size={16} /> {addressErrors.referencia}
              </p>
            )}

            {isLoggedIn && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-primary/5 rounded-sm border border-primary/10">
                <input
                  type="checkbox"
                  id="saveToProfileGuestStyle"
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor="saveToProfileGuestStyle"
                  className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                >
                  Guardar esta dirección en mi perfil (Recomendado)
                </label>
              </div>
            )}

            <div className="flex gap-2 md:flex-row flex-col justify-center">
              <Button onClick={onSaveAddress} variant="primary" size="sm">
                Guardar dirección
              </Button>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
