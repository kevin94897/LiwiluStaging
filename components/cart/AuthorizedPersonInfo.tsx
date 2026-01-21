import { FaPencil, FaUser, FaUserGroup } from "react-icons/fa6";
import { AutorizacionSchemaType } from "@/lib/autorizacionSchema";
import { GuestDataSchemaType } from "@/lib/guestDataSchema";
import Button from "../ui/Button";

interface AuthorizedPersonInfoProps {
  metodoEnvio: "delivery" | "retiro" | null;
  autorizacionData: AutorizacionSchemaType | null;
  onEdit: () => void;
  isLoggedIn: boolean;
  userData: any;
  guestData: GuestDataSchemaType;
  isSelfPickup: boolean;
  onSetIsSelfPickup: (val: boolean) => void;
}

export default function AuthorizedPersonInfo({
  metodoEnvio,
  autorizacionData,
  onEdit,
  isLoggedIn,
  userData,
  guestData,
  isSelfPickup,
  onSetIsSelfPickup,
}: AuthorizedPersonInfoProps) {
  if (metodoEnvio !== "retiro") return null;

  // Consolidate current user info
  const currentUserInfo =
    isLoggedIn && userData
      ? {
          fullName:
            `${userData.firstName || userData.name || ""} ${userData.lastName || ""}`.trim(),
          documentType:
            userData.documentType || userData.tipoDocumento || "DNI",
          documentNumber:
            userData.documentNumber || userData.numeroDocumento || "-",
        }
      : {
          fullName: `${guestData.nombre} ${guestData.apellido}`.trim(),
          documentType: guestData.tipoDocumento || "DNI",
          documentNumber: guestData.numeroDocumento || "-",
        };

  const hasUserInfo =
    currentUserInfo.fullName && currentUserInfo.fullName.length > 2;

  return (
    <div className="bg-white rounded-sm shadow-md p-6 animate-fade-in mt-6">
      <h2 className="text-lg font-semibold mb-6 text-primary-dark border-b pb-2">
        ¿Quién retirará el pedido?
      </h2>

      <div className="space-y-4">
        {/* Opción: Yo mismo */}
        <label
          className={`relative flex items-center p-4 border-2 rounded-sm cursor-pointer transition-all ${
            isSelfPickup
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-gray-100 hover:border-gray-200"
          }`}
        >
          <input
            type="radio"
            name="pickupType"
            className="hidden"
            checked={isSelfPickup}
            onChange={() => onSetIsSelfPickup(true)}
          />
          <div className="flex items-center gap-4 w-full">
            <div
              className={`p-3 rounded-full ${isSelfPickup ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}
            >
              <FaUser className="text-xl" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Retiraré yo mismo</p>
              {hasUserInfo && (
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">
                    {currentUserInfo.fullName}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    {currentUserInfo.documentType}:{" "}
                    {currentUserInfo.documentNumber}
                  </span>
                </div>
              )}
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelfPickup ? "border-primary" : "border-gray-300"}`}
            >
              {isSelfPickup && (
                <div className="w-3 h-3 rounded-full bg-primary" />
              )}
            </div>
          </div>
        </label>

        {/* Opción: Alguien más */}
        <div className="space-y-4">
          <label
            className={`relative flex items-center p-4 border-2 rounded-sm cursor-pointer transition-all ${
              !isSelfPickup
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <input
              type="radio"
              name="pickupType"
              className="hidden"
              checked={!isSelfPickup}
              onChange={() => onSetIsSelfPickup(false)}
            />
            <div className="flex items-center gap-4 w-full">
              <div
                className={`p-3 rounded-full ${!isSelfPickup ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}
              >
                <FaUserGroup className="text-xl" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">
                  Autorizar a otra persona
                </p>
                <p className="text-sm text-gray-500">
                  Alguien más recogerá mi pedido
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${!isSelfPickup ? "border-primary" : "border-gray-300"}`}
              >
                {!isSelfPickup && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </div>
            </div>
          </label>

          {/* Datos de la otra persona (solo si está seleccionado) */}
          {!isSelfPickup && (
            <div className="ml-4 pl-6 border-l-2 border-primary/20 animate-fade-in">
              <div className="bg-gray-50 rounded-sm p-4 flex items-center justify-between group">
                <div className="text-sm space-y-1">
                  {autorizacionData ? (
                    <>
                      <p className="font-bold text-gray-900">
                        {autorizacionData.fullName}
                      </p>
                      <p className="text-gray-600">
                        {autorizacionData.documentType}:{" "}
                        {autorizacionData.documentNumber}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">
                      No se han ingresado datos
                    </p>
                  )}
                </div>
                <Button
                  onClick={onEdit}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FaPencil />{" "}
                  {autorizacionData ? "Cambiar datos" : "Ingresar datos"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
