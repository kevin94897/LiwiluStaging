import { FaPencil, FaPlus } from "react-icons/fa6";
import { formatPrice } from "@/lib/utils";
import { PiWarningCircleFill } from "react-icons/pi";
import { DeliveryZone } from "@/lib/cart";
import { showToast } from "@/lib/notifications";

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
        {!editandoDireccion &&
          !(isLoggedIn && userAddresses.length === 0) &&
          !(isLoggedIn && !mainAddressId && userAddresses.length > 0) && (
            <button
              onClick={() => {
                if (!direccionEnvio.calle) {
                  userLocations.setLocationValues("Lima", "Lima", "");
                }
                setEditandoDireccion(!editandoDireccion);
              }}
              className="text-primary text-sm hover:text-primary-dark flex items-center gap-1"
            >
              {direccionEnvio.calle ? (
                <FaPencil className="text-sm" />
              ) : (
                <FaPlus className="text-xs" />
              )}
              {direccionEnvio.calle ? "Editar" : "Agregar"}
            </button>
          )}
      </div>

      {editandoDireccion || (isLoggedIn && userAddresses.length === 0) ? (
        <div className="space-y-3 mt-3">
          <div>
            <input
              type="text"
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
            <select
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
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Departamento</option>
              {userLocations.departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
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
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Provincia</option>
              {userLocations.provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <select
            value={direccionEnvio.distrito}
            onChange={(e) => {
              const val = e.target.value;
              setDireccionEnvio({
                ...direccionEnvio,
                distrito: val,
              });
              userLocations.handleDistChange(val);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            disabled={!direccionEnvio.ciudad}
          >
            <option value="">Distrito</option>
            {userLocations.districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={direccionEnvio.numeroDptoPiso}
              onChange={(e) =>
                setDireccionEnvio({
                  ...direccionEnvio,
                  numeroDptoPiso: e.target.value,
                })
              }
              placeholder="Dpto / Piso / Of."
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              value={direccionEnvio.referencia}
              onChange={(e) =>
                setDireccionEnvio({
                  ...direccionEnvio,
                  referencia: e.target.value,
                })
              }
              placeholder="Referencia"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            {!(isLoggedIn && userAddresses.length === 0) && (
              <button
                onClick={() => setEditandoDireccion(false)}
                className="w-1/2 bg-gray-200 text-gray-700 py-2 rounded-full text-sm font-semibold hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={onSaveAddress}
              className={`${
                !(isLoggedIn && userAddresses.length === 0) ? "w-1/2" : "w-full"
              } bg-primary text-white py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition`}
            >
              Guardar dirección
            </button>
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
                  numeroDptoPiso: selected.numeroDptoPiso || "",
                  referencia: selected.referencia || "",
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
          <button
            onClick={() => setEditandoDireccion(true)}
            className="text-primary text-xs font-medium hover:underline"
          >
            + Agregar nueva dirección
          </button>
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
              {isLoggedIn && userAddresses.length > 1 && (
                <button
                  onClick={() => setMainAddressId(null)}
                  className="text-primary text-xs font-medium hover:underline"
                >
                  Elegir otra dirección
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
