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
}: DeliveryAddressFormProps) {
  return (
    <div className="border-2 border-gray-200 rounded-sm p-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Dirección de envío</h3>
        {!editandoDireccion && (
          <div className="flex gap-4">
            {isLoggedIn && mainAddressId && (
              <button
                onClick={() => {
                  setMainAddressId(null);
                  setDireccionEnvio({
                    calle: "",
                    departamento: "Lima",
                    ciudad: "Lima",
                    distrito: "",
                    numeroDptoPiso: "",
                    referencia: "",
                  });
                  userLocations.setLocationValues("Lima", "Lima", "");
                  setEditandoDireccion(true);
                }}
                className="text-primary text-sm hover:text-primary-dark flex items-center gap-1 font-medium"
              >
                <FaPlus className="text-xs" /> Agregar nueva
              </button>
            )}
            {!(isLoggedIn && userAddresses.length === 0) &&
              !(isLoggedIn && !mainAddressId && userAddresses.length > 0) && (
                <button
                  onClick={() => {
                    if (!direccionEnvio.calle) {
                      userLocations.setLocationValues("Lima", "Lima", "");
                    }
                    setEditandoDireccion(!editandoDireccion);
                  }}
                  className="text-primary text-sm hover:text-primary-dark flex items-center gap-1 font-medium"
                >
                  {direccionEnvio.calle ? (
                    <FaPencil className="text-sm" />
                  ) : (
                    <FaPlus className="text-xs" />
                  )}
                  {direccionEnvio.calle ? "Editar actual" : "Agregar"}
                </button>
              )}
          </div>
        )}
      </div>

      {editandoDireccion || (isLoggedIn && userAddresses.length === 0) ? (
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
              {userLocations.departments.map((d) => (
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
              {userLocations.provinces.map((p) => (
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
            {userLocations.districts.map((d) => (
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

          <div className="flex gap-2 md:flex-row flex-col justify-center">
            <Button onClick={onSaveAddress} variant="primary" size="sm">
              Guardar dirección
            </Button>
            {!(isLoggedIn && userAddresses.length === 0) && (
              <Button
                onClick={() => setEditandoDireccion(false)}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      ) : isLoggedIn && !mainAddressId && userAddresses.length > 0 ? (
        <div className="space-y-3 mt-3">
          <p className="text-sm text-gray-600 mb-2">
            Selecciona una de tus direcciones:
            {addressErrors.general && (
              <span className="block text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                <PiWarningCircleFill /> {addressErrors.general}
              </span>
            )}
          </p>
          <select
            onChange={async (e) => {
              const addrId = e.target.value;
              const selected = userAddresses.find(
                (a) => a.id.toString() === addrId,
              );
              if (selected) {
                setMainAddressId(selected.id);
                setDireccionEnvio({
                  calle: selected.address,
                  distrito: selected.district,
                  ciudad: selected.province,
                  departamento: selected.department,
                  numeroDptoPiso: selected.apartment || "", // En este proyecto apartment parece usarse para el piso/dpto en algunos contextos o título
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
        </div>
      ) : (
        <>
          {direccionEnvio.calle && (
            <div className="space-y-2 mt-3">
              <div className="text-sm text-gray-700">
                <p className="font-medium">{direccionEnvio.calle}</p>
                <p>
                  {direccionEnvio.distrito}, {direccionEnvio.ciudad},{" "}
                  {direccionEnvio.departamento}
                </p>
              </div>
              {isLoggedIn && userAddresses.length > 0 && (
                <button
                  onClick={() => setMainAddressId(null)}
                  className="text-primary text-xs font-medium hover:underline"
                >
                  Elegir otra dirección o agregar nueva
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
