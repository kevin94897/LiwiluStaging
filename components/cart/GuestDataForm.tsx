import { useState, useEffect } from "react";
import logger from "@/lib/logger";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { GuestDataSchemaType, guestDataSchema } from "@/lib/guestDataSchema";
import { showToast } from "@/lib/notifications";
import { DeliveryZone } from "@/lib/cart";
import { useDocumentLookup } from "@/hooks/useDocumentLookup";

interface GuestDataFormProps {
  activeTab: string;
  /** Initial data to pre-populate the form (e.g., when editing). */
  guestData: GuestDataSchemaType;
  guestLocations: any;
  /** Called only when validation passes; receives the validated, complete data. */
  onGuestSubmit: (validatedData: GuestDataSchemaType) => void;
  onSetActiveTab: (tab: "login" | "registro" | "guest") => void;
  deliveryZones?: DeliveryZone[];
  /** Field-level errors returned by the API after a failed submit. */
  serverErrors?: Partial<Record<string, string>>;
}

export default function GuestDataForm({
  activeTab,
  guestData,
  guestLocations,
  onGuestSubmit,
  onSetActiveTab,
  deliveryZones,
  serverErrors,
}: GuestDataFormProps) {
  // ── Local state ─────────────────────────────────────────────────────────────
  // All edits go to localData, NOT to the parent's guestData.
  // The parent is only updated on a successful (validated) submit.
  const [localData, setLocalData] = useState<GuestDataSchemaType>(() => ({
    ...guestData,
  }));
  const [localErrors, setLocalErrors] = useState<
    Partial<Record<keyof GuestDataSchemaType, string>>
  >({});

  // Merge server-side field errors into localErrors when the parent updates them.
  // This surfaces API validation errors inline on each field after a failed submit.
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setLocalErrors((prev) => ({ ...prev, ...(serverErrors as any) }));
    }
  }, [serverErrors]);

  // ── Document auto-lookup hook ────────────────────────────────────────────────
  const { isLoading: isConsulting, isConsulted, resetConsulted, rucType } = useDocumentLookup({
    type: localData.tipoDocumento,
    number: localData.numeroDocumento,
    enabled: activeTab === "guest",
    onSuccess: (data) => {
      if (localData.tipoDocumento === "DNI") {
        setLocalData((prev) => ({
          ...prev,
          nombre: data.nombres,
          apellido: `${data.apellido_paterno} ${data.apellido_materno}`,
        }));
      } else if (localData.tipoDocumento === "RUC") {
        setLocalData((prev) => ({
          ...prev,
          nombre: data.nombre_o_razon_social,
          apellido: "No aplica",
          direccion: data.direccion_completa || prev.direccion,
        }));
      }
    },
  });

  if (activeTab !== "guest") return null;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    let { name, value } = e.target;

    // Sanitise & clamp numeric fields
    if (
      name === "numeroDocumento" ||
      name === "celular" ||
      name === "telefonoOpcional"
    ) {
      if (
        name === "numeroDocumento" &&
        localData.tipoDocumento === "PASAPORTE"
      ) {
        value = value.replace(/[^a-zA-Z0-9]/g, "");
      } else {
        value = value.replace(/\D/g, "");
      }

      let maxLength = 20;
      if (name === "numeroDocumento") {
        maxLength =
          localData.tipoDocumento === "RUC"
            ? 11
            : localData.tipoDocumento === "DNI" ||
              localData.tipoDocumento === "PASAPORTE"
              ? 8
              : 12;
      } else if (name === "celular" || name === "telefonoOpcional") {
        maxLength = 9;
      }
      if (value.length > maxLength) value = value.slice(0, maxLength);
    }

    // When document number changes, reset auto-filled name/apellido
    if (name === "numeroDocumento") {
      resetConsulted();
      if (
        localData.tipoDocumento === "DNI" ||
        localData.tipoDocumento === "RUC"
      ) {
        setLocalData((prev) => ({
          ...prev,
          numeroDocumento: value,
          nombre: "",
          apellido: "",
          direccion: prev.tipoDocumento === "RUC" ? "" : prev.direccion,
          distrito: prev.tipoDocumento === "RUC" ? "" : prev.distrito,
        }));
        setLocalErrors((prev) => ({ ...prev, [name]: undefined }));
        return;
      }
    }

    setLocalData((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate locally — parent guestData is NOT touched until this passes
    const result = guestDataSchema.safeParse(localData);

    if (!result.success) {
      const formatted = result.error.flatten().fieldErrors;
      const newErrors: Partial<Record<keyof GuestDataSchemaType, string>> = {};
      for (const key in formatted) {
        const arr = formatted[key as keyof typeof formatted];
        if (arr && arr.length > 0) {
          newErrors[key as keyof GuestDataSchemaType] = arr[0];
        }
      }
      setLocalErrors(newErrors);
      logger.log("Errores de validación en formulario invitado:", newErrors);
      return;
    }

    // All good — hand validated data to parent
    setLocalErrors({});
    onGuestSubmit(result.data);
  };

  return (
    <div className="animate-fade-in max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
        Ingresa tus datos
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Completa tus datos para continuar con tu compra
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Documento Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Select
              label="Tipo de documento"
              name="tipoDocumento"
              value={localData.tipoDocumento}
              onChange={(e) => {
                const val = e.target.value as GuestDataSchemaType["tipoDocumento"];
                resetConsulted();
                setLocalData((prev) => ({
                  ...prev,
                  tipoDocumento: val,
                  numeroDocumento: "",
                  nombre: "",
                  apellido: "",
                }));
                setLocalErrors((prev) => ({
                  ...prev,
                  tipoDocumento: undefined,
                  numeroDocumento: undefined,
                }));
              }}
              error={localErrors.tipoDocumento}
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
                value={localData.numeroDocumento}
                onChange={handleChange}
                placeholder={
                  localData.tipoDocumento === "RUC"
                    ? "20100000001"
                    : localData.tipoDocumento === "PASAPORTE"
                      ? "A1234567"
                      : "74218601"
                }
                maxLength={
                  localData.tipoDocumento === "RUC"
                    ? 11
                    : localData.tipoDocumento === "DNI" ||
                      localData.tipoDocumento === "PASAPORTE"
                      ? 8
                      : 12
                }
                error={localErrors.numeroDocumento}
                inputMode={
                  localData.tipoDocumento === "PASAPORTE" ? "text" : "numeric"
                }
                className="pr-12"
              />

              {(localData.tipoDocumento === "DNI" ||
                localData.tipoDocumento === "RUC") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!localData.numeroDocumento) {
                        showToast("Ingresa un número de documento", "error");
                      }
                    }}
                    disabled={isConsulting || !localData.numeroDocumento}
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
              label={`Nombre ${localData.tipoDocumento === "RUC" ? "(Razón Social)" : ""}`}
              type="text"
              name="nombre"
              value={localData.nombre}
              onChange={handleChange}
              placeholder="Nombres"
              error={localErrors.nombre}
              disabled={(isConsulted && localData.tipoDocumento === "DNI") || rucType === "10" || rucType === "20"}
            />
          </div>
          <div>
            <Input
              label="Apellido"
              type="text"
              name="apellido"
              value={localData.apellido}
              onChange={handleChange}
              placeholder={
                localData.tipoDocumento === "RUC"
                  ? "No requerido para RUC"
                  : "Apellidos"
              }
              error={localErrors.apellido}
              disabled={localData.tipoDocumento === "RUC" || (isConsulted && localData.tipoDocumento === "DNI")}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            value={localData.email}
            onChange={handleChange}
            placeholder="ejemplo@correo.com"
            error={localErrors.email}
          />
        </div>

        {/* Teléfonos */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Celular"
              type="tel"
              name="celular"
              value={localData.celular}
              onChange={handleChange}
              placeholder="973 820 088"
              error={localErrors.celular}
            />
          </div>
          <div>
            <Input
              label="Celular (secundario)"
              type="tel"
              name="telefonoOpcional"
              value={localData.telefonoOpcional}
              onChange={handleChange}
              placeholder="973 820 088"
              error={localErrors.telefonoOpcional}
            />
          </div>
        </div>

        {/* Ubicación */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select
              label="Departamento"
              name="departamento"
              value={localData.departamento}
              onChange={(e) => {
                const val = e.target.value;
                setLocalData((prev) => ({
                  ...prev,
                  departamento: val,
                  provincia: "",
                  distrito: "",
                }));
                setLocalErrors((prev) => ({
                  ...prev,
                  departamento: undefined,
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
              value={localData.provincia}
              onChange={(e) => {
                const val = e.target.value;
                setLocalData((prev) => ({
                  ...prev,
                  provincia: val,
                  distrito: "",
                }));
                setLocalErrors((prev) => ({ ...prev, provincia: undefined }));
                guestLocations.handleProvChange(val);
              }}
              error={localErrors.provincia}
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
            value={localData.distrito}
            onChange={(e) => {
              const val = e.target.value;
              setLocalData((prev) => ({ ...prev, distrito: val }));
              setLocalErrors((prev) => ({ ...prev, distrito: undefined }));
              guestLocations.handleDistChange(val);
            }}
            disabled={!localData.provincia}
            error={localErrors.distrito}
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
            value={localData.direccion}
            onChange={handleChange}
            placeholder="Calle rosales 432"
            error={localErrors.direccion}
            disabled={rucType === "20"}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Nro. de dpto. / Piso"
              type="text"
              name="numeroDpto"
              value={localData.numeroDpto}
              onChange={handleChange}
              placeholder="101"
              error={localErrors.numeroDpto}
            />
          </div>
          <div>
            <Input
              label="Referencia"
              type="text"
              name="referencia"
              value={localData.referencia}
              onChange={handleChange}
              placeholder="Frente al parque"
              error={localErrors.referencia}
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
