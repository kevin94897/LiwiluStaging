import { useState } from "react";
import logger from '@/lib/logger';
import { GuestDataSchemaType } from "@/lib/guestDataSchema";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { PiWarningCircleFill } from "react-icons/pi";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

interface GuestDataSummaryProps {
  isGuest: boolean;
  isLoggedIn?: boolean;
  guestDataCompleted: boolean;
  guestData: GuestDataSchemaType;
  userData?: any;
  userAddress?: any;
  onEdit: () => void;
  onSave?: (data: any) => Promise<void>;
  validationErrors?: Record<string, string>;
}

export default function GuestDataSummary({
  isGuest,
  isLoggedIn,
  guestDataCompleted,
  guestData,
  userData,
  userAddress,
  onEdit,
  onSave,
  validationErrors = {},
}: GuestDataSummaryProps) {
  // Show if guest completed OR user logged in
  if (!(isGuest && guestDataCompleted) && !isLoggedIn) return null;

  const showUser = isLoggedIn && userData;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    documentType: userData?.documentType || "DNI",
    documentNumber: userData?.documentNumber || "",
    phone: userData?.phone || "",
  });
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Auto-enter edit mode if there are validation errors
  const hasErrors = Object.keys(validationErrors).length > 0;
  if (hasErrors && !isEditing && isLoggedIn) {
    setIsEditing(true);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    setLocalErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (formData.documentType === "Pasaporte") {
      value = value.replace(/[^a-zA-Z0-9]/g, "");
    } else {
      value = value.replace(/\D/g, "");
    }

    const maxLength =
      formData.documentType === "RUC"
        ? 11
        : formData.documentType === "DNI" || formData.documentType === "Pasaporte"
          ? 8
          : 12; // CE max 12

    if (value.length > maxLength) value = value.slice(0, maxLength);

    setFormData((prev) => ({ ...prev, documentNumber: value }));
    setLocalErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.documentNumber;
      // Also delete mapped error key if exists (optional but safe)
      delete newErrors.numeroDocumento;
      return newErrors;
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 9) value = value.slice(0, 9);
    setFormData((prev) => ({ ...prev, phone: value }));
    setLocalErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.phone;
      return newErrors;
    });
  };

  const handleSave = async () => {
    if (!onSave) return;

    // Validate all required fields
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "El nombre es obligatorio";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "El apellido es obligatorio";
    }

    if (!formData.documentType) {
      errors.documentType = "El tipo de documento es obligatorio";
    }

    if (!formData.documentNumber.trim()) {
      errors.documentNumber = "El número de documento es obligatorio";
    } else {
      // Validate document number length based on type
      const docNum = formData.documentNumber;
      if (formData.documentType === "DNI" && docNum.length !== 8) {
        errors.documentNumber = "El DNI debe tener 8 dígitos";
      } else if (formData.documentType === "RUC" && docNum.length !== 11) {
        errors.documentNumber = "El RUC debe tener 11 dígitos";
      } else if (docNum.length < 6) {
        errors.documentNumber =
          "El número de documento debe tener al menos 6 caracteres";
      }
    }

    if (!formData.phone.trim()) {
      errors.phone = "El celular es obligatorio";
    } else if (formData.phone.length !== 9) {
      errors.phone = "El celular debe tener 9 dígitos";
    } else if (!formData.phone.startsWith("9")) {
      errors.phone = "El celular debe comenzar con 9";
    }

    // If there are validation errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      setIsEditing(false);
      setLocalErrors({});
    } catch (error: any) {
      logger.error("Error saving user data:", error);
      if (error.fieldErrors) {
        setLocalErrors(error.fieldErrors);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      documentType: userData?.documentType || "DNI",
      documentNumber: userData?.documentNumber || "",
      phone: userData?.phone || "",
    });
    setLocalErrors({});
  };

  const displayErrors = { ...validationErrors, ...localErrors };

  return (
    <div className="bg-white rounded-sm shadow-md p-6 mt-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Datos de contacto
        </h2>
        {/* Edit button for logged-in users */}
        {isLoggedIn && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-primary text-sm hover:text-primary-dark flex items-center gap-1 font-medium bg-primary/5 px-3 py-1 rounded-full transition-colors"
          >
            <FaEdit className="text-sm" /> Editar
          </button>
        )}
        {/* Guest edit button */}
        {isGuest && !isLoggedIn && (
          <button
            onClick={onEdit}
            className="text-primary text-sm hover:text-primary-dark flex items-center gap-1 font-medium bg-primary/5 px-3 py-1 rounded-full transition-colors"
          >
            <FaEdit className="text-sm" /> Editar datos
          </button>
        )}
      </div>

      {/* Edit Mode for Logged Users */}
      {isLoggedIn && isEditing ? (
        <div className="space-y-4">
          {hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-3 mb-4">
              <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                <PiWarningCircleFill size={18} />
                Por favor, completa los datos requeridos para continuar.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre *"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={displayErrors.firstName}
              disabled={isSaving}
            />
            <Input
              label="Apellido *"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder={
                formData.documentType === "RUC"
                  ? "No requerido para RUC"
                  : undefined
              }
              error={displayErrors.lastName}
              disabled={isSaving || formData.documentType === "RUC"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de documento *"
              name="documentType"
              value={formData.documentType}
              onChange={(e) => {
                handleChange(e);
                const newDocType = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  documentNumber: "",
                  // Auto-fill lastName with "No aplica" for RUC to avoid empty submission
                  lastName: newDocType === "RUC" ? "No aplica" : prev.lastName
                }));
                setLocalErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.documentNumber;
                  delete newErrors.numeroDocumento;
                  return newErrors;
                });
              }}
              error={displayErrors.documentType}
              disabled={isSaving}
            >
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
              <option value="CE">Carnet de Extranjería</option>
              <option value="Pasaporte">Pasaporte</option>
            </Select>
            <Input
              label="Número de documento *"
              type="text"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleDocumentChange}
              error={
                displayErrors.documentNumber || displayErrors.numeroDocumento
              }
              disabled={isSaving}
              placeholder={
                formData.documentType === "RUC"
                  ? "20100000001"
                  : formData.documentType === "Pasaporte"
                    ? "A1234567"
                    : "74218601"
              }
              maxLength={
                formData.documentType === "RUC"
                  ? 11
                  : formData.documentType === "DNI" || formData.documentType === "Pasaporte"
                    ? 8
                    : 12
              }
              inputMode={
                formData.documentType === "Pasaporte" ? "text" : "numeric"
              }
            />
          </div>

          <Input
            label="Celular *"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            error={displayErrors.phone || displayErrors.celular}
            disabled={isSaving}
            placeholder="987654321"
          />

          <div className="bg-gray-50 border border-gray-200 rounded-sm p-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Email:</span>{" "}
              {userData?.email || "-"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Para cambiar tu correo, ve a{" "}
              <Link
                href="/mi-cuenta/mis-datos"
                className="text-primary hover:underline"
              >
                Mi Cuenta
              </Link>
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </span>
              ) : (
                <>
                  <FaSave className="inline mr-1" /> Guardar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <FaTimes className="inline mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Información Personal
            </p>
            <div className="text-sm text-gray-800 space-y-1">
              {showUser ? (
                <>
                  <p className="font-semibold text-base">
                    {userData.firstName || userData.name} {userData.lastName}
                  </p>
                  <p>
                    <span className="text-gray-500">
                      {userData.documentType || userData.tipoDocumento || "DNI"}
                      :
                    </span>{" "}
                    {userData.documentNumber || userData.numeroDocumento || "-"}
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    {userData.email}
                  </p>
                  <p>
                    <span className="text-gray-500">Celular:</span>{" "}
                    {userData.phone ||
                      userData.celular ||
                      userAddress?.phone ||
                      "-"}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-base">
                    {guestData.nombre} {guestData.apellido}
                  </p>
                  <p>
                    <span className="text-gray-500">
                      {guestData.tipoDocumento}:
                    </span>{" "}
                    {guestData.numeroDocumento}
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    {guestData.email}
                  </p>
                  <p>
                    <span className="text-gray-500">Celular:</span>{" "}
                    {guestData.celular}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Dirección de Entrega */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Dirección principal
            </p>
            <div className="text-sm text-gray-800 space-y-1">
              {showUser && userAddress ? (
                <>
                  <p className="font-semibold">
                    {userAddress.address}{" "}
                    {userAddress.apartment && ` - ${userAddress.apartment}`}
                  </p>
                  <p>
                    {userAddress.district}, {userAddress.province},{" "}
                    {userAddress.department}
                  </p>
                  {userAddress.reference && (
                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-sm border-l-2 border-gray-200">
                      <span className="font-medium not-italic">Ref:</span>{" "}
                      {userAddress.reference}
                    </p>
                  )}
                </>
              ) : showUser && !userAddress ? (
                <p className="text-gray-500 italic">
                  Sin dirección principal configurada
                </p>
              ) : (
                <>
                  <p className="font-semibold">
                    {guestData.direccion} {guestData.numeroDpto}
                  </p>
                  <p>
                    {guestData.distrito}, {guestData.provincia},{" "}
                    {guestData.departamento}
                  </p>
                  {guestData.referencia && (
                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-sm border-l-2 border-gray-200">
                      <span className="font-medium not-italic">Ref:</span>{" "}
                      {guestData.referencia}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
