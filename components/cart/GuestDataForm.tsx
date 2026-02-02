import { useState } from "react";
import { PiWarningCircleFill } from "react-icons/pi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { GuestDataSchemaType } from "@/lib/guestDataSchema";
import { consultaDNI, consultaRUC } from "@/lib/general";
import { showToast } from "@/lib/notifications";

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
  const [isConsulting, setIsConsulting] = useState(false);
  const [consulted, setConsulted] = useState(false);

  if (activeTab !== "guest") return null;

  const handleConsultacion = async () => {
    if (!guestData.numeroDocumento) {
      showToast("Ingresa un número de documento", "error");
      return;
    }

    setIsConsulting(true);
    try {
      if (guestData.tipoDocumento === "DNI") {
        if (guestData.numeroDocumento.length !== 8) {
          showToast("El DNI debe tener 8 dígitos", "error");
          return;
        }
        const res = await consultaDNI(guestData.numeroDocumento);
        if (res.success && res.data) {
          onSetGuestData((prev) => ({
            ...prev,
            nombre: res.data.nombres,
            apellido: `${res.data.apellido_paterno} ${res.data.apellido_materno}`,
          }));
          setConsulted(true);
          showToast("Datos encontrados", "success");
        } else {
          showToast("No se encontraron datos para este DNI", "error");
        }
      } else if (guestData.tipoDocumento === "RUC") {
        if (guestData.numeroDocumento.length !== 11) {
          showToast("El RUC debe tener 11 números y empezar con 10, 15 o 20", "error");
          return;
        }
        const res = await consultaRUC(guestData.numeroDocumento);
        if (res.success && res.data) {
          // Mapeo inteligente de ubicación si está disponible
          // Nota: Esto depende de si los valores coinciden con las listas de guestLocations
          // Por simplicidad, llenamos los campos de texto libre

          onSetGuestData((prev) => ({
            ...prev,
            nombre: res.data.nombre_o_razon_social,
            apellido: "-", // RUC no tiene apellido, usamos guión para evitar error de validación
            direccion: res.data.direccion_completa || prev.direccion,
            // Intentar mapear departamento/provincia/distrito requeriría lógica compleja de coincidencia de strings
            // o IDs, lo dejamos para selección manual o implementación futura más robusta
          }));
          setConsulted(true);
          showToast("Datos de empresa encontrados", "success");
        } else {
          showToast("No se encontraron datos para este RUC", "error");
        }
      } else {
        showToast("Consulta disponible solo para DNI y RUC", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error al consultar el documento", "error");
    } finally {
      setIsConsulting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (e.target.name === "numeroDocumento") {
      setConsulted(false);
      // Clear auto-filled fields when document number changes
      onSetGuestData((prev) => ({
        ...prev,
        nombre: "",
        apellido: "",
        // Only clear address if it was potentially filled by RUC (or just reset to be safe)
        direccion: prev.tipoDocumento === "RUC" ? "" : prev.direccion,
        departamento: prev.tipoDocumento === "RUC" ? "Lima" : prev.departamento, // Reset if RUC logic implies it, but let's stick to clearing basics
        provincia: prev.tipoDocumento === "RUC" ? "Lima" : prev.provincia,
        distrito: prev.tipoDocumento === "RUC" ? "" : prev.distrito,
      }));
    }
    onGuestChange(e);
  };

  return (
    <div className="animate-fade-in max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
        Ingresa tus datos
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Completa tus datos para continuar con tu compra
      </p>

      <form onSubmit={onGuestSubmit} className="space-y-4">
        {/* Documento Section First (Common Flow) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Select
              label="Tipo de documento"
              name="tipoDocumento"
              value={guestData.tipoDocumento}
              onChange={(e) => {
                const val = e.target.value as any;
                onSetGuestData((prev) => ({
                  ...prev,
                  tipoDocumento: val,
                  numeroDocumento: "", // Limpiar número al cambiar tipo
                  nombre: "",
                  apellido: "",
                }));
                setConsulted(false);
              }}
              error={guestErrors.tipoDocumento}
            >
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
              <option value="CE">Carnet de Extranjería</option>
              <option value="Pasaporte">Pasaporte</option>
            </Select>
          </div>

          <div className="md:col-span-2 relative">
            <div className="relative">
              <Input
                label="Número de Documento"
                type="text"
                name="numeroDocumento"
                value={guestData.numeroDocumento}
                onChange={handleInputChange}
                placeholder={
                  guestData.tipoDocumento === "RUC" ? "20100000001" : "74218601"
                }
                maxLength={
                  guestData.tipoDocumento === "DNI"
                    ? 8
                    : guestData.tipoDocumento === "RUC"
                      ? 11
                      : 15
                }
                error={guestErrors.numeroDocumento}
                className="pr-12"
              />

              {(guestData.tipoDocumento === "DNI" ||
                guestData.tipoDocumento === "RUC") && (
                  <button
                    type="button"
                    onClick={handleConsultacion}
                    disabled={isConsulting || !guestData.numeroDocumento}
                    className="absolute right-2 top-[38px] text-primary hover:text-primary-dark disabled:text-gray-300 p-1"
                    title="Consultar"
                  >
                    {isConsulting ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        className="w-6 h-6"
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
                    )}
                  </button>
                )}
            </div>
          </div>
        </div>

        {/* Datos Personales */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label={`Nombre ${guestData.tipoDocumento === "RUC" ? "(Razón Social)" : ""}`}
              type="text"
              name="nombre"
              value={guestData.nombre}
              onChange={handleInputChange}
              placeholder="Nombres"
              error={guestErrors.nombre}
            />
          </div>
          <div>
            <Input
              label="Apellido"
              type="text"
              name="apellido"
              value={guestData.apellido}
              onChange={handleInputChange}
              placeholder="Apellidos"
              error={guestErrors.apellido}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            value={guestData.email}
            onChange={onGuestChange}
            placeholder="ejemplo@correo.com"
            error={guestErrors.email}
          />
        </div>

        {/* Teléfonos */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Celular"
              type="tel"
              name="celular"
              value={guestData.celular}
              onChange={handleInputChange}
              placeholder="973 820 088"
              error={guestErrors.celular}
            />
          </div>
          <div>
            <Input
              label="Teléfono opcional"
              type="tel"
              name="telefonoOpcional"
              value={guestData.telefonoOpcional}
              onChange={handleInputChange}
              placeholder="973 820 088"
            />
          </div>
        </div>

        {/* Ubicación */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select
              label="Departamento"
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
            >
              <option value="">Seleccionar</option>
              {guestLocations.departments.map((d: any) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              label="Provincia"
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
              error={guestErrors.provincia}
            >
              <option value="">Seleccionar</option>
              {guestLocations.provinces.map((p: any) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Select
            label="Distrito"
            name="distrito"
            value={guestData.distrito}
            onChange={(e) => {
              onGuestChange(e);
              guestLocations.handleDistChange(e.target.value);
            }}
            disabled={!guestData.provincia}
            error={guestErrors.distrito}
          >
            <option value="">Seleccionar</option>
            {guestLocations.districts.map((d: any) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Input
            label="Dirección"
            type="text"
            name="direccion"
            value={guestData.direccion}
            onChange={onGuestChange}
            placeholder="Calle rosales 432"
            error={guestErrors.direccion}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Nro. de dpto. / Piso"
              type="text"
              name="numeroDpto"
              value={guestData.numeroDpto}
              onChange={onGuestChange}
              placeholder="101"
              error={guestErrors.numeroDpto}
            />
          </div>
          <div>
            <Input
              label="Referencia"
              type="text"
              name="referencia"
              value={guestData.referencia}
              onChange={onGuestChange}
              placeholder="Frente al parque"
              error={guestErrors.referencia}
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
