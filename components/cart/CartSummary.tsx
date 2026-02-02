import Link from "next/link";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { CartCarrier } from "@/lib/cart";

interface CartSummaryProps {
  couponCode: string;
  onCouponCodeChange: (code: string) => void;
  subtotal: number;
  total: number;
  envio: number;
  totalSavings: number;
  selectedCarrier: CartCarrier | null;
  metodoEnvio: "delivery" | "retiro" | null;
  acceptTerms: boolean;
  onAcceptTermsChange: (checked: boolean) => void;
  acceptNewsletter: boolean;
  onAcceptNewsletterChange: (checked: boolean) => void;
  isValidatingStock: boolean;
  tiendaSeleccionada: string | null;
  onCheckout: () => void;
}

export default function CartSummary({
  couponCode,
  onCouponCodeChange,
  subtotal,
  total,
  envio,
  totalSavings,
  selectedCarrier,
  metodoEnvio,
  acceptTerms,
  onAcceptTermsChange,
  acceptNewsletter,
  onAcceptNewsletterChange,
  isValidatingStock,
  tiendaSeleccionada,
  onCheckout,
}: CartSummaryProps) {
  return (
    <div className="lg:col-span-1 z-10 space-y-6">
      {/* === SECCIÓN CUPÓN === */}
      <div className="bg-white rounded-sm shadow-lg p-6 animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">Código de cupón</h3>

        <div className="flex flex-col sm:flex-row md:gap-0 gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => onCouponCodeChange(e.target.value)}
            placeholder="Ingresa tu cupón"
            className="w-full px-4 py-2 border border-gray-300 rounded-full md:rounded-r-none md:rounded-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />

          <button className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2 md:rounded-l-none rounded-full md:rounded-sm border border-primary transition-colors">
            Aplicar
          </button>
        </div>
      </div>

      {/* === SECCIÓN RESUMEN === */}
      <div className="bg-white rounded-sm shadow-lg p-6 lg:sticky lg:top-32 animate-fade-in">
        <h2 className="text-xl font-semibold mb-6">Resumen del pedido</h2>

        {/* Detalle */}
        <div className="space-y-3 mb-6 pb-6 border-b">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold">
              {formatPrice(subtotal.toString())}
            </span>
          </div>

          {totalSavings > 0 && (
            <div className="flex justify-between text-primary animate-pulse">
              <span>Ahorro total</span>
              <span className="font-semibold">
                -{formatPrice(totalSavings.toString())}
              </span>
            </div>
          )}

          <div className="flex justify-between text-gray-600">
            <span>Envío ({selectedCarrier?.name || "Pendiente"})</span>
            <span className="font-semibold">
              {envio === 0 ? (
                <span className="text-primary">Gratis ✓</span>
              ) : (
                formatPrice(envio.toString())
              )}
            </span>
          </div>

          {metodoEnvio === "delivery" && selectedCarrier?.isFree && (
            <p className="text-xs text-primary font-medium">
              ¡Este método de envío es gratuito!
            </p>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between text-2xl font-semibold mb-6">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total.toString())}</span>
        </div>

        {/* Términos */}
        <div className="space-y-3 mb-6 pb-6 border-b">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => onAcceptTermsChange(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <label
              htmlFor="acceptTerms"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Acepto los{" "}
              <Link
                href="/terminos-y-condiciones"
                className="text-primary hover:underline"
                target="_blank"
              >
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link
                href="/politicas/envio-y-recojo"
                className="text-primary hover:underline"
                target="_blank"
              >
                Política de Privacidad
              </Link>
            </label>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="acceptNewsletter"
              checked={acceptNewsletter}
              onChange={(e) => onAcceptNewsletterChange(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <label
              htmlFor="acceptNewsletter"
              className="text-sm text-gray-500 cursor-pointer"
            >
              Quiero recibir ofertas y beneficios exclusivos
            </label>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="primary"
          size="md"
          className="w-full mb-3 flex justify-center items-center gap-2"
          disabled={
            (metodoEnvio === "retiro" && !tiendaSeleccionada) ||
            isValidatingStock
          }
          onClick={onCheckout}
        >
          {isValidatingStock ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Validando stock...
            </div>
          ) : (
            "Finalizar compra"
          )}
        </Button>

        <Button
          href="/productos"
          variant="outline"
          size="md"
          className="w-full"
        >
          Seguir comprando
        </Button>
      </div>
    </div>
  );
}
