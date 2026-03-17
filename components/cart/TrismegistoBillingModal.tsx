// components/cart/TrismegistoBillingModal.tsx
"use client";

import { useState } from "react";
import { useLocations } from "@/hooks/useLocations";
import { useDocumentLookup } from "@/hooks/useDocumentLookup";
import { PERU_LOCATIONS } from "@/lib/locationsComplete";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { showToast } from "@/lib/notifications";
import {
  initiateTrismegistoPayment,
  InvoiceDataBoleta,
  InvoiceDataFactura,
} from "@/lib/trimegisto";
import { PiWarningCircleFill, PiCheckCircleFill, PiEnvelopeFill, PiX } from "react-icons/pi";
import { FaSpinner } from "react-icons/fa";
import { formatPrice } from "@/lib/utils";

type TipoComprobante = "boleta" | "factura";

// Normaliza texto de ubicación que viene UPPERCASE del API a Title Case
const findMatchingLocation = (input: string, options: string[]): string | undefined => {
  if (!input) return undefined;
  const inputLower = input.toLowerCase();
  return options.find((opt) => opt.toLowerCase() === inputLower);
};

interface TrismegistoBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  balanceAmount: number;
  installments: number;
  cartTotal: number;
}

interface SuccessState {
  preOrderId: string;
  expiresAt: string;
}

export default function TrismegistoBillingModal({
  isOpen,
  onClose,
  balanceAmount,
  installments,
  cartTotal,
}: TrismegistoBillingModalProps) {
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>("boleta");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successState, setSuccessState] = useState<SuccessState | null>(null);

  // ── Datos Boleta ─────────────────────────────────────────
  const [datosBoleta, setDatosBoleta] = useState({
    tipoDocumento: "DNI",
    numeroDocumento: "",
    nombres: "",
    apellidos: "",
    direccion: "",
    departamento: "Lima",
    provincia: "Lima",
    distrito: "",
  });

  // ── Datos Factura ────────────────────────────────────────
  const [datosFactura, setDatosFactura] = useState({
    ruc: "",
    razonSocial: "",
    direccionFiscal: "",
    departamento: "Lima",
    provincia: "Lima",
    distrito: "",
  });

  // ── Hooks de ubicación ───────────────────────────────────
  const boletaLocations = useLocations(
    datosBoleta.departamento,
    datosBoleta.provincia,
    datosBoleta.distrito,
  );

  const facturaLocations = useLocations(
    datosFactura.departamento,
    datosFactura.provincia,
    datosFactura.distrito,
  );

  // ── Auto-lookup DNI ──────────────────────────────────────
  const {
    isLoading: isConsultingDni,
    isConsulted: boletaConsulted,
    resetConsulted: resetBoletaConsulted,
  } = useDocumentLookup({
    type: datosBoleta.tipoDocumento,
    number: datosBoleta.numeroDocumento,
    enabled: tipoComprobante === "boleta" && datosBoleta.tipoDocumento === "DNI",
    onSuccess: (data) => {
      if (datosBoleta.tipoDocumento === "DNI") {
        setDatosBoleta((prev) => ({
          ...prev,
          nombres: data.nombres || "",
          apellidos: `${data.apellido_paterno || ""} ${data.apellido_materno || ""}`.trim(),
        }));
      }
    },
  });

  // ── Auto-lookup RUC ──────────────────────────────────────
  const {
    isLoading: isConsultingRuc,
    isConsulted: rucConsulted,
    resetConsulted: resetRucConsulted,
  } = useDocumentLookup({
    type: "RUC",
    number: datosFactura.ruc,
    enabled: tipoComprobante === "factura",
    onSuccess: (data) => {
      let normalizedDept = datosFactura.departamento;
      let normalizedProv = datosFactura.provincia;
      let normalizedDist = datosFactura.distrito;

      if (data.departamento) {
        const departments = Object.keys(PERU_LOCATIONS);
        const matchDept = findMatchingLocation(data.departamento, departments);
        if (matchDept) {
          normalizedDept = matchDept;
          if (data.provincia) {
            const provinces = Object.keys(PERU_LOCATIONS[matchDept] || {});
            const matchProv = findMatchingLocation(data.provincia, provinces);
            if (matchProv) {
              normalizedProv = matchProv;
              if (data.distrito) {
                const districts = PERU_LOCATIONS[matchDept][matchProv] || [];
                const matchDist = findMatchingLocation(data.distrito, districts);
                if (matchDist) normalizedDist = matchDist;
              }
            }
          }
        }
      }

      setDatosFactura((prev) => ({
        ...prev,
        razonSocial: data.nombre_o_razon_social || "",
        direccionFiscal: data.direccion_completa || prev.direccionFiscal,
        departamento: normalizedDept,
        provincia: normalizedProv,
        distrito: normalizedDist,
      }));

      if (normalizedDept && normalizedProv && normalizedDist) {
        facturaLocations.setLocationValues(normalizedDept, normalizedProv, normalizedDist);
      }
    },
  });

  // ── Validación ───────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (tipoComprobante === "boleta") {
      if (!datosBoleta.numeroDocumento) {
        newErrors.numeroDocumento = "El número de documento es obligatorio";
      } else {
        if (datosBoleta.tipoDocumento === "DNI" && datosBoleta.numeroDocumento.length !== 8) {
          newErrors.numeroDocumento = "El DNI debe tener 8 dígitos";
        } else if (
          datosBoleta.tipoDocumento === "CE" &&
          (datosBoleta.numeroDocumento.length < 6 || datosBoleta.numeroDocumento.length > 12)
        ) {
          newErrors.numeroDocumento = "El CE debe tener entre 6 y 12 caracteres";
        } else if (
          datosBoleta.tipoDocumento === "PASAPORTE" &&
          !/^[a-zA-Z][0-9]{7}$/.test(datosBoleta.numeroDocumento)
        ) {
          newErrors.numeroDocumento = "El pasaporte debe tener 1 letra y 7 números";
        }
      }

      if (!datosBoleta.nombres.trim()) newErrors.nombres = "El nombre es obligatorio";
      if (!datosBoleta.apellidos.trim()) newErrors.apellidos = "El apellido es obligatorio";
      if (!datosBoleta.direccion.trim()) newErrors.direccion = "La dirección es obligatoria";
      if (!datosBoleta.departamento) newErrors.departamento = "El departamento es obligatorio";
      if (!datosBoleta.provincia) newErrors.provincia = "La provincia es obligatoria";
      if (!datosBoleta.distrito) newErrors.distrito = "El distrito es obligatorio";
    } else {
      if (!datosFactura.ruc || datosFactura.ruc.length !== 11) {
        newErrors.ruc = "El RUC debe tener 11 dígitos";
      }
      if (!datosFactura.razonSocial.trim()) newErrors.razonSocial = "La razón social es obligatoria";
      if (!datosFactura.direccionFiscal.trim()) newErrors.direccionFiscal = "La dirección fiscal es obligatoria";
      if (!datosFactura.departamento) newErrors.departamento = "El departamento es obligatorio";
      if (!datosFactura.provincia) newErrors.provincia = "La provincia es obligatoria";
      if (!datosFactura.distrito) newErrors.distrito = "El distrito es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Envío ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) {
      showToast("Por favor completa todos los campos requeridos", "error");
      return;
    }
    setIsSubmitting(true);

    try {
      const invoiceData =
        tipoComprobante === "boleta"
          ? ({
              tipoDocumento: datosBoleta.tipoDocumento,
              numeroDocumento: datosBoleta.numeroDocumento,
              nombres: datosBoleta.nombres,
              apellidos: datosBoleta.apellidos,
              direccion: datosBoleta.direccion,
              departamento: datosBoleta.departamento,
              provincia: datosBoleta.provincia,
              distrito: datosBoleta.distrito,
            } as InvoiceDataBoleta)
          : ({
              ruc: datosFactura.ruc,
              razonSocial: datosFactura.razonSocial,
              direccionFiscal: datosFactura.direccionFiscal,
              departamento: datosFactura.departamento,
              provincia: datosFactura.provincia,
              distrito: datosFactura.distrito,
            } as InvoiceDataFactura);

      const response = await initiateTrismegistoPayment(
        balanceAmount,
        installments,
        tipoComprobante === "boleta" ? "BOLETA" : "FACTURA",
        invoiceData,
      );

      setSuccessState({
        preOrderId: response.preOrderId,
        expiresAt: response.expiresAt,
      });
    } catch (error: any) {
      showToast(error.message || "Error al enviar la solicitud", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ── Pantalla de éxito ────────────────────────────────────
  if (successState) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in">
          <div className="flex justify-center mb-5">
            <PiEnvelopeFill className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud enviada!</h2>
          <p className="text-gray-600 mb-6">
            Te enviamos un correo de confirmación. Haz click en el enlace para completar tu compra.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Saldo aplicado:</span>
              <span className="font-semibold text-gray-800">{formatPrice(balanceAmount.toFixed(2))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cuotas:</span>
              <span className="font-semibold text-gray-800">{installments}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ID pre-orden:</span>
              <span className="font-mono text-xs text-gray-600 break-all">{successState.preOrderId}</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 mb-6">
            <p className="text-sm text-amber-800">
              El enlace expira en <strong>24 horas</strong>. Revisa también tu carpeta de spam.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-sm hover:bg-primary/90 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  // ── Formulario ───────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full animate-fade-in mb-8">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Datos de facturación</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Saldo: <span className="font-semibold text-primary">{formatPrice(balanceAmount.toFixed(2))}</span>
              {" · "}{installments} cuota{installments > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <PiX size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Toggle Boleta / Factura */}
          <div className="flex gap-3">
            <button
              onClick={() => { setTipoComprobante("boleta"); setErrors({}); }}
              className={`flex-1 py-2.5 px-4 rounded-sm border-2 font-semibold text-sm transition-all ${
                tipoComprobante === "boleta"
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 text-gray-700 hover:border-primary/50"
              }`}
            >
              Boleta
            </button>
            <button
              onClick={() => { setTipoComprobante("factura"); setErrors({}); }}
              className={`flex-1 py-2.5 px-4 rounded-sm border-2 font-semibold text-sm transition-all ${
                tipoComprobante === "factura"
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 text-gray-700 hover:border-primary/50"
              }`}
            >
              Factura
            </button>
          </div>

          {/* ── FORMULARIO BOLETA ── */}
          {tipoComprobante === "boleta" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Tipo de documento"
                  value={datosBoleta.tipoDocumento}
                  onChange={(e) => {
                    setDatosBoleta({ ...datosBoleta, tipoDocumento: e.target.value, numeroDocumento: "" });
                    resetBoletaConsulted();
                  }}
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">Carnet de Extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </Select>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número</label>
                  <div className="relative">

                    <input
                      type="text"
                      value={datosBoleta.numeroDocumento}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (datosBoleta.tipoDocumento === "PASAPORTE") {
                          value = value.replace(/[^a-zA-Z0-9]/g, "");
                        } else {
                          value = value.replace(/\D/g, "");
                        }
                        setDatosBoleta({ ...datosBoleta, numeroDocumento: value });
                        resetBoletaConsulted();
                      }}
                      placeholder={datosBoleta.tipoDocumento === "PASAPORTE" ? "A1234567" : "12345678"}
                      maxLength={
                        datosBoleta.tipoDocumento === "DNI" || datosBoleta.tipoDocumento === "PASAPORTE"
                          ? 8
                          : 12
                      }
                      className={`w-full px-3 py-2.5 rounded-sm border-2 text-sm transition-all outline-none ${
                        errors.numeroDocumento
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      } ${datosBoleta.tipoDocumento === "DNI" ? "pr-10" : ""}`}
                    />
                    {datosBoleta.tipoDocumento === "DNI" && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {isConsultingDni ? (
                          <FaSpinner size={14} className="animate-spin text-primary" />
                        ) : boletaConsulted ? (
                          <PiCheckCircleFill size={16} className="text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.numeroDocumento && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <PiWarningCircleFill size={12} /> {errors.numeroDocumento}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombres"
                  value={datosBoleta.nombres}
                  onChange={(e) => setDatosBoleta({ ...datosBoleta, nombres: e.target.value })}
                  error={errors.nombres}
                />
                <Input
                  label="Apellidos"
                  value={datosBoleta.apellidos}
                  onChange={(e) => setDatosBoleta({ ...datosBoleta, apellidos: e.target.value })}
                  error={errors.apellidos}
                />
              </div>

              <Input
                label="Dirección"
                value={datosBoleta.direccion}
                onChange={(e) => setDatosBoleta({ ...datosBoleta, direccion: e.target.value })}
                placeholder="Calle, Número, Dpto..."
                error={errors.direccion}
              />

              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="Departamento"
                  value={boletaLocations.selectedDept}
                  onChange={(e) => {
                    boletaLocations.handleDeptChange(e.target.value);
                    setDatosBoleta((prev) => ({ ...prev, departamento: e.target.value, provincia: "", distrito: "" }));
                  }}
                >
                  <option value="">Departamento</option>
                  {boletaLocations.departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
                <Select
                  label="Provincia"
                  value={boletaLocations.selectedProv}
                  disabled={!boletaLocations.selectedDept}
                  onChange={(e) => {
                    boletaLocations.handleProvChange(e.target.value);
                    setDatosBoleta((prev) => ({ ...prev, provincia: e.target.value, distrito: "" }));
                  }}
                >
                  <option value="">Provincia</option>
                  {boletaLocations.provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
                <Select
                  label="Distrito"
                  value={boletaLocations.selectedDist}
                  disabled={!boletaLocations.selectedProv}
                  error={errors.distrito}
                  onChange={(e) => {
                    boletaLocations.handleDistChange(e.target.value);
                    setDatosBoleta((prev) => ({ ...prev, distrito: e.target.value }));
                  }}
                >
                  <option value="">Distrito</option>
                  {boletaLocations.districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
              </div>
            </div>
          )}

          {/* ── FORMULARIO FACTURA ── */}
          {tipoComprobante === "factura" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">RUC</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={datosFactura.ruc}
                      onChange={(e) => {
                        setDatosFactura({ ...datosFactura, ruc: e.target.value.replace(/\D/g, "") });
                        resetRucConsulted();
                      }}
                      placeholder="20123456789"
                      maxLength={11}
                      className={`w-full px-3 py-2.5 border-2 rounded-sm text-sm transition-all outline-none pr-10 ${
                        errors.ruc
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {isConsultingRuc ? (
                        <FaSpinner size={14} className="animate-spin text-primary" />
                      ) : rucConsulted ? (
                        <PiCheckCircleFill size={16} className="text-green-500" />
                      ) : null}
                    </div>
                  </div>
                  {errors.ruc && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <PiWarningCircleFill size={12} /> {errors.ruc}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Razón Social</label>
                  <input
                    type="text"
                    value={datosFactura.razonSocial}
                    onChange={(e) => setDatosFactura({ ...datosFactura, razonSocial: e.target.value })}
                    placeholder="Empresa S.A.C."
                    className={`w-full px-3 py-2.5 border-2 rounded-sm text-sm transition-all outline-none ${
                      errors.razonSocial
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.razonSocial && (
                    <p className="text-red-500 text-xs mt-1">{errors.razonSocial}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección Fiscal</label>
                <input
                  type="text"
                  value={datosFactura.direccionFiscal}
                  onChange={(e) => setDatosFactura({ ...datosFactura, direccionFiscal: e.target.value })}
                  placeholder="Av. Principal 123"
                  className={`w-full px-3 py-2.5 border-2 rounded-sm text-sm transition-all outline-none ${
                    errors.direccionFiscal
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.direccionFiscal && (
                  <p className="text-red-500 text-xs mt-1">{errors.direccionFiscal}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="Departamento"
                  value={facturaLocations.selectedDept}
                  onChange={(e) => {
                    facturaLocations.handleDeptChange(e.target.value);
                    setDatosFactura((prev) => ({ ...prev, departamento: e.target.value, provincia: "", distrito: "" }));
                  }}
                >
                  <option value="">Departamento</option>
                  {facturaLocations.departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
                <Select
                  label="Provincia"
                  value={facturaLocations.selectedProv}
                  disabled={!facturaLocations.selectedDept}
                  onChange={(e) => {
                    facturaLocations.handleProvChange(e.target.value);
                    setDatosFactura((prev) => ({ ...prev, provincia: e.target.value, distrito: "" }));
                  }}
                >
                  <option value="">Provincia</option>
                  {facturaLocations.provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
                <Select
                  label="Distrito"
                  value={facturaLocations.selectedDist}
                  disabled={!facturaLocations.selectedProv}
                  error={errors.distrito}
                  onChange={(e) => {
                    facturaLocations.handleDistChange(e.target.value);
                    setDatosFactura((prev) => ({ ...prev, distrito: e.target.value }));
                  }}
                >
                  <option value="">Distrito</option>
                  {facturaLocations.districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="bg-amber-50 border  rounded-sm p-3">
            <p className="text-sm ">
              Recibirás un correo de confirmación. Haz click en el enlace para completar tu pedido.
            </p>
          </div>

          {/* Botón confirmar */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-sm hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <FaSpinner size={14} className="animate-spin" />
                Enviando...
              </>
            ) : (
              "Confirmar y recibir email"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
