import { useState } from "react";
import logger from "@/lib/logger";
import { PiWarningCircleFill } from "react-icons/pi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { GuestDataSchemaType } from "@/lib/guestDataSchema";
import { consultaDNI, consultaRUC } from "@/lib/general";
import { showToast } from "@/lib/notifications";
import { DeliveryZone } from "@/lib/cart";
import { useDocumentLookup } from "@/hooks/useDocumentLookup";

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
  setGuestErrors: (
    update: (
      prev: Partial<Record<keyof GuestDataSchemaType, string>>,
    ) => Partial<Record<keyof GuestDataSchemaType, string>>,
  ) => void;
  deliveryZones?: DeliveryZone[];
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
  setGuestErrors,
  deliveryZones,
}: GuestDataFormProps) {
  // Hook for automated lookup
  const {
    isLoading: isConsultingAuto,
    isConsulted: consulted,
    resetConsulted,
  } = useDocumentLookup({
    type: guestData.tipoDocumento,
    number: guestData.numeroDocumento,
    enabled: activeTab === "guest",
    onSuccess: (data) => {
      if (guestData.tipoDocumento === "DNI") {
        onSetGuestData((prev) => ({
          ...prev,
          nombre: data.nombres,
          apellido: `${data.apellido_paterno} ${data.apellido_materno}`,
        }));
      } else if (guestData.tipoDocumento === "RUC") {
        onSetGuestData((prev) => ({
          ...prev,
          nombre: data.nombre_o_razon_social,
          apellido: "No aplica",
          direccion: data.direccion_completa || prev.direccion,
        }));
      }
    },
  });

  const isConsulting = isConsultingAuto;

  if (activeTab !== "guest") return null;

  const handleConsultacion = async () => {
    // Manual fallback if needed, but the hook should handle it
    if (!guestData.numeroDocumento) {
      showToast("Ingresa un número de documento", "error");
      return;
    }
    // We can keep this if the user wants to force a re-check or the debounce is too slow
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (e.target.name === "numeroDocumento") {
      resetConsulted();
      // Solo limpiar si el tipo es DNI/RUC para permitir edición manual en otros tipos
      if (
        guestData.tipoDocumento === "DNI" ||
        guestData.tipoDocumento === "RUC"
      ) {
        onSetGuestData((prev) => ({
          ...prev,
          nombre: "",
          apellido: "",
          direccion: prev.tipoDocumento === "RUC" ? "" : prev.direccion,
          distrito: prev.tipoDocumento === "RUC" ? "" : prev.distrito,
        }));
      }
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
                // Clear errors for numeroDocumento
                setGuestErrors((prev) => ({
                  ...prev,
                  numeroDocumento: undefined,
                  tipoDocumento: undefined,
                }));
                resetConsulted();
              }}
              error={guestErrors.tipoDocumento}
            >
              <option value="DNI">DNI</option>
              {/* <option value="RUC">RUC</option> */}
              <option value="CE">Carnet de Extranjería</option>
              <option value="PASAPORTE">Pasaporte</option>
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
                  guestData.tipoDocumento === "RUC"
                    ? "20100000001"
                    : guestData.tipoDocumento === "PASAPORTE"
                      ? "A1234567"
                      : "74218601"
                }
                maxLength={
                  guestData.tipoDocumento === "RUC"
                    ? 11
                    : guestData.tipoDocumento === "DNI" ||
                        guestData.tipoDocumento === "PASAPORTE"
                      ? 8
                      : 12
                }
                error={guestErrors.numeroDocumento}
                inputMode={
                  guestData.tipoDocumento === "PASAPORTE" ? "text" : "numeric"
                }
                className="pr-12"
              />

              {(guestData.tipoDocumento === "DNI" ||
                guestData.tipoDocumento === "RUC") && (
                <button
                  type="button"
                  onClick={handleConsultacion}
                  disabled={isConsulting || !guestData.numeroDocumento}
                  className="absolute right-2 top-[35px] text-primary hover:text-primary-dark disabled:text-gray-300 p-1"
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
              placeholder={
                guestData.tipoDocumento === "RUC"
                  ? "No requerido para RUC"
                  : "Apellidos"
              }
              error={guestErrors.apellido}
              disabled={guestData.tipoDocumento === "RUC"}
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
            {deliveryZones && deliveryZones.length > 0
              ? deliveryZones.map((z) => (
                  <option key={z.zoneId} value={z.zoneName}>
                    {z.zoneName}
                  </option>
                ))
              : guestLocations.districts.map((d: any) => (
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
