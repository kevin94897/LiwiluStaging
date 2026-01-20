import { FaPencil } from "react-icons/fa6";
import { AutorizacionSchemaType } from "@/lib/autorizacionSchema";

interface AuthorizedPersonInfoProps {
  metodoEnvio: "delivery" | "retiro" | null;
  autorizacionData: AutorizacionSchemaType | null;
  onEdit: () => void;
}

export default function AuthorizedPersonInfo({
  metodoEnvio,
  autorizacionData,
  onEdit,
}: AuthorizedPersonInfoProps) {
  if (metodoEnvio !== "retiro") return null;

  return (
    <div className="bg-white rounded-sm shadow-md p-6 animate-fade-in mt-6">
      <h2 className="text-lg font-semibold mb-2 text-primary-dark">
        Persona autorizada a retirar
      </h2>
      <div className="">
        <div className="flex items-center justify-between mb-3">
          <div className="text-dark text-sm space-y-1">
            {autorizacionData ? (
              <>
                <p>Nombre: {autorizacionData.fullName}</p>
                <p>
                  {autorizacionData.documentType}:{" "}
                  {autorizacionData.documentNumber}
                </p>
              </>
            ) : (
              <p className="text-gray-500 italic">No asignado</p>
            )}
          </div>
          <button
            onClick={onEdit}
            className="text-primary text-sm hover:text-primary-dark flex items-center gap-1"
          >
            <FaPencil className="text-sm" />{" "}
            {autorizacionData ? "Editar" : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
