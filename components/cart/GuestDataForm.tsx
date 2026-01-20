import { PiWarningCircleFill } from "react-icons/pi";
import Button from "@/components/ui/Button";
import { GuestDataSchemaType } from "@/lib/guestDataSchema";

interface GuestDataFormProps {
  activeTab: string;
  guestData: GuestDataSchemaType;
  guestErrors: Partial<Record<keyof GuestDataSchemaType, string>>;
  onGuestChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onGuestSubmit: (e: React.FormEvent) => void;
  guestLocations: any;
  onSetActiveTab: (tab: "login" | "registro" | "guest") => void;
  onSetGuestData: (
    update: (prev: GuestDataSchemaType) => GuestDataSchemaType,
  ) => void;
}

export default function GuestDataForm({
  activeTab,
  guestData,
  guestErrors,
  onGuestChange,
  onGuestSubmit,
  guestLocations,
  onSetActiveTab,
  onSetGuestData,
}: GuestDataFormProps) {
  if (activeTab !== "guest") return null;

  return (
    <div className="animate-fade-in max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
        Ingresa tus datos
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Completa tus datos para continuar con tu compra
      </p>

      <form onSubmit={onGuestSubmit} className="space-y-4">
        {/* Datos Personales */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={guestData.nombre}
              onChange={onGuestChange}
              placeholder="Gonzalo"
              className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                guestErrors.nombre ? "border-red-500" : "border-gray-200"
              }`}
            />
            {guestErrors.nombre && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <PiWarningCircleFill size={16} /> {guestErrors.nombre}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido
            </label>
            <input
              type="text"
              name="apellido"
              value={guestData.apellido}
              onChange={onGuestChange}
              placeholder="Vera"
              className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                guestErrors.apellido ? "border-red-500" : "border-gray-200"
              }`}
            />
            {guestErrors.apellido && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <PiWarningCircleFill size={16} /> {guestErrors.apellido}
              </p>
            )}
          </div>
        </div>

        {/* Documento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de documento
          </label>
          <select
            name="tipoDocumento"
            value={guestData.tipoDocumento}
            onChange={(e) =>
              onSetGuestData((prev) => ({
                ...prev,
                tipoDocumento: e.target.value as any,
              }))
            }
            className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
              guestErrors.tipoDocumento ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="DNI">DNI</option>
            <option value="RUC">RUC</option>
            <option value="CE">Carnet de Extranjería</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Documento
          </label>
          <input
            type="text"
            name="numeroDocumento"
            value={guestData.numeroDocumento}
            onChange={onGuestChange}
            placeholder="74218601"
            className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
              guestErrors.numeroDocumento ? "border-red-500" : "border-gray-200"
            }`}
          />
          {guestErrors.numeroDocumento && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <PiWarningCircleFill size={16} /> {guestErrors.numeroDocumento}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            name="email"
            value={guestData.email}
            onChange={onGuestChange}
            placeholder="ejemplo@correo.com"
            className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
              guestErrors.email ? "border-red-500" : "border-gray-200"
            }`}
          />
          {guestErrors.email && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <PiWarningCircleFill size={16} /> {guestErrors.email}
            </p>
          )}
        </div>

        {/* Teléfonos */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Celular
            </label>
            <input
              type="tel"
              name="celular"
              value={guestData.celular}
              onChange={onGuestChange}
              placeholder="973 820 088"
              className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                guestErrors.celular ? "border-red-500" : "border-gray-200"
              }`}
            />
            {guestErrors.celular && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <PiWarningCircleFill size={16} /> {guestErrors.celular}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono opcional
            </label>
            <input
              type="tel"
              name="telefonoOpcional"
              value={guestData.telefonoOpcional}
              onChange={onGuestChange}
              placeholder="973 820 088"
              className={`w-full px-4 py-2.5 border-2 rounded-sm transition border-gray-200`}
            />
          </div>
        </div>

        {/* Ubicación */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento
            </label>
            <select
              name="departamento"
              value={guestData.departamento}
              onChange={(e) => {
                const val = e.target.value;
                onSetGuestData((prev) => ({
                  ...prev,
                  departamento: val,
                  provincia: "",
                  distrito: "",
                }));
                guestLocations.handleDeptChange(val);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-sm bg-gray-50"
              disabled
            >
              <option value="">Seleccionar</option>
              {guestLocations.departments.map((d: any) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provincia
            </label>
            <select
              name="provincia"
              value={guestData.provincia}
              onChange={(e) => {
                const val = e.target.value;
                onSetGuestData((prev) => ({
                  ...prev,
                  provincia: val,
                  distrito: "",
                }));
                guestLocations.handleProvChange(val);
              }}
              className={`w-full px-4 py-2.5 border-2 rounded-sm bg-gray-50 transition border-gray-200`}
              disabled
            >
              <option value="">Seleccionar</option>
              {guestLocations.provinces.map((p: any) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {guestErrors.provincia && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <PiWarningCircleFill size={16} /> {guestErrors.provincia}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distrito
          </label>
          <select
            name="distrito"
            value={guestData.distrito}
            onChange={(e) => {
              onGuestChange(e);
              guestLocations.handleDistChange(e.target.value);
            }}
            className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
              guestErrors.distrito ? "border-red-500" : "border-gray-200"
            }`}
            disabled={!guestData.provincia}
          >
            <option value="">Seleccionar</option>
            {guestLocations.districts.map((d: any) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {guestErrors.distrito && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <PiWarningCircleFill size={16} /> {guestErrors.distrito}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección
          </label>
          <input
            type="text"
            name="direccion"
            value={guestData.direccion}
            onChange={onGuestChange}
            placeholder="Calle rosales 432"
            className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
              guestErrors.direccion ? "border-red-500" : "border-gray-200"
            }`}
          />
          {guestErrors.direccion && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <PiWarningCircleFill size={16} /> {guestErrors.direccion}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nro. de dpto. / Piso
            </label>
            <input
              type="text"
              name="numeroDpto"
              value={guestData.numeroDpto}
              onChange={onGuestChange}
              placeholder="Ate"
              className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                guestErrors.numeroDpto ? "border-red-500" : "border-gray-200"
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia
            </label>
            <input
              type="text"
              name="referencia"
              value={guestData.referencia}
              onChange={onGuestChange}
              placeholder="Ate"
              className={`w-full px-4 py-2.5 border-2 rounded-sm transition ${
                guestErrors.referencia ? "border-red-500" : "border-gray-200"
              }`}
            />
          </div>
        </div>

        <Button variant="primary" size="md" className="w-full" type="submit">
          Siguiente
        </Button>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => onSetActiveTab("login")}
              className="text-primary hover:text-primary-dark font-semibold transition-all"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
