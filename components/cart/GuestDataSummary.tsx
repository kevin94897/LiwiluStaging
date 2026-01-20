import { GuestDataSchemaType } from "@/lib/guestDataSchema";
import { FaPencil } from "react-icons/fa6";

interface GuestDataSummaryProps {
  isGuest: boolean;
  guestDataCompleted: boolean;
  guestData: GuestDataSchemaType;
  onEdit: () => void;
}

export default function GuestDataSummary({
  isGuest,
  guestDataCompleted,
  guestData,
  onEdit,
}: GuestDataSummaryProps) {
  if (!isGuest || !guestDataCompleted) return null;

  return (
    <div className="bg-white rounded-sm shadow-md p-6 mt-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Datos de contacto
        </h2>
        <button
          onClick={onEdit}
          className="text-primary text-sm hover:text-primary-dark flex items-center gap-1 font-medium bg-primary/5 px-3 py-1 rounded-full transition-colors"
        >
          <FaPencil className="text-sm" /> Editar datos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Personal */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Información Personal
          </p>
          <div className="text-sm text-gray-800 space-y-1">
            <p className="font-semibold text-base">
              {guestData.nombre} {guestData.apellido}
            </p>
            <p>
              <span className="text-gray-500">{guestData.tipoDocumento}:</span>{" "}
              {guestData.numeroDocumento}
            </p>
            <p>
              <span className="text-gray-500">Email:</span> {guestData.email}
            </p>
            <p>
              <span className="text-gray-500">Celular:</span>{" "}
              {guestData.celular}
            </p>
          </div>
        </div>

        {/* Dirección de Entrega */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Dirección
          </p>
          <div className="text-sm text-gray-800 space-y-1">
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
          </div>
        </div>
      </div>
    </div>
  );
}
