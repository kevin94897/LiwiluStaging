import { FaTimesCircle } from "react-icons/fa";
import Button from "../ui/Button";

interface StockModalsProps {
  showSavarModal: boolean;
  onCloseSavar: () => void;
  showPickupModal: boolean;
  onClosePickup: () => void;
  showValidationModal?: boolean;
  onCloseValidation?: () => void;
  validationMessage?: string;
}

export default function StockModals({
  showSavarModal,
  onCloseSavar,
  showPickupModal,
  onClosePickup,
  showValidationModal = false,
  onCloseValidation = () => { },
  validationMessage = "",
}: StockModalsProps) {
  return (
    <>
      {/* Validation Error Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimesCircle className="text-yellow-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Datos incompletos
              </h3>
              <p className="text-gray-600 mb-6">
                Es necesario que completes todos tus datos (DNI, Celular, Dirección de envío, etc.) para continuar con la compra.
              </p>
              <Button variant="primary" size="md" onClick={onCloseValidation}>
                Entendido, completar datos
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Savar Stock Modal */}
      {showSavarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimesCircle className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Productos sin stock para despacho
              </h3>
              <p className="text-gray-600 mb-6">
                Debes eliminar los productos que no tengan stock en el carrito
                para poder continuar con el checkout.
              </p>
              <Button variant="primary" size="md" onClick={onCloseSavar}>Entendido, ir al carrito</Button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Stock Modal */}
      {showPickupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimesCircle className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Productos sin stock en tienda
              </h3>
              <p className="text-gray-600 mb-6">
                Algunos productos no están disponibles en la tienda
                seleccionada. Debes eliminarlos o elegir otra tienda para
                continuar.
              </p>
              <Button variant="primary" size="md" onClick={onClosePickup}>Entendido, ir al carrito</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
