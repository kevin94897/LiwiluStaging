import { FaTimesCircle } from "react-icons/fa";

interface StockModalsProps {
  showSavarModal: boolean;
  onCloseSavar: () => void;
  showPickupModal: boolean;
  onClosePickup: () => void;
}

export default function StockModals({
  showSavarModal,
  onCloseSavar,
  showPickupModal,
  onClosePickup,
}: StockModalsProps) {
  return (
    <>
      {/* Savar Stock Modal */}
      {showSavarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimesCircle className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Productos sin stock para despacho
              </h3>
              <p className="text-gray-600 mb-6">
                Debes eliminar los productos que no tengan stock en el carrito
                para poder continuar con el checkout.
              </p>
              <button
                onClick={onCloseSavar}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Entendido, ir al carrito
              </button>
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Productos sin stock en tienda
              </h3>
              <p className="text-gray-600 mb-6">
                Algunos productos no están disponibles en la tienda
                seleccionada. Debes eliminarlos o elegir otra tienda para
                continuar.
              </p>
              <button
                onClick={onClosePickup}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Entendido, ir al carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
